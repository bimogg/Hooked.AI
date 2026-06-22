'use client';
// folder upload UI
import { useState, useRef, useCallback, useEffect } from 'react';
import { AlertCircle, Lock, Eye, Copy, Check } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import HookPlayer from './HookPlayer';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';
import { supabase } from '@/lib/supabase';

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
      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all shrink-0 whitespace-nowrap"
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
  timestamp: string; whatIsWrong: string; hookType: string; script: string;
  example: HookExample | null;
}
interface Metrics { likes: number | null; views: number | null; comments: number | null; username: string }
interface Result { hookScore: number; scoreReason?: string | null; videoTopic: string; audioHook?: string | null; bestHook?: { script: string; hookType: string; tip: string } | null; weakZones: WeakZone[]; metrics?: Metrics | null; }

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();
  const { isSignedIn, user } = useUser();
  const checkoutUrl = (() => {
    const email = user?.primaryEmailAddress?.emailAddress;
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
    if (!file.type.startsWith('video/')) { setError('Загрузи видео (MP4, MOV)'); return; }
    if (file.size > 300 * 1024 * 1024) { setError('Максимум 300MB'); return; }
    if (!isPro && hasUsedFree()) { setLocked(true); return; }
    // keep blob URL for left panel
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const newBlob = URL.createObjectURL(file);
    setBlobUrl(newBlob);

    setLoading(true); setError(''); setResult(null); setStepIdx(0);
    try {
      const frameData = await extractFrames(file); // for thumbnail + Claude fallback
      setStepIdx(1);
      let data;
      try {
        // PRIMARY: Gemini native video (sees motion + audio) — upload file to Supabase, analyze server-side
        const sign = await (await fetch('/api/upload-url', { method: 'POST' })).json();
        if (!sign?.path) throw new Error('no_upload_url');
        const up = await supabase.storage.from('videos').uploadToSignedUrl(sign.path, sign.token, file);
        if (up.error) throw up.error;
        const gc = new AbortController();
        const gt = setTimeout(() => gc.abort(), 55000);
        const res = await fetch('/api/analyze-video-gemini', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storagePath: sign.path, lang }), signal: gc.signal,
        }).finally(() => clearTimeout(gt));
        if (!res.ok) throw new Error('gemini_failed');
        data = await res.json();
      } catch {
        // FALLBACK: frame-based Claude
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 55000);
        const res = await fetch('/api/analyze-video', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frames: frameData.map(f => f.b64), timestamps: frameData.map(f => f.t), lang }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeout));
        const d = await res.json();
        if (!res.ok) throw new Error(typeof d.error === 'string' ? d.error : 'Ошибка анализа. Попробуй ещё раз.');
        data = d;
      }
      setStepIdx(2);
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
        <SignInButton mode="modal" forceRedirectUrl="/pro" signUpForceRedirectUrl="/pro">
          <button className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 cursor-pointer">{tr('result', 'lockedCta', lang)}</button>
        </SignInButton>
      )}
    </div>
  );

  /* ── RESULT ── */
  if (result && blobUrl) {
    const scoreColor = result.hookScore >= 8 ? '#16a34a' : result.hookScore >= 5 ? '#d97706' : '#e8002d';
    return (
      <div className="flex flex-col gap-10">

        {/* Score */}
        <div className="flex items-center gap-4 border border-black/10 rounded-2xl p-6">
          <p className="font-display font-extrabold text-5xl leading-none shrink-0" style={{ color: scoreColor }}>
            {result.hookScore}
          </p>
          <div>
            <p className="text-[10px] text-[#aaa] uppercase tracking-widest mb-0.5">{tr('result', 'outOf', lang)}</p>
            {result.videoTopic && <p className="text-xs text-[#666]">{result.videoTopic}</p>}
            {result.scoreReason && <p className="text-xs text-[#999] mt-1.5 leading-snug">{result.scoreReason}</p>}
            {result.audioHook && <p className="text-xs text-[#999] mt-1.5 leading-snug">🔊 {result.audioHook}</p>}
            {result.metrics && (result.metrics.views != null || result.metrics.likes != null) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-[#777]">
                {result.metrics.username && <span className="font-semibold text-[#555]">@{result.metrics.username}</span>}
                {result.metrics.views != null && <span>👁 {fmt(result.metrics.views)}</span>}
                {result.metrics.likes != null && <span>❤️ {fmt(result.metrics.likes)}</span>}
                {result.metrics.comments != null && <span>💬 {fmt(result.metrics.comments)}</span>}
              </div>
            )}
          </div>
        </div>

        {result.bestHook && (
          <div className="rounded-2xl overflow-hidden border border-[#e8002d]/30 bg-[#fff8f8]">
            <div className="px-5 py-3 border-b border-[#e8002d]/15 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#e8002d] uppercase tracking-wider">{tr('result', 'bestHook', lang)}</span>
              {result.bestHook.hookType && <span className="text-[10px] text-[#888]">{result.bestHook.hookType}</span>}
            </div>
            <div className="px-5 py-4">
              <p className="text-base font-bold text-[#0a0a0a] leading-snug">&quot;{result.bestHook.script}&quot;</p>
              {result.bestHook.tip && <p className="text-xs text-[#666] mt-2 leading-snug">{result.bestHook.tip}</p>}
            </div>
          </div>
        )}

        {/* Weak zones */}
        {result.weakZones?.map((zone, i) => {
          const { start, end } = parseTimestamp(zone.timestamp);
          return (
            <div key={i} className="flex flex-col rounded-2xl overflow-hidden border border-black/10">

              {/* Header */}
              <div className="bg-[#fff3f3] border-b border-[#e8002d]/15 px-5 py-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-[#e8002d] rounded-full text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                <span className="text-[11px] font-bold text-[#e8002d] uppercase tracking-wider">{zone.timestamp}</span>
                <span className="text-sm text-[#333] font-medium leading-snug">{zone.whatIsWrong}</span>
              </div>

              {/* Split: left = their video, right = example */}
              <div className="flex items-stretch gap-0 px-4 py-5 bg-white">

                {/* LEFT — user's video */}
                <div className="flex flex-col flex-1 rounded-xl overflow-hidden border border-black/10">
                  <div className="px-2.5 py-1.5 bg-[#fafafa] border-b border-black/8 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8002d]" />
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-wider">{tr('result', 'yourVideo', lang)}</span>
                  </div>
                  <div className="aspect-[3/4] bg-black overflow-hidden">
                    <UserVideoClip blobUrl={blobUrl} start={start} end={end} />
                  </div>
                </div>

                {zone.example && (
                <>
                {/* CENTER label */}
                <div className="flex flex-col items-center justify-center px-2 gap-0.5 shrink-0">
                  {tr('result', 'tryThis', lang).split(' ').map((w, i) => (
                    <span key={i} className="text-[9px] text-[#bbb] font-medium">{w}</span>
                  ))}
                  <span className="text-[#bbb] text-sm mt-0.5">→</span>
                </div>

                {/* RIGHT — library hook example */}
                <div className="flex flex-col flex-1 rounded-xl overflow-hidden border border-emerald-200">
                  <div className="px-2.5 py-1.5 bg-[#f0fdf4] border-b border-emerald-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-wider">{tr('result', 'howTo', lang)}</span>
                  </div>
                  <div className="aspect-[3/4] bg-black overflow-hidden relative">
                    {zone.example ? (
                      <>
                        <HookPlayer
                          videoUrl={zone.example.video_url}
                          thumbnailUrl={zone.example.thumbnail_url}
                          reelUrl={zone.example.reelUrl}
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
                          <Eye size={8} />{fmt(zone.example.views)}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">нет примера</div>
                    )}
                  </div>
                </div>
                </>
                )}
              </div>

              {/* Script */}
              <div className="bg-black px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">{tr('result', 'script', lang)}</p>
                  <p className="text-sm font-bold text-white leading-snug">"{zone.script}"</p>
                </div>
                <CopyBtn text={zone.script} lang={lang} />
              </div>

            </div>
          );
        })}

        {/* Library + upsell */}
        <a href="/library" className="text-center text-xs text-[#aaa] hover:text-black transition-colors">
          {tr('result', 'library', lang)}
        </a>
        <div className="border border-dashed border-black/15 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold">{tr('result', 'upsellTitle', lang)}</p>
          <a href="/pricing" className="inline-block mt-2 bg-black text-white text-xs font-bold px-6 py-2 rounded-full hover:opacity-80">
            {tr('result', 'upsellCta', lang)}
          </a>
        </div>
        <button onClick={() => { setResult(null); setBlobUrl(null); }} className="text-xs text-[#ccc] hover:text-black transition-colors text-center">
          {tr('result', 'another', lang)}
        </button>
      </div>
    );
  }

  /* ── UPLOAD ── */
  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`flex flex-col items-center gap-5 cursor-pointer select-none py-6 ${loading ? 'pointer-events-none' : ''}`}
      >
        <input ref={inputRef} type="file" accept="video/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) analyze(f); }} />

        {loading ? (
          <>
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-black/10 rounded-full" />
              <div className="absolute inset-0 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium">{tr('loading', STEP_KEYS[stepIdx], lang)}</p>
              <div className="flex justify-center gap-1 mt-2">
                {STEP_KEYS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= stepIdx ? 'bg-[#e8002d]' : 'bg-black/15'}`} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className={`folder ${dragging ? 'is-open' : ''}`}>
            <div className="folder-back" />
            <div className="folder-papers">
              <span className="paper" />
              <span className="paper" />
              <span className="paper" />
            </div>
            <div className="folder-front">
              <div className="folder-front-inner">
                <p className="font-bold text-base leading-tight">{tr('upload', 'title', lang)}</p>
                <p className="text-white/75 text-[11px] mt-0.5">{tr('upload', 'subtitle', lang)}</p>
                <span className="folder-badge">{tr('upload', 'badge', lang)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* or — analyze by Instagram link (Pro) */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-[10px] uppercase tracking-widest text-[#bbb]">{tr('upload', 'or', lang)}</span>
        <div className="h-px flex-1 bg-black/10" />
      </div>
      <form
        onSubmit={e => { e.preventDefault(); if (!loading && reelUrl.trim()) analyzeFromUrl(reelUrl); }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <input
          type="url"
          value={reelUrl}
          onChange={e => setReelUrl(e.target.value)}
          placeholder={tr('upload', 'linkPlaceholder', lang)}
          disabled={loading}
          className="flex-1 border border-black/15 rounded-full px-5 py-3 text-sm focus:border-black/40 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !reelUrl.trim()}
          className="bg-black text-white font-bold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap"
        >
          {tr('upload', 'analyzeLink', lang)}
        </button>
      </form>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} className="shrink-0" />{error}
        </div>
      )}
    </div>
  );
}
