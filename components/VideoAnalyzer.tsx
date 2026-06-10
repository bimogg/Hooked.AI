'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, AlertCircle, Lock, ExternalLink, Eye, Play } from 'lucide-react';

const FREE_KEY = 'hooked_free_used';
function hasUsedFree() { try { return localStorage.getItem(FREE_KEY) === '1'; } catch { return false; } }
function markFreeUsed() { try { localStorage.setItem(FREE_KEY, '1'); } catch {} }

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
      const times: number[] = Array.from({ length: count }, (_, i) =>
        Math.min((dur / (count - 1)) * i, dur - 0.05)
      );
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

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

interface ReferenceHook {
  creator_username: string; caption: string | null; views: number;
  thumbnail_url: string | null; niche: string; reelUrl: string;
}
interface Result {
  hookScore: number;
  mainProblem: string;
  whyHookTypes: string;
  bestHookTypes: string[];
  referenceHooks: ReferenceHook[];
}

const STEPS = ['Читаем видео...', 'ИИ смотрит весь ролик...', 'Подбираем хуки из библиотеки...'];

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
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyze = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) { setError('Загрузи видео (MP4, MOV)'); return; }
    if (file.size > 300 * 1024 * 1024) { setError('Максимум 300MB'); return; }
    // TODO: re-enable before launch
    // if (hasUsedFree()) { setLocked(true); return; }
    void hasUsedFree();
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
      // markFreeUsed(); // TODO: re-enable before launch
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка. Попробуй ещё раз.');
    } finally { setLoading(false); }
  }, []);

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
  if (result) {
    const scoreColor = result.hookScore >= 8 ? '#16a34a' : result.hookScore >= 5 ? '#d97706' : '#e8002d';
    return (
      <div className="flex flex-col gap-5">

        {/* Score + problem — compact */}
        <div className="flex items-center gap-4 border border-black/10 rounded-2xl p-4">
          <p className="font-display font-extrabold text-5xl leading-none shrink-0" style={{ color: scoreColor }}>
            {result.hookScore}
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-[#aaa] uppercase tracking-widest">из 10</p>
            <div className="flex items-start gap-1.5">
              <AlertCircle size={12} className="text-[#e8002d] mt-0.5 shrink-0" />
              <p className="text-sm text-[#333] leading-snug">{result.mainProblem}</p>
            </div>
          </div>
        </div>

        {/* Why these hooks — short */}
        {result.whyHookTypes && (
          <div className="px-4 py-3 bg-[#fffbeb] border border-amber-200 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Почему именно эти хуки</p>
            <p className="text-xs text-[#555] leading-relaxed">{result.whyHookTypes}</p>
          </div>
        )}

        {/* MAIN: video cards */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#333] mb-3">
            Попробуй такой хук — нажми и посмотри как сделано
          </p>
          <div className="grid grid-cols-2 gap-3">
            {result.referenceHooks.map((h, i) => (
              <a key={i} href={h.reelUrl} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl overflow-hidden border border-black/10 hover:border-[#e8002d]/40 hover:shadow-md transition-all">
                {/* Thumbnail */}
                <div className="relative aspect-[9/14] bg-[#f0f0f0]">
                  {h.thumbnail_url
                    ? <img src={h.thumbnail_url} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                    : <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  }
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/50 group-hover:bg-[#e8002d] rounded-full flex items-center justify-center transition-colors">
                      <Play size={18} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  {/* Hook type badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${NICHE_COLOR[h.niche] ?? 'bg-gray-100 text-gray-700'}`}>
                      {h.niche}
                    </span>
                  </div>
                  {/* Views */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md">
                    <Eye size={8} />{fmt(h.views)}
                  </div>
                </div>
                {/* Info */}
                <div className="p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111]">@{h.creator_username}</p>
                    <p className="text-[10px] text-[#888] mt-0.5 leading-snug line-clamp-2">{h.caption}</p>
                  </div>
                  <ExternalLink size={12} className="text-[#ccc] group-hover:text-[#e8002d] transition-colors shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Library link */}
        <a href={`/library?type=${encodeURIComponent(result.bestHookTypes[0] ?? '')}`}
          className="flex items-center justify-center gap-2 py-3 border border-black/10 rounded-xl text-xs font-bold hover:border-black transition-colors">
          Смотреть больше {result.bestHookTypes[0]} в библиотеке →
        </a>

        {/* Upsell */}
        <div className="border border-dashed border-black/15 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold">Хочешь анализировать все видео?</p>
          <a href="/pricing" className="inline-block mt-2 bg-black text-white text-xs font-bold px-6 py-2 rounded-full hover:opacity-80">
            Смотреть Pro →
          </a>
        </div>

        <button onClick={() => setResult(null)} className="text-xs text-[#ccc] hover:text-black transition-colors text-center">
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
