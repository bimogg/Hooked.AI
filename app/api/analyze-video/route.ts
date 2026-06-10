import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HOOK_TYPES = [
  'Visual Hook', 'Question Hook', 'Tutorial Hook', 'Curiosity Hook',
  'Warning Hook', 'Challenge Hook', 'Engagement Hook', 'Mistake Hook',
];

function idToShortcode(id: string): string {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let n = BigInt(id);
  let code = '';
  while (n > 0n) { code = alpha[Number(n % 64n)] + code; n = n / 64n; }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { frames, timestamps, caption } = await req.json() as {
      frames: string[];
      timestamps?: number[];
      caption?: string;
    };
    if (!frames?.length) return NextResponse.json({ error: 'No frames provided' }, { status: 400 });

    const ts = timestamps ?? frames.map((_, i) => i);

    const imageContent = frames.slice(0, 12).map((b64, i) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: b64 },
      // label injected via text block below
      _ts: ts[i] ?? i,
    }));

    // build content: alternate image + timestamp label
    const content: Anthropic.MessageParam['content'] = [];
    imageContent.forEach((img, i) => {
      content.push({ type: 'image', source: img.source });
      content.push({ type: 'text', text: `↑ Frame at ${img._ts}s` });
    });

    const videoDuration = ts[ts.length - 1] ?? frames.length;
    const prompt = `You are the world's top Instagram Reels hook analyst. You have analyzed 10,000+ viral videos.

Above are ${frames.length} frames from a Reel spread across ${videoDuration} seconds — the ENTIRE video.${caption ? `\nCaption: "${caption}"` : ''}

Your job: analyze the FULL video for hook quality at every stage — opening hook, mid-video retention hooks, and loop hook (end that makes people rewatch).

Respond ONLY with valid JSON, no markdown:
{
  "hookScore": <integer 1-10, overall hook quality across the whole video>,
  "verdict": "<2 sentences: what's the core hook problem across this video and the consequence>",
  "hookMoments": [
    {
      "label": "Opening Hook",
      "timestamp": "<e.g. 0–3s>",
      "status": "weak" | "ok" | "strong",
      "problem": "<what's wrong at this moment — be specific, 1 sentence>",
      "fix": "<exactly what to do instead — actionable, 1 sentence>",
      "script": "<ready-to-use line to say or show at this moment>"
    },
    {
      "label": "Mid-Video Hook",
      "timestamp": "<e.g. 10–15s>",
      "status": "weak" | "ok" | "strong",
      "problem": "<what's wrong>",
      "fix": "<what to do>",
      "script": "<ready script>"
    },
    {
      "label": "Loop Hook",
      "timestamp": "<e.g. last 3s>",
      "status": "weak" | "ok" | "strong",
      "problem": "<what's wrong>",
      "fix": "<what to do>",
      "script": "<ready script>"
    }
  ],
  "hookType": "<best hook type for this content: Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
  "hookDelivery": "<how to deliver the opening hook: tone, energy, camera angle, pacing — 1 sentence>",
  "why": "<one sentence: why fixing these hooks specifically will increase retention>"
}`;

    content.push({ type: 'text', text: prompt });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1400,
      messages: [{ role: 'user', content }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });

    const analysis = JSON.parse(jsonMatch[0]);

    // Pull reference hooks from library
    const hookType = HOOK_TYPES.includes(analysis.hookType) ? analysis.hookType : null;
    let referenceHooks: {
      creator_username: string; caption: string | null; views: number;
      instagram_id: string | null; thumbnail_url: string | null; niche: string; reelUrl: string;
    }[] = [];

    try {
      let { data } = await supabaseAdmin
        .from('hooks')
        .select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
        .eq('niche', hookType ?? 'Visual Hook')
        .not('caption', 'is', null)
        .neq('caption', '')
        .order('views', { ascending: false })
        .limit(30);

      if (!data || data.length === 0) {
        const fallback = await supabaseAdmin
          .from('hooks')
          .select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
          .not('caption', 'is', null)
          .neq('caption', '')
          .order('views', { ascending: false })
          .limit(30);
        data = fallback.data;
      }

      if (data && data.length > 0) {
        referenceHooks = data.sort(() => Math.random() - 0.5).slice(0, 3).map(h => ({
          ...h,
          reelUrl: h.instagram_id
            ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
            : `https://www.instagram.com/${h.creator_username}/`,
        }));
      }
    } catch { /* silently skip */ }

    return NextResponse.json({ ...analysis, referenceHooks });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
