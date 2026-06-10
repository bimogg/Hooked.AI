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

    // Build content with images + timestamps
    const content: Anthropic.MessageParam['content'] = [];
    frames.slice(0, 12).forEach((b64, i) => {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } });
      content.push({ type: 'text', text: `↑ ${ts[i] ?? i}s` });
    });

    const prompt = `You are an Instagram Reels hook expert. Analyze these frames from a creator's video.

Your job:
1. Identify what NICHE/TOPIC this video is about (fitness, comedy, beauty, food, business, travel, etc.)
2. Identify the #1 reason the hook is weak
3. Pick the 2 BEST hook types that would make this specific content go viral

Respond ONLY with valid JSON:
{
  "hookScore": <1-10>,
  "niche": "<one word: fitness | comedy | beauty | food | business | travel | education | lifestyle | other>",
  "mainProblem": "<one short sentence — what's the single biggest hook problem in this video>",
  "bestHookTypes": ["<type1>", "<type2>"],
  "whyHookTypes": "<1-2 sentences: why these hook types specifically work for this niche/content>"
}

Hook types to choose from: Visual Hook, Question Hook, Tutorial Hook, Curiosity Hook, Warning Hook, Challenge Hook, Engagement Hook, Mistake Hook`;

    content.push({ type: 'text', text: prompt });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });

    const analysis = JSON.parse(jsonMatch[0]);
    const bestTypes: string[] = (analysis.bestHookTypes ?? []).filter((t: string) => HOOK_TYPES.includes(t));
    if (!bestTypes.length) bestTypes.push('Visual Hook');

    // Pull hooks from library for each recommended type
    const hookResults: {
      creator_username: string; caption: string | null; views: number;
      instagram_id: string | null; thumbnail_url: string | null; niche: string; reelUrl: string;
    }[] = [];

    for (const hookType of bestTypes) {
      const { data } = await supabaseAdmin
        .from('hooks')
        .select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
        .eq('niche', hookType)
        .not('caption', 'is', null)
        .neq('caption', '')
        .order('views', { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        const picked = data.sort(() => Math.random() - 0.5).slice(0, 2);
        hookResults.push(...picked.map(h => ({
          ...h,
          reelUrl: h.instagram_id
            ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
            : `https://www.instagram.com/${h.creator_username}/`,
        })));
      }
    }

    // fallback if DB empty
    if (!hookResults.length) {
      const { data } = await supabaseAdmin
        .from('hooks')
        .select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
        .not('caption', 'is', null)
        .neq('caption', '')
        .order('views', { ascending: false })
        .limit(30);
      if (data) {
        hookResults.push(...data.sort(() => Math.random() - 0.5).slice(0, 4).map(h => ({
          ...h,
          reelUrl: h.instagram_id
            ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
            : `https://www.instagram.com/${h.creator_username}/`,
        })));
      }
    }

    return NextResponse.json({
      hookScore: analysis.hookScore,
      mainProblem: analysis.mainProblem,
      whyHookTypes: analysis.whyHookTypes,
      bestHookTypes: bestTypes,
      referenceHooks: hookResults.slice(0, 4),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
