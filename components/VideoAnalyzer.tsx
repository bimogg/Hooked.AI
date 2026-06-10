'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, AlertCircle, Lock, Eye, Copy, Check } from 'lucide-react';
import HookPlayer from './HookPlayer';

const FREE_KEY = 'hooked_free_used';
function hasUsedFree() { try { return localStorage.getItem(FREE_KEY) === '1'; } catch { return false; } }

async function extractFrames(file: File): Promise<{ b64: string; t: number }[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url; video.muted = true; video.playsInline = true; video.crossOrigin = 'anonymous';
    video.onloadedmetadata = async () => {
      const dur = video.duration;
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d')!;
      const MAX = 12;
      const count = Math.min(MAX, Math.max(4, Math.floor(dur)));
      const times = Array.from({ length: count }, (_, i) => Math.min((dur / (count - 1)) * i, dur - 0.05));
      if (times[0] > 0.1) times.unshift(0);
      const frames: { b64: string; t: number }[] = [];
      for (const t of times.slice(0, MAX)) {
        await new Promise<void>(res => {
          video.currentTime = t;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push({ b64: canvas.toDataURL('image/jpeg', 0.7).split(',')[1], t: Math.round(t) });
            res();
          };
        });
      }
      URL.revokeObjectURL(url); resolve(frames);
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось загрузить видео')); };
  });
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

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={e => { e.preventDefault(); navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all shrink-0 whitespace-nowrap"
    >
      {done ? <><Check size={10} />Скопировано</> : <><Copy size={10} />Скопировать</>}
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
interface Result { hookScore: number; videoTopic: string; weakZones: WeakZone[]; }

const STEPS = ['Читаем видео...', 'ИИ ищет слабые места...', 'Подбираем примеры хуков...'];

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
  const inputRef = useRef<HTMLInputElement>(null);

  // cleanup blob on unmount / new upload
  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const analyze = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) { setError('Загрузи видео (MP4, MOV)'); return; }
    if (file.size > 300 * 1024 * 1024) { setError('Максимум 300MB'); return; }
    void hasUsedFree();
    // keep blob URL for left panel
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const newBlob = URL.createObjectURL(file);
    setBlobUrl(newBlob);

    setLoading(true); setError(''); setResult(null); setStepIdx(0);
    try {
      const frameData = await extractFrames(file);
      setStepIdx(1);
      const res = await fetch('/api/analyze-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames: frameData.map(f => f.b64), timestamps: frameData.map(f => f.t) }),
      });
      setStepIdx(2);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка');
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка. Попробуй ещё раз.');
    } finally { setLoading(false); }
  }, [blobUrl]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) analyze(f);
  };

  /* ── LOCKED ── */
  if (locked) return (
    <div className="border border-black/10 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
      <Lock size={28} />
      <p className="font-bold text-lg">Бесплатный анализ использован</p>
      <p className="text-sm text-[#666] max-w-xs">Купи Pro чтобы анализировать без ограничений</p>
      <a href="/pricing" className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90">Купить Pro →</a>
    </div>
  );

  /* ── RESULT ── */
  if (result && blobUrl) {
    const scoreColor = result.hookScore >= 8 ? '#16a34a' : result.hookScore >= 5 ? '#d97706' : '#e8002d';
    return (
      <div className="flex flex-col gap-6">

        {/* Score */}
        <div className="flex items-center gap-4 border border-black/10 rounded-2xl p-4">
          <p className="font-display font-extrabold text-5xl leading-none shrink-0" style={{ color: scoreColor }}>
            {result.hookScore}
          </p>
          <div>
            <p className="text-[10px] text-[#aaa] uppercase tracking-widest mb-0.5">из 10</p>
            {result.videoTopic && <p className="text-xs text-[#666]">{result.videoTopic}</p>}
          </div>
        </div>

        {/* Weak zones */}
        {result.weakZones?.map((zone, i) => {
          const { start, end } = parseTimestamp(zone.timestamp);
          return (
            <div key={i} className="flex flex-col rounded-2xl overflow-hidden border border-black/10">

              {/* Header */}
              <div className="bg-[#fff3f3] border-b border-[#e8002d]/15 px-4 py-2.5 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-[#e8002d] rounded-full text-white text-[10px] font-bold shrink-0">{i + 1}</span>
                <span className="text-[11px] font-bold text-[#e8002d] uppercase tracking-wider">{zone.timestamp}</span>
                <span className="text-sm text-[#333] font-medium leading-snug">{zone.whatIsWrong}</span>
              </div>

              {/* Split: left = their video, right = example */}
              <div className="flex items-stretch gap-0 px-3 py-3 bg-white">

                {/* LEFT — user's video */}
                <div className="flex flex-col flex-1 rounded-xl overflow-hidden border border-black/10">
                  <div className="px-2.5 py-1.5 bg-[#fafafa] border-b border-black/8 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e8002d]" />
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-wider">Твоё видео</span>
                  </div>
                  <div className="aspect-[9/14] bg-black overflow-hidden">
                    <UserVideoClip blobUrl={blobUrl} start={start} end={end} />
                  </div>
                </div>

                {/* CENTER label */}
                <div className="flex flex-col items-center justify-center px-2 gap-1 shrink-0">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-[#bbb] font-medium">Try</span>
                    <span className="text-[9px] text-[#bbb] font-medium">this</span>
                    <span className="text-[#bbb] text-sm">→</span>
                  </div>
                </div>

                {/* RIGHT — library hook example */}
                <div className="flex flex-col flex-1 rounded-xl overflow-hidden border border-emerald-200">
                  <div className="px-2.5 py-1.5 bg-[#f0fdf4] border-b border-emerald-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold text-[#888] uppercase tracking-wider">Как надо</span>
                  </div>
                  <div className="aspect-[9/14] bg-black overflow-hidden relative">
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
              </div>

              {/* Script */}
              <div className="bg-black px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Скрипт — скажи так вместо этого</p>
                  <p className="text-sm font-bold text-white leading-snug">"{zone.script}"</p>
                </div>
                <CopyBtn text={zone.script} />
              </div>

            </div>
          );
        })}

        {/* Library + upsell */}
        <a href="/library" className="text-center text-xs text-[#aaa] hover:text-black transition-colors">
          Смотреть все хуки в библиотеке →
        </a>
        <div className="border border-dashed border-black/15 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold">Хочешь анализировать все видео?</p>
          <a href="/pricing" className="inline-block mt-2 bg-black text-white text-xs font-bold px-6 py-2 rounded-full hover:opacity-80">
            Смотреть Pro →
          </a>
        </div>
        <button onClick={() => { setResult(null); setBlobUrl(null); }} className="text-xs text-[#ccc] hover:text-black transition-colors text-center">
          ← Загрузить другое видео
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
        className={`border-2 border-dashed rounded-2xl p-14 flex flex-col items-center gap-5 cursor-pointer transition-all text-center select-none ${
          dragging ? 'border-[#e8002d] bg-[#fff8f8]' : 'border-black/15 hover:border-black/40 bg-[#fafafa]'
        } ${loading ? 'pointer-events-none' : ''}`}
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
              <p className="text-sm font-medium">{STEPS[stepIdx]}</p>
              <div className="flex justify-center gap-1 mt-2">
                {STEPS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= stepIdx ? 'bg-[#e8002d]' : 'bg-black/15'}`} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
              <Upload size={24} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Загрузи своё видео</p>
              <p className="text-[#888] text-xs mt-1">MP4, MOV · до 300MB</p>
            </div>
            <span className="text-[10px] bg-black text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              1 анализ бесплатно
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} className="shrink-0" />{error}
        </div>
      )}
    </div>
  );
}
