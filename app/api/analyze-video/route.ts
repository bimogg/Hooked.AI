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

export async function POST(req: NextRequest) {
  try {
    const { frames, timestamps } = await req.json() as { frames: string[]; timestamps?: number[] };
    if (!frames?.length) return NextResponse.json({ error: 'No frames provided' }, { status: 400 });

    const ts = timestamps ?? frames.map((_, i) => i);

    // ── Step 1: Analyze video ──────────────────────────────────────────────
    const content: Anthropic.MessageParam['content'] = [];
    frames.slice(0, 12).forEach((b64, i) => {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } });
      content.push({ type: 'text', text: `↑ ${ts[i] ?? i}s` });
    });
    content.push({ type: 'text', text: `You are an Instagram Reels hook expert. Analyze these frames carefully.

Return ONLY valid JSON:
{
  "hookScore": <1-10>,
  "niche": "<one word: fitness | comedy | beauty | food | business | travel | education | lifestyle | other>",
  "videoTopic": "<describe SPECIFICALLY what this video is about — what activity, product, topic, or situation is shown. Be concrete, e.g. 'home workout without equipment', 'making espresso at home', 'skincare morning routine', 'freelance pricing mistakes'. 1 sentence max>",
  "mainProblem": "<the single biggest hook problem — 1 short sentence in Russian>",
  "bestHookTypes": ["<type1>", "<type2>"]
}

Hook types: Visual Hook, Question Hook, Tutorial Hook, Curiosity Hook, Warning Hook, Challenge Hook, Engagement Hook, Mistake Hook` });

    const r1 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content }],
    });

    const t1 = r1.content[0].type === 'text' ? r1.content[0].text : '';
    const j1 = t1.match(/\{[\s\S]*\}/);
    if (!j1) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    const analysis = JSON.parse(j1[0]);

    const bestTypes: string[] = (analysis.bestHookTypes ?? []).filter((t: string) => HOOK_TYPES.includes(t));
    if (!bestTypes.length) bestTypes.push('Visual Hook');

    // ── Step 2: Pull hooks from library ───────────────────────────────────
    const rawHooks: { creator_username: string; caption: string | null; views: number; instagram_id: string | null; thumbnail_url: string | null; niche: string }[] = [];

    for (const hookType of bestTypes) {
      const { data } = await supabaseAdmin
        .from('hooks')
        .select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
        .eq('niche', hookType)
        .not('caption', 'is', null)
        .neq('caption', '')
        .order('views', { ascending: false })
        .limit(30);
      if (data?.length) rawHooks.push(...data.sort(() => Math.random() - 0.5).slice(0, 2));
    }

    // fallback
    if (!rawHooks.length) {
      const { data } = await supabaseAdmin
        .from('hooks').select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
        .not('caption', 'is', null).neq('caption', '').order('views', { ascending: false }).limit(30);
      if (data) rawHooks.push(...data.sort(() => Math.random() - 0.5).slice(0, 4));
    }

    const picked = rawHooks.slice(0, 4);

    // ── Step 3: Explain each hook for THIS creator ─────────────────────────
    const hooksListText = picked.map((h, i) =>
      `Hook ${i + 1} (${h.niche}, ${(h.views / 1000).toFixed(0)}K views):\n"${h.caption}"`
    ).join('\n\n');

    const r2 = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: `A creator made a video specifically about: "${analysis.videoTopic}".
Their hook problem: "${analysis.mainProblem}"

Below are ${picked.length} viral hooks from Instagram. For each hook:
1. "technique" — what hook technique this video uses (1 sentence in Russian)
2. "scriptToCopy" — write an OPENING LINE the creator can say/show at the very start of THEIR video about "${analysis.videoTopic}". Make it specific to their topic — mention the actual subject, not a generic example. Punchy, 1-2 sentences in Russian, ready to record.

${hooksListText}

Return ONLY a valid JSON array with exactly ${picked.length} objects:
[
  {
    "technique": "<hook technique in Russian — 1 sentence>",
    "scriptToCopy": "<opening line specifically about '${analysis.videoTopic}' — in Russian>"
  }
]`,
      }],
    });

    const t2 = r2.content[0].type === 'text' ? r2.content[0].text : '';
    const j2 = t2.match(/\[[\s\S]*\]/);
    const explanations: { technique: string; scriptToCopy: string }[] = j2 ? JSON.parse(j2[0]) : [];

    // ── Combine and return ─────────────────────────────────────────────────
    const referenceHooks = picked.map((h, i) => ({
      creator_username: h.creator_username,
      caption: h.caption,
      views: h.views,
      thumbnail_url: h.thumbnail_url,
      niche: h.niche,
      reelUrl: h.instagram_id
        ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
        : `https://www.instagram.com/${h.creator_username}/`,
      technique: explanations[i]?.technique ?? '',
      scriptToCopy: explanations[i]?.scriptToCopy ?? '',
    }));

    return NextResponse.json({
      hookScore: analysis.hookScore,
      mainProblem: analysis.mainProblem,
      bestHookTypes: bestTypes,
      referenceHooks,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
