import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { langForPrompt } from '@/lib/translations';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function idToShortcode(id: string): string {
  if (!/^\d+$/.test(id)) return id;
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let n = BigInt(id);
  let code = '';
  while (n > 0n) { code = alpha[Number(n % 64n)] + code; n = n / 64n; }
  return code;
}


type HookRow = {
  creator_username: string; caption: string | null; views: number;
  instagram_id: string | null; video_url: string | null; thumbnail_url: string | null; niche: string;
};

function shapeHook(h: HookRow) {
  return {
    ...h,
    video_url: h.video_url ?? null,
    reelUrl: h.instagram_id
      ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
      : `https://www.instagram.com/${h.creator_username}/`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { frames, timestamps, lang = 'ru', caption, likes, views, comments } = await req.json() as { frames: string[]; timestamps?: number[]; lang?: string; caption?: string; likes?: number | null; views?: number | null; comments?: number | null };
    const outputLang = langForPrompt(lang);
    const realCaption = (caption ?? '').slice(0, 500);
    const hasMetrics = typeof views === 'number' || typeof likes === 'number';
    const engagementNote = hasMetrics
      ? `\nREAL PERFORMANCE DATA for this published Reel (factor this into the score!): ${views != null ? `${views} views` : ''}${likes != null ? `, ${likes} likes` : ''}${comments != null ? `, ${comments} comments` : ''}.${realCaption ? ` Caption: "${realCaption}".` : ''}\nInterpretation: if the like/comment rate relative to views is strong, the hook clearly WORKED — say so in scoreReason and don't invent weaknesses. If views are decent but the like rate is weak, the hook likely lost people early — be honest and focus the advice on fixing the opening.\n`
      : (realCaption ? `\nThe video caption is: "${realCaption}". Treat it as critical context.\n` : '');
    if (!frames?.length) return NextResponse.json({ error: 'No frames provided' }, { status: 400 });

    const ts = timestamps ?? frames.map((_, i) => i);

    // ── Candidate pool of real library hooks (one query, no extra LLM calls) ──
    const { data: poolData } = await supabaseAdmin
      .from('hooks')
      .select('creator_username, caption, views, instagram_id, video_url, thumbnail_url, niche')
      .not('caption', 'is', null)
      .neq('caption', '')
      .neq('niche', 'Insert')
      .order('views', { ascending: false })
      .limit(50);
    const pool: HookRow[] = poolData ?? [];

    const poolList = pool
      .map((h, i) => `${i} [${h.niche}] "${(h.caption ?? '').slice(0, 120)}" (${h.views} views)`)
      .join('\n');

    // ── Single Claude call: understand → score → weak zones → pick matching examples ──
    const content: Anthropic.MessageParam['content'] = [];
    frames.slice(0, 16).forEach((b64, i) => {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } });
      content.push({ type: 'text', text: `↑ ${ts[i] ?? i}s` });
    });

    content.push({ type: 'text', text: `You are an Instagram Reels hook expert. Analyze these frames carefully.
${engagementNote}
STEP 1 — Understand the video deeply:
- Read ALL on-screen text and captions visible in any frame — quote them and treat them as critical context. Never ignore captions.
- Who is in it? What are they doing physically?
- What EXACT niche/topic is this (e.g. cars/motion, fitness, cooking, beauty, relationships, finance, travel)? Be specific.
- What would the viewer expect to see or learn?
- THE VISUAL HOOK: look closely at the FIRST 2-3 frames (0-2s). Describe exactly what is visually happening — is it static or moving, is there a face, motion, text? This is the visual hook and matters most.

STEP 2 — Score the HOOK. Judge ONLY the first ~3 seconds / opening frames, NOT the whole video. Be objective and consistent: the same opening must always get a similar score. You MUST justify the number with concrete evidence from the frames in "scoreReason" — never pick a number arbitrarily. Rubric:
- 1-3 (weak): slow, silent or unclear start, no on-screen text, nothing that creates curiosity or promises value.
- 4-6 (average): some interest but a generic or slow opening; the hook is implied, not sharp.
- 7-8 (strong): a clear hook in the first seconds — a bold claim, strong visual, or curiosity/value stated up front.
- 9-10 (exceptional): instantly gripping — strong pattern interrupt plus a clear payoff.
Be fair: if the opening is genuinely strong, score it high. Do NOT default to low/middling scores, and never invent weaknesses just to justify suggestions.

STEP 3 — Find 2-3 WEAK ZONES where viewers would swipe away.

STEP 3.5 — Recommend the SINGLE STRONGEST hook to use for the opening of THIS video (a ready-to-use line + a concrete visual/shot tip). This is the main fix, especially when the score is below 7.

STEP 4 — For EACH weak zone, OPTIONALLY pick ONE example from the LIBRARY below — but ONLY if its caption is clearly about the SAME content topic/niche as THIS video (e.g. both fitness/sports, both cars, both cooking, both beauty).
CRITICAL: It is MUCH better to return -1 (no example shown) than to show an unrelated one. The user hates irrelevant examples. Do NOT match on hook type alone — the CONTENT TOPIC must clearly match. If you are not highly confident the example is the same topic as this video, return -1. Default to -1 unless there is an obvious same-topic match. Return the index in "exampleIndex", or -1.

LIBRARY (index [hook type] "caption"):
${poolList}

CRITICAL RULE FOR SCRIPTS: Every script MUST be directly about the specific thing shown in THIS video. Never generic.

IMPORTANT: Write videoTopic, whatIsWrong, script, scoreReason in ${outputLang}. hookType must stay in English.

Return ONLY valid JSON:
{
  "hookScore": <integer 1-10 per the rubric>,
  "scoreReason": "<in ${outputLang}: 1 sentence justifying the score with concrete evidence from the opening frames>",
  "videoTopic": "<very specific in ${outputLang}: niche + what exactly is shown>",
  "bestHook": {
    "script": "<in ${outputLang}: the single strongest ready-to-use opening hook line for THIS specific video>",
    "hookType": "<one of the 8 hook types>",
    "tip": "<in ${outputLang}: one concrete visual/shot tip — e.g. start on a close-up, add a fast zoom, put the hook as on-screen text in frame 1>"
  },
  "weakZones": [
    {
      "timestamp": "<e.g. '0-3s'>",
      "whatIsWrong": "<in ${outputLang}: what specifically kills interest — visual, concrete>",
      "hookType": "<one of: Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
      "script": "<in ${outputLang}: opening line mentioning the exact topic/action from this video>",
      "exampleIndex": <index from LIBRARY ONLY if it is clearly the SAME content topic as this video — otherwise -1; prefer -1 whenever unsure>
    }
  ]
}` });

    const r1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1600,
      messages: [{ role: 'user', content }],
    });

    const t1 = r1.content[0].type === 'text' ? r1.content[0].text : '';
    const j1 = t1.match(/\{[\s\S]*\}/);
    if (!j1) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    const analysis = JSON.parse(j1[0]);

    const weakZones = (analysis.weakZones ?? []).slice(0, 3).map((zone: {
      timestamp: string; whatIsWrong: string; hookType: string; script: string; exampleIndex?: number;
    }) => {
      const idx = typeof zone.exampleIndex === 'number' ? zone.exampleIndex : -1;
      // Only show an example the model explicitly matched to THIS video's topic.
      // If nothing fits (-1) or the index is invalid, show no reference at all —
      // never a random, irrelevant hook (that's worse than empty).
      const chosen: HookRow | undefined = idx >= 0 && idx < pool.length ? pool[idx] : undefined;
      return {
        timestamp: zone.timestamp,
        whatIsWrong: zone.whatIsWrong,
        hookType: zone.hookType,
        script: zone.script,
        example: chosen ? shapeHook(chosen) : null,
      };
    });

    return NextResponse.json({
      hookScore: analysis.hookScore,
      scoreReason: analysis.scoreReason ?? null,
      videoTopic: analysis.videoTopic,
      bestHook: analysis.bestHook ?? null,
      weakZones,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
