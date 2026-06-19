import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 60;

async function isPro(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) return false;
  const { data } = await supabaseAdmin
    .from('subscribers')
    .select('status')
    .eq('email', email.toLowerCase())
    .single();
  return data?.status === 'active';
}

export async function POST(req: NextRequest) {
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: 'scraping_not_configured' }, { status: 500 });

  if (!(await isPro())) return NextResponse.json({ error: 'pro_required' }, { status: 402 });

  let url = '';
  try { url = (await req.json()).url ?? ''; } catch {}
  if (!/instagram\.com\/(reel|reels|p|tv)\//.test(url)) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directUrls: [url], resultsType: 'posts', resultsLimit: 1, addParentData: false }),
      }
    );
    if (!res.ok) return NextResponse.json({ error: 'scrape_failed' }, { status: 502 });
    const items = await res.json();
    const it = Array.isArray(items) ? items[0] : null;
    if (!it) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const videoUrl = it.videoUrl ?? null;
    if (!videoUrl) return NextResponse.json({ error: 'not_a_video' }, { status: 422 });

    return NextResponse.json({
      videoUrl,
      caption: it.caption ?? '',
      username: it.ownerUsername ?? '',
      likes: it.likesCount ?? null,
      views: it.videoViewCount ?? it.videoPlayCount ?? null,
      comments: it.commentsCount ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'scrape_error' }, { status: 500 });
  }
}
