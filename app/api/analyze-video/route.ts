import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { langForPrompt } from '@/lib/translations';

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
    .limit(10);

  if (!data || data.length === 0) return null;

  // Pick one of the top hooks of this type (small rotation for variety).
  // No extra Claude call here — keeps the whole request to a single LLM call
  // so it stays well under the serverless timeout.
  const h = data[Math.floor(Math.random() * Math.min(data.length, 5))];
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
    const { frames, timestamps, lang = 'ru' } = await req.json() as { frames: string[]; timestamps?: number[]; lang?: string };
    const outputLang = langForPrompt(lang);
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
- Read ALL on-screen text and captions visible in any frame — quote them and treat them as critical context. Never ignore captions.
- Who is in it? What are they doing physically?
- What specific topic/product/skill/situation is this video about?
- What would the viewer expect to learn or see?

STEP 2 — Score the HOOK (judge ONLY the first ~3 seconds / opening frames, not the whole video). Be objective and consistent — the same opening must always get a similar score. Use this rubric:
- 1-3 (weak): slow, silent or unclear start, no on-screen text, nothing that creates curiosity or promises value. Viewer has no reason to stay.
- 4-6 (average): some interest but a generic or slow opening; the hook is implied, not sharp.
- 7-8 (strong): a clear hook in the first seconds — a bold claim, strong visual, or curiosity/value stated up front (often reinforced by on-screen text).
- 9-10 (exceptional): instantly gripping — strong pattern interrupt plus a clear payoff that makes swiping away almost impossible.
Be fair: if the opening is genuinely strong, give it a high score. Do NOT default to low or middling scores, and do not penalize a video just to justify suggestions.

STEP 3 — Find 2-3 WEAK ZONES where viewers would swipe away.

CRITICAL RULE FOR SCRIPTS: Every script MUST be directly about the specific thing shown in this video. NEVER write generic scripts. The script must sound like it was written only for THIS video.

IMPORTANT: Write ALL text fields (videoTopic, whatIsWrong, script) in ${outputLang}. hookType must stay in English.

Return ONLY valid JSON:
{
  "hookScore": <1-10>,
  "videoTopic": "<very specific in ${outputLang}: what exactly is shown — person, action, product, topic>",
  "weakZones": [
    {
      "timestamp": "<e.g. '0–3s'>",
      "whatIsWrong": "<in ${outputLang}: what specifically happens on screen that kills interest — visual, concrete, 1-2 sentences>",
      "hookType": "<Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
      "script": "<in ${outputLang}: opening line that MUST mention the exact topic/product/action from this video — punchy, 1-2 sentences. NO generic phrases without saying WHAT specifically>"
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
