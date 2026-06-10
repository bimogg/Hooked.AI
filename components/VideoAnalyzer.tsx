'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Zap, Copy, Check, AlertCircle, Lock, Clock, ExternalLink, ChevronRight, Eye, Mic } from 'lucide-react';

const FREE_KEY = 'hooked_free_used';
function hasUsedFree() { try { return localStorage.getItem(FREE_KEY) === '1'; } catch { return false; } }
function markFreeUsed() { try { localStorage.setItem(FREE_KEY, '1'); } catch {} }

async function extractFrames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = async () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d')!;
      const times = [0, 1, 2, 3].filter(t => t <= video.duration - 0.05);
      if (times.length === 0) times.push(0);
      const frames: string[] = [];

      for (const t of times) {
        await new Promise<void>(res => {
          video.currentTime = t;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.75).split(',')[1]);
            res();
          };
        });
      }
      URL.revokeObjectURL(url);
      resolve(frames);
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось загрузить видео')); };
  });
}

const SCORE_COLOR = (s: number) =>
  s >= 8 ? '#16a34a' : s >= 6 ? '#d97706' : s >= 4 ? '#ea580c' : '#e8002d';
const SCORE_LABEL = (s: number) =>
  s >= 8 ? 'Сильный хук' : s >= 6 ? 'Средний хук' : s >= 4 ? 'Слабый хук' : 'Критически слабый';

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-[#888] hover:text-black transition-colors px-3 py-1.5 rounded-full border border-black/10 hover:border-black/30"
    >
      {done ? <><Check size={11} className="text-emerald-600" />Скопировано</> : <><Copy size={11} />Копировать скрипт</>}
    </button>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

interface TimelineItem { second: number; what: string; problem: string; fix: string; }
interface ReferenceHook {
  creator_username: string;
  caption: string | null;
  views: number;
  thumbnail_url: string | null;
  niche: string;
  reelUrl: string;
}
interface Result {
  hookScore: number;
  verdict: string;
  timeline: TimelineItem[];
  problems: string[];
  hookType: string;
  hookScript: string;
  hookDelivery: string;
  placement: string;
  why: string;
  referenceHooks: ReferenceHook[];
}

const STEPS = ['Извлекаем кадры...', 'ИИ смотрит первые 3 секунды...', 'Анализирует хук...', 'Пишет скрипт для тебя...'];

export default function VideoAnalyzer() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // avoid SSR hydration mismatch
  useRef(() => { setMounted(true); });
  if (typeof window !== 'undefined' && !mounted) setTimeout(() => setMounted(true), 0);

  const analyze = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) { setError('Загрузи видео файл (MP4, MOV)'); return; }
    if (file.size > 300 * 1024 * 1024) { setError('Файл слишком большой. Максимум 300MB'); return; }
    if (hasUsedFree()) { setLocked(true); return; }

    setLoading(true); setError(''); setResult(null); setStepIdx(0);

    try {
      setStepIdx(0);
      const frames = await extractFrames(file);
      setStepIdx(1);
      await new Promise(r => setTimeout(r, 400));
      setStepIdx(2);

      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames, caption: '' }),
      });
      setStepIdx(3);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка анализа');

      markFreeUsed();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onFile = (f: File) => analyze(f);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  /* ── LOCKED ── */
  if (locked) return (
    <div className="border border-black/10 rounded-2xl p-10 flex flex-col items-center gap-4 text-center bg-[#fafafa]">
      <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
        <Lock size={22} className="text-white" />
      </div>
      <h3 className="font-display font-extrabold text-xl uppercase">Бесплатный анализ использован</h3>
      <p className="text-[#666] text-sm max-w-xs leading-relaxed">
        Ты уже проверил 1 видео бесплатно. Купи Pro чтобы анализировать неограниченно.
      </p>
      <a href="/pricing" className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity mt-1">
        Купить Pro →
      </a>
      <button onClick={() => { try { localStorage.removeItem(FREE_KEY); } catch {} setLocked(false); }}
        className="text-xs text-[#ccc] hover:text-black transition-colors">
        demo: сбросить
      </button>
    </div>
  );

  /* ── RESULT ── */
  if (result) return (
    <div className="flex flex-col gap-5">

      {/* Score card */}
      <div className="border border-black/10 rounded-2xl p-6 flex items-center gap-6">
        <div className="shrink-0 text-center">
          <p className="font-display font-extrabold text-6xl leading-none" style={{ color: SCORE_COLOR(result.hookScore) }}>
            {result.hookScore}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-[#aaa] mt-1">из 10</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SCORE_COLOR(result.hookScore) }}>
            {SCORE_LABEL(result.hookScore)}
          </span>
          <p className="text-sm text-[#333] leading-snug font-medium">{result.verdict}</p>
        </div>
      </div>

      {/* Timeline */}
      {result.timeline?.length > 0 && (
        <div className="border border-black/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10 flex items-center gap-2">
            <Clock size={13} className="text-[#888]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#555]">Секунда за секундой — что происходит</p>
          </div>
          <div className="divide-y divide-black/5">
            {result.timeline.map((row) => (
              <div key={row.second} className="px-5 py-4 grid grid-cols-[40px_1fr] gap-4">
                <div className="flex flex-col items-center pt-0.5">
                  <span className="font-display font-extrabold text-sm text-[#bbb]">{row.second}s</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-[#555] leading-snug">{row.what}</p>
                  {row.problem && (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={11} className="text-[#e8002d] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#e8002d] leading-snug">{row.problem}</p>
                    </div>
                  )}
                  {row.fix && (
                    <div className="flex items-start gap-1.5">
                      <ChevronRight size={11} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-700 leading-snug font-medium">{row.fix}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problems */}
      {result.problems?.length > 0 && (
        <div className="border border-[#e8002d]/20 bg-[#fff8f8] rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#e8002d] mb-3">Главные проблемы</p>
          <ul className="flex flex-col gap-2.5">
            {result.problems.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#444] leading-snug">
                <span className="shrink-0 w-4 h-4 bg-[#e8002d] text-white rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5">{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* New hook script */}
      <div className="border-2 border-black rounded-2xl p-5 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-[#e8002d]" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Твой новый хук</p>
            <span className="text-[9px] bg-[#e8002d] text-white px-2 py-0.5 rounded-full font-bold uppercase">
              {result.hookType}
            </span>
          </div>
        </div>
        <p className="text-lg font-bold leading-snug text-[#0a0a0a] mt-3 mb-1">
          &ldquo;{result.hookScript}&rdquo;
        </p>
        {result.hookDelivery && (
          <div className="flex items-start gap-1.5 mt-3 mb-4">
            <Mic size={11} className="text-[#888] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#666] leading-snug italic">{result.hookDelivery}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-black/10">
          <p className="text-[10px] text-[#aaa]">{result.placement}</p>
          <CopyBtn text={result.hookScript} />
        </div>
        <p className="text-[11px] text-[#888] leading-relaxed mt-3 pt-3 border-t border-black/5">{result.why}</p>
      </div>

      {/* Reference hooks from library */}
      {result.referenceHooks?.length > 0 && (
        <div className="border border-black/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#555]">
              Попробуй хук от этих блоггеров — тип: {result.hookType}
            </p>
          </div>
          <div className="divide-y divide-black/5">
            {result.referenceHooks.map((h, i) => (
              <a
                key={i}
                href={h.reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group"
              >
                {h.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.thumbnail_url} alt="" className="w-10 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-[#f0f0f0] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0a0a0a]">@{h.creator_username}</p>
                  <p className="text-[11px] text-[#666] leading-snug mt-0.5 line-clamp-2">{h.caption}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Eye size={10} className="text-[#aaa]" />
                    <span className="text-[10px] text-[#aaa]">{fmt(h.views)} просмотров</span>
                  </div>
                </div>
                <ExternalLink size={13} className="text-[#ccc] group-hover:text-[#e8002d] transition-colors shrink-0" />
              </a>
            ))}
          </div>
          <div className="px-5 py-3 bg-[#fafafa] border-t border-black/5">
            <a href="/library" className="text-xs text-[#888] hover:text-black transition-colors">
              Смотреть все хуки в библиотеке →
            </a>
          </div>
        </div>
      )}

      {/* Upsell */}
      <div className="border border-dashed border-black/15 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold">Хочешь анализировать все видео?</p>
        <p className="text-xs text-[#888] mt-1">Pro даёт неограниченные анализы и доступ к полной библиотеке хуков</p>
        <a href="/pricing" className="inline-block mt-3 bg-black text-white text-xs font-bold px-6 py-2.5 rounded-full hover:opacity-80 transition-opacity">
          Смотреть Pro планы →
        </a>
      </div>

      <button onClick={() => setResult(null)} className="text-xs text-[#ccc] hover:text-black transition-colors text-center">
        ← Загрузить другое видео
      </button>
    </div>
  );

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
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

        {loading ? (
          <>
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-2 border-black/10 rounded-full" />
              <div className="absolute inset-0 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium text-[#333]">{STEPS[stepIdx]}</p>
              <div className="flex gap-1 mt-1">
                {STEPS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= stepIdx ? 'bg-[#e8002d]' : 'bg-black/15'}`} />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#aaa]">Не закрывай страницу</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
              <Upload size={26} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Перетащи своё Reel сюда</p>
              <p className="text-[#888] text-xs mt-1">или нажми для выбора файла</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] bg-black text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
                1 анализ бесплатно
              </span>
              <p className="text-[10px] text-[#bbb]">MP4, MOV · до 300MB · анализ первых 3 секунд</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* What you'll get */}
      {!loading && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '🎯', label: 'Оценка хука 1–10' },
            { icon: '⏱', label: 'Разбор по секундам' },
            { icon: '✍️', label: 'Готовый скрипт' },
            { icon: '📌', label: 'Примеры от блоггеров' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 border border-black/8 rounded-xl px-3 py-2.5">
              <span className="text-sm">{icon}</span>
              <span className="text-[11px] text-[#555] font-medium">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
