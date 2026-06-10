'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Zap, Copy, Check, AlertCircle, Lock } from 'lucide-react';

const FREE_KEY = 'hooked_free_used';

function hasUsedFree() {
  try { return localStorage.getItem(FREE_KEY) === '1'; } catch { return false; }
}
function markFreeUsed() {
  try { localStorage.setItem(FREE_KEY, '1'); } catch {}
}

async function extractFrames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = Math.round(640 * (video.videoHeight / video.videoWidth));
      const ctx = canvas.getContext('2d')!;
      const frames: string[] = [];
      const times = [0, 1, 2, 3].filter(t => t < video.duration);

      for (const t of times) {
        await new Promise<void>(res => {
          video.currentTime = t;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            frames.push(b64);
            res();
          };
        });
      }
      URL.revokeObjectURL(url);
      resolve(frames);
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Video load failed')); };
  });
}

const SCORE_COLOR = (s: number) =>
  s >= 8 ? 'text-emerald-600' : s >= 5 ? 'text-amber-500' : 'text-[#e8002d]';

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1 text-[11px] text-[#888] hover:text-black transition-colors">
      {done ? <><Check size={11} className="text-emerald-600" />Скопировано</> : <><Copy size={11} />Копировать</>}
    </button>
  );
}

interface Result {
  hookScore: number;
  verdict: string;
  problems: string[];
  hookType: string;
  hookScript: string;
  placement: string;
  why: string;
}

export default function VideoAnalyzer() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // hydrate on mount to avoid SSR mismatch
  useState(() => { setHydrated(true); });

  const analyze = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) { setError('Загрузи видео файл (mp4, mov)'); return; }
    if (file.size > 200 * 1024 * 1024) { setError('Файл слишком большой. Максимум 200MB'); return; }

    if (hasUsedFree()) { setLocked(true); return; }

    setLoading(true); setError(''); setResult(null);

    try {
      setStep('Читаем видео...');
      const frames = await extractFrames(file);

      setStep('ИИ анализирует первые 3 секунды...');
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames, caption: '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка');

      markFreeUsed();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка. Попробуй ещё раз.');
    } finally {
      setLoading(false); setStep('');
    }
  }, []);

  const onFile = (f: File) => analyze(f);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  if (!hydrated) return null;

  /* ── LOCKED state ── */
  if (locked) return (
    <div className="border border-black/10 rounded-2xl p-10 flex flex-col items-center gap-4 text-center bg-[#fafafa]">
      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
        <Lock size={20} className="text-white" />
      </div>
      <h3 className="font-display font-extrabold text-xl uppercase">Бесплатный анализ использован</h3>
      <p className="text-[#666] text-sm max-w-xs leading-relaxed">
        Ты уже проверил 1 видео бесплатно. Чтобы анализировать больше — купи Pro.
      </p>
      <a href="/pricing"
        className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity mt-2">
        Купить Pro →
      </a>
      <button onClick={() => setLocked(false)} className="text-xs text-[#bbb] hover:text-black transition-colors">
        Попробовать ещё раз (demo)
      </button>
    </div>
  );

  /* ── RESULT state ── */
  if (result) return (
    <div className="flex flex-col gap-4">
      {/* score */}
      <div className="border border-black/10 rounded-2xl p-6 flex items-center gap-5">
        <div className="text-center shrink-0">
          <p className={`font-display font-extrabold text-5xl leading-none ${SCORE_COLOR(result.hookScore)}`}>
            {result.hookScore}
          </p>
          <p className="text-[10px] text-[#aaa] mt-1 uppercase tracking-wider">из 10</p>
        </div>
        <div>
          <p className="font-semibold text-sm leading-snug">{result.verdict}</p>
        </div>
      </div>

      {/* problems */}
      {result.problems?.length > 0 && (
        <div className="border border-[#e8002d]/20 bg-[#fff8f8] rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#e8002d] mb-3">Что не так с хуком</p>
          <ul className="flex flex-col gap-2">
            {result.problems.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#444]">
                <AlertCircle size={13} className="text-[#e8002d] mt-0.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* hook script */}
      <div className="border border-black/10 rounded-2xl p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#e8002d]" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Новый хук</p>
            <span className="text-[9px] bg-[#e8002d] text-white px-2 py-0.5 rounded-full uppercase font-bold">
              {result.hookType}
            </span>
          </div>
          <span className="text-[10px] text-[#aaa]">{result.placement}</span>
        </div>
        <p className="text-base font-semibold leading-snug text-[#0a0a0a]">
          &ldquo;{result.hookScript}&rdquo;
        </p>
        <div className="flex justify-end mt-3">
          <CopyBtn text={result.hookScript} />
        </div>
      </div>

      {/* why */}
      <p className="text-[11px] text-[#888] leading-relaxed px-1">{result.why}</p>

      {/* upsell */}
      <div className="border border-dashed border-black/15 rounded-2xl p-5 text-center mt-1">
        <p className="text-sm font-semibold">Хочешь анализировать все свои видео?</p>
        <a href="/pricing" className="inline-block mt-2 text-[#e8002d] text-sm font-bold hover:underline">
          Смотреть Pro планы →
        </a>
      </div>

      <button onClick={() => { setResult(null); }}
        className="text-xs text-[#bbb] hover:text-black transition-colors text-center">
        ← Загрузить другое видео
      </button>
    </div>
  );

  /* ── UPLOAD state ── */
  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all text-center ${
          dragging ? 'border-[#e8002d] bg-[#fff8f8]' : 'border-black/15 hover:border-black/30 bg-[#fafafa]'
        } ${loading ? 'pointer-events-none' : ''}`}>

        <input ref={inputRef} type="file" accept="video/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

        {loading ? (
          <>
            <div className="w-12 h-12 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#888]">{step}</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
              <Upload size={24} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Загрузи своё Reel</p>
              <p className="text-[#888] text-xs mt-1">MP4, MOV · до 200MB · ИИ смотрит первые 3 секунды</p>
            </div>
            <span className="text-[10px] bg-black text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              1 анализ бесплатно
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
