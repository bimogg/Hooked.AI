'use client';
// folder upload UI
import { useState, useRef, useCallback, useEffect } from 'react';
import { AlertCircle, Lock, Eye, Copy, Check, Link2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import HookPlayer from './HookPlayer';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

const POLAR_CHECKOUT = 'https://buy.polar.sh/polar_cl_z60eWttODS3mrButkP1Q6WZzVsDpDLgpk4fMs4X32s4';

const FREE_KEY = 'hooked_free_count';
const FREE_LIMIT = 3;
function getFreeCount() { try { return parseInt(localStorage.getItem(FREE_KEY) || '0', 10); } catch { return 0; } }
function hasUsedFree() { return getFreeCount() >= FREE_LIMIT; }
function markFreeUsed() { try { localStorage.setItem(FREE_KEY, String(getFreeCount() + 1)); } catch {} }

async function extractFramesFromSrc(src: string, revoke: boolean): Promise<{ b64: string; t: number }[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = src; video.muted = true; video.playsInline = true; video.crossOrigin = 'anonymous';
    video.onloadedmetadata = async () => {
      const dur = video.duration;
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 768 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d')!;
      const MAX = 16;
      // Dense sampling in the first 3s (the hook lives here), then spread across the rest.
      const early = [0, 0.5, 1, 1.5, 2, 3].filter(t => t < dur);
      const restCount = Math.max(0, Math.min(MAX - early.length, Math.floor((dur - 3) / 2)));
      const rest = restCount > 0
        ? Array.from({ length: restCount }, (_, i) => 3 + ((dur - 3) / (restCount + 1)) * (i + 1))
        : [];
      const times = [...early, ...rest].filter(t => t < dur - 0.05).slice(0, MAX);
      const frames: { b64: string; t: number }[] = [];
      for (const t of times) {
        await new Promise<void>(res => {
          video.currentTime = t;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push({ b64: canvas.toDataURL('image/jpeg', 0.72).split(',')[1], t: Math.round(t) });
            res();
          };
        });
      }
      if (revoke) URL.revokeObjectURL(src); resolve(frames);
    };
    video.onerror = () => { if (revoke) URL.revokeObjectURL(src); reject(new Error('Не удалось загрузить видео')); };
  });
}

async function extractFrames(file: File) {
  return extractFramesFromSrc(URL.createObjectURL(file), true);
}

// small thumbnail (~240px) from a raw base64 jpeg frame, for history storage
async function makeThumb(b64: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const s = Math.min(1, 240 / Math.max(img.width, img.height));
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve('');
    img.src = `data:image/jpeg;base64,${b64}`;
  });
}

function saveHistory(entry: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem('hooked_history');
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    localStorage.setItem('hooked_history', JSON.stringify(arr.slice(0, 15)));
  } catch {}
}

// parse "0–3 сек" or "10–15 сек" → { start, end }
function parseTimestamp(ts: string): { start: number; end: number } {
  const nums = ts.match(/\d+/g)?.map(Number) ?? [0];
  return { start: nums[0] ?? 0, end: nums[1] ?? (nums[0] ?? 0) + 4 };
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function CopyBtn({ text, lang }: { text: string; lang: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={e => { e.preventDefault(); navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-black/15 text-[#555] hover:bg-black hover:text-white transition-all shrink-0 whitespace-nowrap"
    >
      {done
        ? <><Check size={10} />{tr('result', 'copied', lang)}</>
        : <><Copy size={10} />{tr('result', 'copy', lang)}</>}
    </button>
  );
}

// Left: user's own video seeked to the weak zone, looping that segment
function UserVideoClip({ blobUrl, start, end }: { blobUrl: string; start: number; end: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.currentTime = start;
    v.play().catch(() => {});
  }, [start]);

  const onTimeUpdate = () => {
    const v = ref.current; if (!v) return;
    if (v.currentTime >= end) { v.currentTime = start; v.play().catch(() => {}); }
  };

  return (
    <video
      ref={ref}
      src={blobUrl}
      className="w-full h-full object-cover"
      muted playsInline autoPlay loop={false}
      onTimeUpdate={onTimeUpdate}
      onLoadedMetadata={e => { (e.target as HTMLVideoElement).currentTime = start; }}
    />
  );
}

interface HookExample {
  creator_username: string; caption: string | null; views: number;
  thumbnail_url: string | null; video_url: string | null; niche: string; reelUrl: string;
}
interface WeakZone {
  timestamp: string; whatIsWrong: string; fix?: string | null; hookType: string; script: string;
  example: HookExample | null;
}
interface Metrics { likes: number | null; views: number | null; comments: number | null; username: string }
interface Result { hookScore: number; verdict?: string | null; scoreReason?: string | null; videoTopic: string; audioHook?: string | null; bestHook?: { script: string; hookType: string; tip: string } | null; weakZones: WeakZone[]; metrics?: Metrics | null; }

const STEP_KEYS = ['frames', 'analyzing', 'hooks'] as const;

const NICHE_COLOR: Record<string, string> = {
  'Visual Hook': 'bg-pink-100 text-pink-700',
  'Question Hook': 'bg-sky-100 text-sky-700',
  'Tutorial Hook': 'bg-teal-100 text-teal-700',
  'Curiosity Hook': 'bg-amber-100 text-amber-700',
  'Warning Hook': 'bg-red-100 text-red-700',
  'Challenge Hook': 'bg-indigo-100 text-indigo-700',
  'Engagement Hook': 'bg-orange-100 text-orange-700',
  'Mistake Hook': 'bg-slate-100 text-slate-700',
};

export default function VideoAnalyzer() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [reelUrl, setReelUrl] = useState('');
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();
  const { user } = useAuth();
  const isSignedIn = !!user;
  const checkoutUrl = (() => {
    const email = user?.email;
    return email ? `${POLAR_CHECKOUT}?customer_email=${encodeURIComponent(email)}` : POLAR_CHECKOUT;
  })();

  useEffect(() => {
    fetch('/api/check-subscription')
      .then(r => r.json())
      .then(d => { if (d.pro) setIsPro(true); })
      .catch(() => {});
  }, []);

  // cleanup blob on unmount / new upload
  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const analyze = useCallback(async (file: File) => {
    // Must be signed in to analyze — send to the login page first.
    if (!isSignedIn) { window.location.href = `/login?next=${encodeURIComponent('/')}`; return; }
    if (!file.type.startsWith('video/')) { setError('Загрузи видео (MP4, MOV)'); return; }
    if (file.size > 300 * 1024 * 1024) { setError('Максимум 300MB'); return; }
    if (!isPro && hasUsedFree()) { setLocked(true); return; }
    // keep blob URL for left panel
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const newBlob = URL.createObjectURL(file);
    setBlobUrl(newBlob);

    setLoading(true); setError(''); setResult(null); setStepIdx(0);
    try {
      // Uploaded files use the FAST frame-based engine (instant — no slow video upload).
      // Link analysis uses Gemini native video (no device upload there).
      const frameData = await extractFrames(file);
      setStepIdx(1);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);
      const res = await fetch('/api/analyze-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames: frameData.map(f => f.b64), timestamps: frameData.map(f => f.t), lang }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      setStepIdx(2);
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Ошибка анализа. Попробуй ещё раз.');
      if (!isPro) markFreeUsed();
      setResult(data);
      // save to history for the profile page
      try {
        const thumb = frameData[0]?.b64 ? await makeThumb(frameData[0].b64) : '';
        const entry = {
          name: file.name,
          thumb,
          videoTopic: data.videoTopic ?? null,
          hookScore: data.hookScore ?? null,
          bestHook: data.bestHook ?? null,
        };
        // local copy (works signed-out / offline)
        saveHistory({ id: Date.now(), date: new Date().toISOString(), ...entry });
        // synced copy on the account, if signed in
        if (isSignedIn) {
          fetch('/api/history', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          }).catch(() => {});
        }
      } catch {}
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e) || 'Ошибка. Попробуй ещё раз.');
    } finally { setLoading(false); }
  }, [blobUrl, isPro, isSignedIn, lang]);

  const analyzeFromUrl = useCallback(async (url: string) => {
    // Must be signed in to analyze — send to the login page first.
    if (!isSignedIn) { window.location.href = `/login?next=${encodeURIComponent('/')}`; return; }
    const clean = url.trim();
    if (!/instagram\.com\/(reel|reels|p|tv)\//.test(clean)) { setError(tr('upload', 'scrapeError', lang)); return; }
    if (!isPro && hasUsedFree()) { setLocked(true); return; }
    setLoading(true); setError(''); setResult(null); setStepIdx(0);
    try {
      const sres = await fetch('/api/scrape-reel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: clean }),
      });
      const sdata = await sres.json();
      if (!sres.ok) {
        if (sdata.error === 'pro_required') { setLocked(true); return; }
        throw new Error(tr('upload', 'scrapeError', lang));
      }
      const metrics: Metrics = { likes: sdata.likes ?? null, views: sdata.views ?? null, comments: sdata.comments ?? null, username: sdata.username ?? '' };
      const proxySrc = `/api/proxy-video?url=${encodeURIComponent(sdata.videoUrl)}`;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(proxySrc);
      setStepIdx(1);
      let frameData: { b64: string; t: number }[] = [];
      let data;
      try {
        // PRIMARY: Gemini native video straight from the scraped URL (motion + audio)
        const gc = new AbortController();
        const gt = setTimeout(() => gc.abort(), 55000);
        const res = await fetch('/api/analyze-video-gemini', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: sdata.videoUrl, lang, caption: sdata.caption, likes: sdata.likes, views: sdata.views, comments: sdata.comments }), signal: gc.signal,
        }).finally(() => clearTimeout(gt));
        if (!res.ok) throw new Error('gemini_failed');
        data = await res.json();
        // (thumbnail extracted in the background after the result is shown — don't block)
      } catch {
        // FALLBACK: frames via proxy → Claude
        frameData = await extractFramesFromSrc(proxySrc, false);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 55000);
        const res = await fetch('/api/analyze-video', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frames: frameData.map(f => f.b64), timestamps: frameData.map(f => f.t), lang, caption: sdata.caption, likes: sdata.likes, views: sdata.views, comments: sdata.comments }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));
        const d = await res.json();
        if (!res.ok) throw new Error(typeof d.error === 'string' ? d.error : tr('upload', 'scrapeError', lang));
        data = d;
      }
      setStepIdx(2);
      if (!isPro) markFreeUsed();
      setResult({ ...data, metrics });
      // history is saved in the background — never blocks the visible result
      try {
        let thumbFrames = frameData;
        if (!thumbFrames.length) { try { thumbFrames = await extractFramesFromSrc(proxySrc, false); } catch {} }
        const thumb = thumbFrames[0]?.b64 ? await makeThumb(thumbFrames[0].b64) : '';
        const entry = {
          name: sdata.username ? `@${sdata.username}` : 'Reel',
          thumb, videoTopic: data.videoTopic ?? null, hookScore: data.hookScore ?? null, bestHook: data.bestHook ?? null,
        };
        saveHistory({ id: Date.now(), date: new Date().toISOString(), ...entry });
        if (isSignedIn) {
          fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }).catch(() => {});
        }
      } catch {}
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tr('upload', 'scrapeError', lang));
    } finally { setLoading(false); }
  }, [blobUrl, isPro, isSignedIn, lang]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) analyze(f);
  };

  /* ── LOCKED ── */
  if (locked) return (
    <div className="border border-black/10 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
      <Lock size={28} />
      <p className="font-bold text-lg">{tr('result', 'locked', lang)}</p>
      <p className="text-sm text-[#666] max-w-xs">{tr('result', 'lockedSub', lang)}</p>
      {isSignedIn ? (
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90">{tr('result', 'lockedCta', lang)}</a>
      ) : (
        <a href="/login" className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90">{tr('result', 'lockedCta', lang)}</a>
      )}
    </div>
  );

  /* ── RESULT ── */
  if (result && blobUrl) {
    const s = result.hookScore;
    const scoreColor = s >= 8 ? '#16a34a' : s >= 5 ? '#d97706' : '#e8002d';
    const scoreLabel = s >= 8 ? tr('result', 'scoreStrong', lang) : s >= 5 ? tr('result', 'scoreMid', lang) : tr('result', 'scoreWeak', lang);
    const verdict = result.verdict || `${scoreLabel} — ${result.scoreReason ?? ''}`;
    const topExample = result.weakZones?.find(z => z.example)?.example ?? null;
    const firstTs = parseTimestamp(result.weakZones?.[0]?.timestamp ?? '0-3s');
    const toggleStep = (i: number) => setDoneSteps(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
    return (
      <div className="flex flex-col gap-10">

        {/* 1 — VERDICT (one bold phrase, not a number) */}
        <div className="text-center pt-2">
          <span className="inline-flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: scoreColor }}>{s}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: scoreColor }}>{scoreLabel}</span>
          </span>
          <h2 className="font-extrabold text-2xl md:text-[28px] leading-tight tracking-tight max-w-lg mx-auto" style={{ color: scoreColor }}>{verdict}</h2>
          {(result.scoreReason || result.audioHook) && (
            <p className="text-sm text-[#666] mt-3 max-w-md mx-auto leading-relaxed">
              {result.scoreReason}{result.audioHook ? ` 🔊 ${result.audioHook}` : ''}
            </p>
          )}
          {result.metrics && (result.metrics.views != null || result.metrics.likes != null) && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 text-[11px] text-[#777]">
              {result.metrics.username && <span className="font-semibold text-[#555]">@{result.metrics.username}</span>}
              {result.metrics.views != null && <span>👁 {fmt(result.metrics.views)}</span>}
              {result.metrics.likes != null && <span>❤️ {fmt(result.metrics.likes)}</span>}
              {result.metrics.comments != null && <span>💬 {fmt(result.metrics.comments)}</span>}
            </div>
          )}
        </div>

        {/* 2 — MAIN FIX (first thing, copy-ready) */}
        {result.bestHook && (
          <div className="rounded-3xl border-2 border-[#e8002d]/25 bg-[#fff8f8] p-6">
            <p className="text-[11px] font-bold text-[#e8002d] uppercase tracking-wider mb-3">🔥 {tr('result', 'mainFix', lang)}</p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg md:text-xl font-bold text-[#0a0a0a] leading-snug">«{result.bestHook.script}»</p>
              <CopyBtn text={result.bestHook.script} lang={lang} />
            </div>
            {result.bestHook.tip && (
              <p className="text-sm text-[#666] mt-3 leading-snug">
                <span className="font-semibold text-[#333]">{tr('result', 'fixTip', lang)}:</span> {result.bestHook.tip}
              </p>
            )}
          </div>
        )}

        {/* 3 — BEFORE → AFTER */}
        {topExample && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col rounded-2xl overflow-hidden border border-black/10">
              <div className="px-3 py-2 bg-[#fafafa] border-b border-black/8 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#999]" />
                <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">{tr('result', 'nowYou', lang)}</span>
              </div>
              <div className="aspect-[3/4] bg-black overflow-hidden">
                <UserVideoClip blobUrl={blobUrl} start={firstTs.start} end={firstTs.end} />
              </div>
            </div>
            <div className="flex flex-col rounded-2xl overflow-hidden border border-emerald-200">
              <div className="px-3 py-2 bg-[#f0fdf4] border-b border-emerald-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">{tr('result', 'doThis', lang)}</span>
              </div>
              <div className="aspect-[3/4] bg-black overflow-hidden relative">
                <HookPlayer videoUrl={topExample.video_url} thumbnailUrl={topExample.thumbnail_url} reelUrl={topExample.reelUrl} />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
                  <Eye size={8} />{fmt(topExample.views)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4 — CHECKLIST (what to do, Todoist-style) */}
        {result.weakZones && result.weakZones.length > 0 && (
          <div>
            <h3 className="font-bold text-lg tracking-tight mb-4">{tr('result', 'checklistTitle', lang)}</h3>
            <div className="flex flex-col gap-3">
              {result.weakZones.map((zone, i) => {
                const isDone = doneSteps.includes(i);
                return (
                  <div key={i} className="flex gap-3 items-start border border-black/10 rounded-2xl p-4">
                    <button onClick={() => toggleStep(i)}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-[#e8002d] border-[#e8002d]' : 'border-black/25 hover:border-[#e8002d]'}`}>
                      {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm leading-snug ${isDone ? 'line-through text-[#bbb]' : 'text-[#1a1a1a]'}`}>
                        {zone.fix || zone.whatIsWrong}
                      </p>
                      {zone.script && (
                        <div className="mt-2 flex items-center justify-between gap-2 bg-[#f5f5f5] rounded-xl px-3 py-2">
                          <p className="text-xs text-[#555] leading-snug min-w-0">«{zone.script}»</p>
                          <CopyBtn text={zone.script} lang={lang} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5 — CTA: re-check after reshooting */}
        <button onClick={() => { setResult(null); setBlobUrl(null); setDoneSteps([]); }}
          className="w-full bg-[#e8002d] text-white font-bold text-sm py-4 rounded-full hover:opacity-90 transition-opacity">
          {tr('result', 'recheck', lang)}
        </button>
      </div>
    );
  }

  /* ── UPLOAD ── */
  return (
    <div className="flex flex-col gap-4">
      <input ref={inputRef} type="file" accept="video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) analyze(f); }} />

      {loading ? (
        <div className="flex flex-col items-center gap-5 py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-black/10 rounded-full" />
            <div className="absolute inset-0 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{tr('loading', STEP_KEYS[stepIdx], lang)}</p>
            <div className="flex justify-center gap-1 mt-2">
              {STEP_KEYS.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= stepIdx ? 'bg-[#e8002d]' : 'bg-black/15'}`} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="flex flex-col gap-3"
        >
          {/* compact header — only before analysis */}
          <div className="mb-4 text-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <h1 className="font-bold text-2xl md:text-3xl tracking-tight">AI Hook Analyzer</h1>
            <p className="text-sm text-[#777] mt-1.5 max-w-md mx-auto leading-relaxed">{tr('pro', 'desc', lang)}</p>
          </div>

          {/* OpusClip-style combined bar: link + Analyze, or Upload */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form
              onSubmit={e => { e.preventDefault(); if (reelUrl.trim()) analyzeFromUrl(reelUrl); }}
              className={`flex-1 flex items-center gap-2 rounded-full pl-5 pr-1.5 py-1.5 border transition-colors ${dragging ? 'bg-[#fff5f6] border-[#e8002d]' : 'bg-[#f4f4f5] border-black/10'}`}
            >
              <Link2 size={16} className="text-black/35 shrink-0" />
              <input
                type="url"
                value={reelUrl}
                onChange={e => setReelUrl(e.target.value)}
                placeholder={tr('upload', 'dropLink', lang)}
                className="flex-1 bg-transparent text-[#0a0a0a] placeholder-[#999] text-sm outline-none min-w-0"
              />
              <button type="submit" disabled={!reelUrl.trim()}
                className="bg-[#e8002d] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap">
                {tr('upload', 'analyzeLink', lang)}
              </button>
            </form>

            <span className="text-[#aaa] text-xs text-center self-center">{tr('upload', 'or', lang)}</span>

            <button onClick={() => inputRef.current?.click()}
              className="border border-black/15 rounded-full px-6 py-3.5 text-sm font-bold hover:bg-black hover:text-white transition-colors whitespace-nowrap">
              {tr('upload', 'uploadFile', lang)}
            </button>
          </div>

          <p className="text-[11px] text-[#aaa] text-center flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8002d]" />{tr('upload', 'badge', lang)}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} className="shrink-0" />{error}
        </div>
      )}
    </div>
  );
}
