import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? '';

const HOOK_TYPES = [
  'Hook Tutorial', 'Visual Hook', 'Question Hook', 'Tutorial Hook',
  'Engagement Hook', 'Curiosity Hook', 'Warning Hook', 'Challenge Hook', 'Mistake Hook',
];

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

  const clean = username.replace('@', '').trim();

  let reels: Reel[] = [];
  try {
    reels = await scrapeReels(clean);
  } catch {
    return NextResponse.json({ error: 'Не удалось загрузить reels. Проверь username.' }, { status: 422 });
  }
  if (!reels.length) {
    return NextResponse.json({ error: 'Reels не найдены. Убедись что аккаунт публичный.' }, { status: 404 });
  }

  const analyses = await Promise.all(reels.map(r => analyzeReel(r)));
  return NextResponse.json({ reels: analyses });
}

async function scrapeReels(username: string): Promise<Reel[]> {
  const run = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [username], resultsType: 'posts', resultsLimit: 6 }),
  });
  const { data } = await run.json();
  const runId: string = data.id;

  for (let i = 0; i < 18; i++) {
    await delay(5000);
    const s = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const { data: d } = await s.json();
    if (d.status === 'SUCCEEDED') break;
    if (d.status === 'FAILED' || d.status === 'ABORTED') throw new Error('Apify failed');
  }

  const items = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=6`);
  const posts = await items.json();
  return posts.filter((p: Record<string, unknown>) => p.caption).map((p: Record<string, unknown>) => ({
    id: String(p.id ?? ''),
    shortCode: String(p.shortCode ?? ''),
    caption: (String(p.caption ?? '')).slice(0, 600),
    views: Number(p.videoViewCount ?? 0),
    likes: Number(p.likesCount ?? 0),
    comments: Number(p.commentsCount ?? 0),
    thumbnail: (p.displayUrl as string) ?? null,
  }));
}

async function analyzeReel(reel: Reel): Promise<ReelAnalysis> {
  if (!ANTHROPIC_KEY || ANTHROPIC_KEY === 'placeholder') {
    return mockAnalysis(reel);
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const lang = /[а-яёА-ЯЁ]/.test(reel.caption) ? 'Russian' : 'English';
  const prompt = `You are an Instagram Reels growth expert. Analyze this reel and recommend a hook.

Caption: "${reel.caption}"
Views: ${reel.views.toLocaleString()}
Likes: ${reel.likes.toLocaleString()}

Respond ONLY with valid JSON, no markdown:
{
  "hookType": "<one of: ${HOOK_TYPES.join(' | ')}>",
  "placement": "<Opening (first 3 sec) | Pattern interrupt (10-15 sec) | Loop hook (last 5 sec)>",
  "hookScript": "<exact hook text to say on camera, 1-2 sentences in ${lang}>",
  "reason": "<why this increases watch time, 1 sentence in ${lang}>",
  "viewsBoost": <estimated % boost as integer, 30-120>
}`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = (msg.content[0] as { type: string; text: string }).text;
    const parsed = JSON.parse(text);
    return { reel, ...parsed };
  } catch {
    return mockAnalysis(reel);
  }
}

function mockAnalysis(reel: Reel): ReelAnalysis {
  return {
    reel,
    hookType: 'Question Hook',
    placement: 'Opening (first 3 sec)',
    hookScript: 'Ты знаешь почему 90% создателей теряют зрителей на первых 3 секундах? Сейчас покажу.',
    reason: 'Вопрос создаёт незакрытую петлю — мозг вынужден досмотреть до ответа',
    viewsBoost: 85,
  };
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

interface Reel {
  id: string;
  shortCode: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string | null;
}

interface ReelAnalysis {
  reel: Reel;
  hookType: string;
  placement: string;
  hookScript: string;
  reason: string;
  viewsBoost: number;
}
