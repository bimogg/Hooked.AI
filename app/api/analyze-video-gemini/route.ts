import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { langForPrompt } from '@/lib/translations';

export const maxDuration = 60;

const KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com';

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
  instagram_id: string | null; video_url: string | null; thumbnail_url: string | null; niche: string; content_niche?: string | null;
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

async function fetchVideoBytes(url: string): Promise<ArrayBuffer> {
  const headers: Record<string, string> = {};
  if (url.includes('cdninstagram.com') || url.includes('scontent')) {
    headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    headers['Referer'] = 'https://www.instagram.com/';
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('video_fetch_failed');
  return res.arrayBuffer();
}

// Upload bytes to Gemini Files API (resumable) → returns { name, uri }
async function uploadToGemini(bytes: ArrayBuffer): Promise<{ name: string; uri: string }> {
  const start = await fetch(`${BASE}/upload/v1beta/files?key=${KEY}`, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(bytes.byteLength),
      'X-Goog-Upload-Header-Content-Type': 'video/mp4',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: { display_name: 'reel' } }),
  });
  const uploadUrl = start.headers.get('x-goog-upload-url');
  if (!uploadUrl) throw new Error('gemini_upload_start_failed');
  const up = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'X-Goog-Upload-Command': 'upload, finalize', 'X-Goog-Upload-Offset': '0', 'Content-Length': String(bytes.byteLength) },
    body: bytes,
  });
  const info = await up.json();
  return { name: info.file.name, uri: info.file.uri };
}

async function waitActive(name: string): Promise<boolean> {
  for (let i = 0; i < 25; i++) {
    const st = await (await fetch(`${BASE}/v1beta/${name}?key=${KEY}`)).json();
    if (st.state === 'ACTIVE') return true;
    if (st.state === 'FAILED') return false;
    await new Promise(r => setTimeout(r, 1500));
  }
  return false;
}

const TEMP_BUCKET = 'videos';

export async function POST(req: NextRequest) {
  if (!KEY) return NextResponse.json({ error: 'gemini_not_configured' }, { status: 500 });
  let geminiName = '';
  let storagePath = '';
  try {
    const body = await req.json() as {
      videoUrl?: string; storagePath?: string; lang?: string; caption?: string; likes?: number | null; views?: number | null; comments?: number | null;
    };
    const { videoUrl, lang = 'ru', caption, likes, views, comments } = body;
    storagePath = body.storagePath ?? '';
    if (!videoUrl && !storagePath) return NextResponse.json({ error: 'no_video' }, { status: 400 });
    const outputLang = langForPrompt(lang);

    // library candidate pool (same as Claude route)
    const { data: poolData } = await supabaseAdmin
      .from('hooks')
      .select('creator_username, caption, views, instagram_id, video_url, thumbnail_url, niche, content_niche')
      .not('caption', 'is', null).neq('caption', '').neq('niche', 'Insert')
      .order('views', { ascending: false }).limit(50);
    const pool: HookRow[] = poolData ?? [];
    const poolList = pool.map((h, i) => `${i} (topic: ${h.content_niche ?? 'other'}) "${(h.caption ?? '').slice(0, 120)}" (${h.views} views)`).join('\n');

    // get video bytes — from uploaded file (Supabase) or from a link
    let bytes: ArrayBuffer;
    if (storagePath) {
      const { data, error } = await supabaseAdmin.storage.from(TEMP_BUCKET).download(storagePath);
      if (error || !data) return NextResponse.json({ error: 'storage_fetch_failed' }, { status: 502 });
      bytes = await data.arrayBuffer();
    } else {
      bytes = await fetchVideoBytes(videoUrl as string);
    }
    const { name, uri } = await uploadToGemini(bytes);
    geminiName = name;
    if (!(await waitActive(name))) return NextResponse.json({ error: 'video_processing_failed' }, { status: 502 });

    const realCaption = (caption ?? '').slice(0, 500);
    const hasMetrics = typeof views === 'number' || typeof likes === 'number';
    const engagementNote = hasMetrics
      ? `\nREAL PERFORMANCE: ${views != null ? `${views} views` : ''}${likes != null ? `, ${likes} likes` : ''}${comments != null ? `, ${comments} comments` : ''}.${realCaption ? ` Caption: "${realCaption}".` : ''} If the like-rate is strong the hook worked — say so; if weak, focus on fixing it.\n`
      : (realCaption ? `\nCaption: "${realCaption}".\n` : '');

    const prompt = `You are an Instagram Reels hook expert. WATCH this video fully — use motion, on-screen text, AND audio (the first spoken words / sound often ARE the hook).
${engagementNote}
STEP 1 — Understand it: what physically happens, on-screen text, what is said/heard in the first 3s, the EXACT content niche.
STEP 2 — Score the HOOK (first ~3 seconds only), 1-10, justify with concrete evidence from VISUALS + MOTION + AUDIO in scoreReason.
STEP 3 — 2-3 weak zones where viewers swipe away.
STEP 3.5 — The single strongest hook to use for THIS video (ready line + concrete visual/audio tip).
STEP 4 — For each weak zone, pick ONE library example ONLY if its (topic) tag clearly matches this video's contentNiche, else -1 (prefer -1 when unsure — never show an off-topic example).

Classify contentNiche as one of: fitness, cars, food, beauty, fashion, finance, business, travel, tech, relationships, comedy, education, pets, home, music, gaming, motivation, marketing, other.

LIBRARY (index (topic: niche) "caption"):
${poolList}

Write videoTopic, scoreReason, whatIsWrong, script, tip, audioHook in ${outputLang}. hookType in English.
Return ONLY JSON:
{"hookScore": <1-10>, "scoreReason":"...", "videoTopic":"...", "contentNiche":"...",
"audioHook":"<in ${outputLang}: what is heard in first 3s and whether it hooks>",
"bestHook":{"script":"...","hookType":"...","tip":"..."},
"weakZones":[{"timestamp":"0-3s","whatIsWrong":"...","hookType":"...","script":"...","exampleIndex":<index or -1>}]}`;

    const genRes = await fetch(`${BASE}/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ file_data: { mime_type: 'video/mp4', file_uri: uri } }, { text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
      }),
    });
    const gen = await genRes.json();
    const txt = gen?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const j = txt.match(/\{[\s\S]*\}/);
    if (!j) return NextResponse.json({ error: 'analysis_failed' }, { status: 500 });
    const analysis = JSON.parse(j[0]);

    const weakZones = (analysis.weakZones ?? []).slice(0, 3).map((zone: {
      timestamp: string; whatIsWrong: string; hookType: string; script: string; exampleIndex?: number;
    }) => {
      const idx = typeof zone.exampleIndex === 'number' ? zone.exampleIndex : -1;
      const chosen: HookRow | undefined = idx >= 0 && idx < pool.length ? pool[idx] : undefined;
      return { timestamp: zone.timestamp, whatIsWrong: zone.whatIsWrong, hookType: zone.hookType, script: zone.script, example: chosen ? shapeHook(chosen) : null };
    });

    return NextResponse.json({
      hookScore: analysis.hookScore,
      scoreReason: analysis.scoreReason ?? null,
      videoTopic: analysis.videoTopic,
      audioHook: analysis.audioHook ?? null,
      bestHook: analysis.bestHook ?? null,
      weakZones,
      engine: 'gemini',
    });
  } catch (e) {
    console.error('gemini analyze error', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  } finally {
    // cleanup: remove the Gemini file and the temp uploaded video
    if (geminiName) { try { await fetch(`${BASE}/v1beta/${geminiName}?key=${KEY}`, { method: 'DELETE' }); } catch {} }
    if (storagePath) { try { await supabaseAdmin.storage.from(TEMP_BUCKET).remove([storagePath]); } catch {} }
  }
}
