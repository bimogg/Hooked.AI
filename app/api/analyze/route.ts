import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserMedia, IgMedia } from '@/lib/instagram';
import { getRequestUser } from '@/lib/supabase-server';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? '';

const HOOK_TYPES = [
  'Hook Tutorial', 'Visual Hook', 'Question Hook', 'Tutorial Hook',
  'Engagement Hook', 'Curiosity Hook', 'Warning Hook', 'Challenge Hook', 'Mistake Hook',
];

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // Require sign-in before any paid analysis (protects API spend from anonymous abuse).
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const { username } = await req.json().catch(() => ({}));
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

  let reels: Reel[] = [];
  try {
    reels = await scrapeByUsername(username.replace('@', '').trim());
  } catch {
    return NextResponse.json({ error: 'Не удалось загрузить reels. Проверь username.' }, { status: 422 });
  }
  if (!reels.length) {
    return NextResponse.json({ error: 'Reels не найдены. Аккаунт должен быть публичным.' }, { status: 404 });
  }

  const analyses = await Promise.all(reels.map(r => analyzeReel(r)));
  return NextResponse.json({ reels: analyses });
}

async function fetchFromInstagram(token: string): Promise<Reel[]> {
  const res = await getUserMedia(token);
  if (res.error || !res.data) return [];
  return res.data
    .filter(m => m.media_type === 'VIDEO' && m.caption)
    .slice(0, 6)
    .map(m => ({
      id: m.id,
      shortCode: shortCodeFromPermalink(m.permalink),
      caption: (m.caption ?? '').slice(0, 600),
      views: m.video_views ?? 0,
      likes: m.like_count,
      comments: m.comments_count,
      thumbnail: m.thumbnail_url ?? m.media_url ?? null,
      permalink: m.permalink,
    }));
}

function shortCodeFromPermalink(url: string) {
  const m = url.match(/\/(reel|p)\/([^/]+)/);
  return m?.[2] ?? '';
}

async function scrapeByUsername(username: string): Promise<Reel[]> {
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
    caption: String(p.caption ?? '').slice(0, 600),
    views: Number(p.videoViewCount ?? 0),
    likes: Number(p.likesCount ?? 0),
    comments: Number(p.commentsCount ?? 0),
    thumbnail: (p.displayUrl as string) ?? null,
    permalink: `https://www.instagram.com/p/${p.shortCode}/`,
  }));
}

async function analyzeReel(reel: Reel): Promise<ReelAnalysis> {
  if (!ANTHROPIC_KEY || ANTHROPIC_KEY === 'placeholder') {
    return mockAnalysis(reel);
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const lang = /[а-яёА-ЯЁ]/.test(reel.caption) ? 'Russian' : 'English';
  const prompt = `You are an Instagram Reels growth expert. Analyze this reel and recommend the best hook.

Caption: "${reel.caption}"
Views: ${reel.views.toLocaleString()}
Likes: ${reel.likes.toLocaleString()}

Respond ONLY with valid JSON, no markdown fences:
{
  "hookType": "<one of: ${HOOK_TYPES.join(' | ')}>",
  "placement": "<Opening (first 3 sec) | Pattern interrupt (10-15 sec) | Loop hook (last 5 sec)>",
  "hookScript": "<exact hook script to record, 1-2 sentences in ${lang}>",
  "reason": "<why this specific hook will increase watch time for THIS video, 1 sentence in ${lang}>",
  "viewsBoost": <estimated % boost as integer 30-120>
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
  const scripts = [
    'Подожди — ты точно упускаешь это. Смотри до конца.',
    'Вот что произошло когда я попробовал это на своём аккаунте...',
    'Ты знаешь почему 9 из 10 создателей теряют зрителей на первых 3 секундах?',
  ];
  return {
    reel,
    hookType: 'Question Hook',
    placement: 'Opening (first 3 sec)',
    hookScript: scripts[Math.floor(Math.random() * scripts.length)],
    reason: 'Незакрытый вопрос вынуждает мозг досмотреть до ответа',
    viewsBoost: 65 + Math.floor(Math.random() * 40),
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
  permalink: string;
}

interface ReelAnalysis {
  reel: Reel;
  hookType: string;
  placement: string;
  hookScript: string;
  reason: string;
  viewsBoost: number;
}
