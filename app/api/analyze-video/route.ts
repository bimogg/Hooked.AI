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

async function getHookFromDB(niche: string, videoTopic: string, client: Anthropic) {
  const { data } = await supabaseAdmin
    .from('hooks')
    .select('creator_username, caption, views, instagram_id, video_url, thumbnail_url, niche')
    .eq('niche', niche)
    .not('caption', 'is', null)
    .neq('caption', '')
    .order('views', { ascending: false })
    .limit(40);

  if (!data || data.length === 0) return null;

  // Let Claude pick the most relevant hook based on the video topic
  const candidates = data.slice(0, 15);
  const list = candidates.map((h, i) => `${i}: "${h.caption}"`).join('\n');

  const pick = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    messages: [{
      role: 'user',
      content: `Video is about: "${videoTopic}"\n\nWhich hook caption below is most relevant to use as an example for this video?\n\n${list}\n\nReply ONLY with the number (0-${candidates.length - 1}).`,
    }],
  });

  const idx = parseInt((pick.content[0] as { type: string; text: string }).text.trim()) || 0;
  const h = candidates[Math.min(idx, candidates.length - 1)];
  return {
    ...h,
    video_url: h.video_url ?? null,
    reelUrl: h.instagram_id
      ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
      : `https://www.instagram.com/${h.creator_username}/`,
  };
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
    return { ...h, video_url: h.video_url ?? null, reelUrl: h.instagram_id ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/` : `https://www.instagram.com/${h.creator_username}/` };
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

    content.push({ type: 'text', text: `You are an Instagram Reels hook expert. Analyze these frames carefully.

STEP 1 — Understand the video deeply:
- Who is in it? What are they doing physically?
- What specific topic/product/skill/situation is this video about?
- What would the viewer expect to learn or see?

STEP 2 — Find 2-3 WEAK ZONES where viewers would swipe away.

CRITICAL RULE FOR SCRIPTS: Every script MUST be directly about the specific thing shown in this video. If the video is about making coffee — the script is about coffee. If it's about a workout — it's about that workout. NEVER write generic scripts. The script must sound like it was written only for THIS video.

Return ONLY valid JSON:
{
  "hookScore": <1-10>,
  "videoTopic": "<very specific: what exactly is shown — person, action, product, topic. E.g. 'девушка показывает утреннюю скинкер-рутину с кремом для лица' NOT just 'beauty'>",
  "weakZones": [
    {
      "timestamp": "<e.g. '0–3 сек'>",
      "whatIsWrong": "<what specifically happens on screen at this moment that kills interest — visual, concrete, in Russian>",
      "hookType": "<Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
      "script": "<opening line that MUST mention the exact topic/product/action from this video — in Russian, 1-2 punchy sentences. NO generic phrases like 'смотри до конца' or 'ты делаешь это неправильно' without saying WHAT specifically>"
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
          ? (await getHookFromDB(hookType, analysis.videoTopic ?? '', client)) ?? (await getFallbackHook())
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
