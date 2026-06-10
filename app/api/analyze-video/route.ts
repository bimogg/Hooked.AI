import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function idToShortcode(id: string): string {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let n = BigInt(id);
  let code = '';
  while (n > 0n) { code = alpha[Number(n % 64n)] + code; n = n / 64n; }
  return code;
}

const HOOK_TYPES = [
  'Visual Hook', 'Question Hook', 'Tutorial Hook', 'Curiosity Hook',
  'Warning Hook', 'Challenge Hook', 'Engagement Hook', 'Mistake Hook',
];

async function getHookFromDB(niche: string) {
  const { data } = await supabaseAdmin
    .from('hooks')
    .select('creator_username, caption, views, instagram_id, video_url, thumbnail_url, niche')
    .eq('niche', niche)
    .not('caption', 'is', null)
    .neq('caption', '')
    .order('views', { ascending: false })
    .limit(40);
  if (data && data.length > 0) {
    const h = data[Math.floor(Math.random() * Math.min(data.length, 15))];
    return {
      ...h,
      video_url: h.video_url ?? null,
      reelUrl: h.instagram_id
        ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
        : `https://www.instagram.com/${h.creator_username}/`,
    };
  }
  return null;
}

async function getFallbackHook() {
  const { data } = await supabaseAdmin
    .from('hooks')
    .select('creator_username, caption, views, instagram_id, video_url, thumbnail_url, niche')
    .not('caption', 'is', null)
    .neq('caption', '')
    .order('views', { ascending: false })
    .limit(40);
  if (data && data.length > 0) {
    const h = data[Math.floor(Math.random() * Math.min(data.length, 15))];
    return {
      ...h,
      video_url: h.video_url ?? null,
      reelUrl: h.instagram_id
        ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
        : `https://www.instagram.com/${h.creator_username}/`,
    };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { frames, timestamps } = await req.json() as { frames: string[]; timestamps?: number[] };
    if (!frames?.length) return NextResponse.json({ error: 'No frames provided' }, { status: 400 });

    const ts = timestamps ?? frames.map((_, i) => i);

    // ── Step 1: Find weak zones in the video ──────────────────────────────
    const content: Anthropic.MessageParam['content'] = [];
    frames.slice(0, 12).forEach((b64, i) => {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } });
      content.push({ type: 'text', text: `↑ ${ts[i] ?? i}s` });
    });

    content.push({ type: 'text', text: `You are an Instagram Reels hook expert. Analyze these frames from a creator's video.

Find 2-3 WEAK ZONES — specific moments where the viewer would lose interest and swipe away.

For each weak zone:
- Exactly WHEN it happens (timestamp)
- What the creator is doing wrong at that moment (be specific and visual — describe what's on screen)
- Which hook TYPE from the library would fix this moment
- A concrete opening script the creator should say/show instead

Also identify the video topic so scripts are relevant.

Return ONLY valid JSON:
{
  "hookScore": <1-10>,
  "videoTopic": "<what this video is specifically about — 1 sentence>",
  "weakZones": [
    {
      "timestamp": "<e.g. '0–3 сек' or '10–15 сек'>",
      "whatIsWrong": "<exactly what happens on screen that makes viewers leave — be visual and specific, in Russian, 1-2 sentences>",
      "hookType": "<best hook type to fix this: Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
      "script": "<exact words/action the creator should use at this moment — specific to their video topic, punchy, in Russian>"
    }
  ]
}` });

    const r1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content }],
    });

    const t1 = r1.content[0].type === 'text' ? r1.content[0].text : '';
    const j1 = t1.match(/\{[\s\S]*\}/);
    if (!j1) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    const analysis = JSON.parse(j1[0]);

    // ── Step 2: For each weak zone, fetch a matching hook from library ────
    const weakZones = await Promise.all(
      (analysis.weakZones ?? []).slice(0, 3).map(async (zone: {
        timestamp: string; whatIsWrong: string; hookType: string; script: string;
      }) => {
        const hookType = HOOK_TYPES.includes(zone.hookType) ? zone.hookType : null;
        const example = hookType
          ? (await getHookFromDB(hookType)) ?? (await getFallbackHook())
          : await getFallbackHook();

        return {
          timestamp: zone.timestamp,
          whatIsWrong: zone.whatIsWrong,
          hookType: zone.hookType,
          script: zone.script,
          example,
        };
      })
    );

    return NextResponse.json({
      hookScore: analysis.hookScore,
      videoTopic: analysis.videoTopic,
      weakZones,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
