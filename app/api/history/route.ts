import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: list the signed-in user's analysis history
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ items: [] });

  const { data, error } = await supabaseAdmin
    .from('analyses')
    .select('id, created_at, name, thumb, video_topic, hook_score, best_hook')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ items: [], error: error.message }, { status: 200 });
  return NextResponse.json({ items: data ?? [] });
}

// POST: save one analysis for the signed-in user
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const b = await req.json();
    await supabaseAdmin.from('analyses').insert({
      user_id: userId,
      name: typeof b.name === 'string' ? b.name.slice(0, 200) : null,
      thumb: typeof b.thumb === 'string' ? b.thumb.slice(0, 200000) : null,
      video_topic: typeof b.videoTopic === 'string' ? b.videoTopic.slice(0, 300) : null,
      hook_score: typeof b.hookScore === 'number' ? Math.round(b.hookScore) : null,
      best_hook: b.bestHook ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
