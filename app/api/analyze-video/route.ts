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
    const { frames, caption } = await req.json() as { frames: string[]; caption?: string };
    if (!frames?.length) return NextResponse.json({ error: 'No frames provided' }, { status: 400 });

    const imageContent = frames.slice(0, 4).map((b64) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: b64 },
    }));

    const frameCount = frames.length;
    const prompt = `You are the world's top Instagram Reels hook analyst. You've studied 10,000+ viral videos and know exactly what makes people stop scrolling vs. swipe away.

You are looking at ${frameCount} frames from the FIRST 3 SECONDS of an Instagram Reel.${caption ? `\n\nVideo caption: "${caption}"` : ''}

Frame timestamps: ${[0,1,2,3].slice(0, frameCount).map(t => `${t}s`).join(', ')}.

Analyze these frames with brutal honesty and actionable depth. Give SPECIFIC, DETAILED feedback — not generic advice.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "hookScore": <integer 1-10>,
  "verdict": "<2 sentences: what's the core hook problem and what's the immediate consequence for retention>",
  "timeline": [
    { "second": 0, "what": "<what ACTUALLY happens in this frame — be specific>", "problem": "<what's wrong here>", "fix": "<exactly what should happen instead>" },
    { "second": 1, "what": "<what ACTUALLY happens>", "problem": "<what's wrong>", "fix": "<exactly what should be different>" },
    { "second": 2, "what": "<what ACTUALLY happens>", "problem": "<what's wrong>", "fix": "<exactly what should be different>" },
    { "second": 3, "what": "<what ACTUALLY happens>", "problem": "<decision point for viewer — why they leave or stay>" , "fix": "<what would make them stay>" }
  ],
  "problems": [
    "<specific problem 1 — include the second it happens, e.g. 'At 0s: no visual contrast...' >",
    "<specific problem 2>",
    "<specific problem 3>"
  ],
  "hookType": "<best hook type from: Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
  "hookScript": "<the exact hook script — 1-2 punchy sentences, written to be SPOKEN. Include stage directions in brackets like [look into camera] [show product] if needed>",
  "hookDelivery": "<how to deliver it: tone, speed, energy, what to do with body/hands/face, camera angle>",
  "placement": "Opening (first 3 sec)",
  "why": "<one sentence: WHY this specific hook will perform better based on what's failing in the original>"
}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: [...imageContent, { type: 'text', text: prompt }],
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });

    const analysis = JSON.parse(jsonMatch[0]);

    // Pull matching reference hooks from library
    const hookType = HOOK_TYPES.includes(analysis.hookType) ? analysis.hookType : null;
    let referenceHooks: {
      creator_username: string;
      caption: string | null;
      views: number;
      instagram_id: string | null;
      thumbnail_url: string | null;
      niche: string;
      reelUrl: string;
    }[] = [];

    if (hookType) {
      try {
        const { data } = await supabaseAdmin
          .from('hooks')
          .select('creator_username, caption, views, instagram_id, thumbnail_url, niche')
          .eq('niche', hookType)
          .not('caption', 'is', null)
          .neq('caption', '')
          .gt('views', 100000)
          .order('views', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          // pick 3 random from top 20 so it varies
          const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 3);
          referenceHooks = shuffled.map(h => ({
            ...h,
            reelUrl: h.instagram_id
              ? `https://www.instagram.com/reel/${idToShortcode(h.instagram_id)}/`
              : `https://www.instagram.com/${h.creator_username}/`,
          }));
        }
      } catch {
        // silently skip if DB unavailable
      }
    }

    return NextResponse.json({ ...analysis, referenceHooks });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
