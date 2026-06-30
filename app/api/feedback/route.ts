import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Anonymous feedback: anyone can leave a review without signing in.
// Stored privately (visible to the owner); approved ones are shown publicly.
// Cheap (single DB insert) so anonymous access is fine — guarded only by a
// length cap + light per-IP throttle to stop spam.

const lastByIp = new Map<string, number>();

// Best-effort Telegram ping to the owner when a new review lands.
// Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in env to enable; otherwise skipped.
async function notifyTelegram(message: string, rating: number | null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const stars = rating ? '⭐'.repeat(rating) + ` (${rating}/5)\n` : '';
  const text = `🆕 New anonymous review on Hooked AI\n\n${stars}${message}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {}
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const last = lastByIp.get(ip) ?? 0;
  if (now - last < 15_000) return NextResponse.json({ error: 'too_fast' }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? '').trim();
  const ratingRaw = Number(body.rating);
  const rating = Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? Math.round(ratingRaw) : null;

  if (message.length < 3) return NextResponse.json({ error: 'too_short' }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: 'too_long' }, { status: 400 });

  const { error } = await supabaseAdmin.from('feedback').insert({ message, rating });
  if (error) return NextResponse.json({ error: 'save_failed', detail: error.message }, { status: 500 });

  lastByIp.set(ip, now);
  notifyTelegram(message, rating).catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { data } = await supabaseAdmin
    .from('feedback')
    .select('id, message, rating, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(50);
  return NextResponse.json({ reviews: data ?? [] });
}
