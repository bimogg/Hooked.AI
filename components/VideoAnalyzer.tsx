'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Copy, Check, AlertCircle, Lock, ExternalLink, Eye, Play } from 'lucide-react';

const FREE_KEY = 'hooked_free_used';
function hasUsedFree() { try { return localStorage.getItem(FREE_KEY) === '1'; } catch { return false; } }
function markFreeUsed() { try { localStorage.setItem(FREE_KEY, '1'); } catch {} }

async function extractFrames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url; video.muted = true; video.playsInline = true; video.crossOrigin = 'anonymous';
    video.onloadedmetadata = async () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d')!;
      const times = [0, 1, 2, 3].filter(t => t <= video.duration - 0.05);
      if (!times.length) times.push(0);
      const frames: string[] = [];
      for (const t of times) {
        await new Promise<void>(res => {
          video.currentTime = t;
          video.onseeked = () => { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); frames.push(canvas.toDataURL('image/jpeg', 0.75).split(',')[1]); res(); };
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

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-[#888] hover:text-black transition-colors">
      {done ? <><Check size={11} className="text-emerald-600" />Скопировано</> : <><Copy size={11} />Копировать</>}
    </button>
  );
}

interface ReferenceHook { creator_username: string; caption: string | null; views: number; thumbnail_url: string | null; niche: string; reelUrl: string; }
interface Result {
  hookScore: number; verdict: string;
  timeline: { second: number; what: string; problem: string; fix: string }[];
  problems: string[]; hookType: string; hookScript: string;
  hookDelivery: string; placement: string; why: string;
  referenceHooks: ReferenceHook[];
}

const STEPS = ['Извлекаем кадры...', 'ИИ смотрит первые 3 секунды...', 'Анализирует хук...', 'Пишет скрипт...'];

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
    if (hasUsedFree()) { setLocked(true); return; }
    setLoading(true); setError(''); setResult(null); setStepIdx(0);
    try {
      const frames = await extractFrames(file);
      setStepIdx(1); await new Promise(r => setTimeout(r, 300)); setStepIdx(2);
      const res = await fetch('/api/analyze-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames }),
      });
      setStepIdx(3);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка');
      markFreeUsed(); setResult(data);
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
      <button onClick={() => { try { localStorage.removeItem(FREE_KEY); } catch {} setLocked(false); }} className="text-xs text-[#ccc] hover:text-black">сбросить (demo)</button>
    </div>
  );

  /* ── RESULT ── */
  if (result) {
    const scoreColor = result.hookScore >= 8 ? '#16a34a' : result.hookScore >= 6 ? '#d97706' : '#e8002d';

    return (
      <div className="flex flex-col gap-4">

        {/* Score */}
        <div className="flex items-center gap-5 border border-black/10 rounded-2xl p-5">
          <p className="font-display font-extrabold text-6xl leading-none shrink-0" style={{ color: scoreColor }}>
            {result.hookScore}
          </p>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#aaa] mb-1">из 10</p>
            <p className="text-sm font-semibold text-[#111] leading-snug">{result.verdict}</p>
          </div>
        </div>

        {/* Problems — short */}
        {result.problems?.length > 0 && (
          <div className="flex flex-col gap-2">
            {result.problems.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-3 bg-[#fff8f8] border border-[#e8002d]/15 rounded-xl">
                <AlertCircle size={13} className="text-[#e8002d] mt-0.5 shrink-0" />
                <p className="text-xs text-[#333] leading-snug">{p}</p>
              </div>
            ))}
          </div>
        )}

        {/* New hook script */}
        <div className="border-2 border-black rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider">Новый хук · {result.hookType}</span>
            <CopyBtn text={result.hookScript} />
          </div>
          <p className="text-base font-bold leading-snug">"{result.hookScript}"</p>
          {result.hookDelivery && (
            <p className="text-xs text-[#888] mt-3 leading-relaxed">{result.hookDelivery}</p>
          )}
        </div>

        {/* Reference hooks — MAIN VISUAL BLOCK */}
        {result.referenceHooks?.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#555]">
              Посмотри как делают — {result.hookType}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {result.referenceHooks.map((h, i) => (
                <a key={i} href={h.reelUrl} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl overflow-hidden border border-black/10 hover:border-black/30 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/14] bg-[#f0f0f0]">
                    {h.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    {/* play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <Play size={16} className="text-black ml-0.5" fill="black" />
                      </div>
                    </div>
                    {/* views badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md">
                      <Eye size={8} />{fmt(h.views)}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-[#111]">@{h.creator_username}</p>
                      <p className="text-[9px] text-[#888] mt-0.5 line-clamp-1">{h.caption?.slice(0, 40)}</p>
                    </div>
                    <ExternalLink size={11} className="text-[#ccc] group-hover:text-[#e8002d] transition-colors shrink-0" />
                  </div>
                </a>
              ))}
            </div>
            <a href="/library" className="text-xs text-[#aaa] hover:text-black transition-colors text-center pt-1">
              Смотреть все хуки в библиотеке →
            </a>
          </div>
        )}

        {/* Upsell */}
        <div className="border border-dashed border-black/15 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold">Хочешь анализировать все свои видео?</p>
          <a href="/pricing" className="inline-block mt-2 bg-black text-white text-xs font-bold px-6 py-2.5 rounded-full hover:opacity-80 transition-opacity">
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
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= stepIdx ? 'bg-[#e8002d]' : 'bg-black/15'}`} />
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
