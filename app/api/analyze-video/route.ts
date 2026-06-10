import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { frames, caption } = await req.json() as { frames: string[]; caption?: string };

    if (!frames?.length) return NextResponse.json({ error: 'No frames provided' }, { status: 400 });

    const imageContent = frames.slice(0, 4).map((b64) => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: b64 },
    }));

    const prompt = `You are an expert Instagram Reels hook analyst. You are looking at ${frames.length} frames from the FIRST 3 SECONDS of a Reel.${caption ? `\n\nVideo caption: "${caption}"` : ''}

Analyze these frames and give a hook analysis. Be direct, specific, and brutally honest.

Respond ONLY with valid JSON in this exact format:
{
  "hookScore": <number 1-10>,
  "verdict": "<one sentence — is this hook strong or weak and why>",
  "problems": ["<problem 1>", "<problem 2>", "<problem 3 max>"],
  "hookType": "<best hook type: Visual Hook | Question Hook | Tutorial Hook | Curiosity Hook | Warning Hook | Challenge Hook | Engagement Hook | Mistake Hook>",
  "hookScript": "<the exact hook script they should use — 1-2 sentences, punchy, ready to record>",
  "placement": "<Opening (first 3 sec) | Pattern interrupt (10-15 sec) | Loop hook (last 5 sec)>",
  "why": "<one sentence explaining why your suggested hook will perform better>"
}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: [...imageContent, { type: 'text', text: prompt }],
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });

    return NextResponse.json(JSON.parse(json));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
