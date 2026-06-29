'use client';
import { useState, useEffect } from 'react';
import { Eye, Heart, Zap, Copy, Check, Loader2, ArrowRight, ExternalLink, Lock, RotateCcw } from 'lucide-react';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const HOOK_COLORS: Record<string, string> = {
  'Hook Tutorial':   'bg-violet-50 text-violet-700 border-violet-200',
  'Visual Hook':     'bg-pink-50 text-pink-700 border-pink-200',
  'Question Hook':   'bg-sky-50 text-sky-700 border-sky-200',
  'Tutorial Hook':   'bg-teal-50 text-teal-700 border-teal-200',
  'Engagement Hook': 'bg-orange-50 text-orange-700 border-orange-200',
  'Curiosity Hook':  'bg-amber-50 text-amber-700 border-amber-200',
  'Warning Hook':    'bg-red-50 text-red-700 border-red-200',
  'Challenge Hook':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Mistake Hook':    'bg-slate-100 text-slate-700 border-slate-200',
};

const PLACEMENT_LABEL: Record<string, string> = {
  'Opening (first 3 sec)':         '🎬 0–3 сек',
  'Pattern interrupt (10-15 sec)':  '⚡ 10–15 сек',
  'Loop hook (last 5 sec)':         '🔄 Финал',
};

interface Reel { shortCode: string; caption: string; views: number; likes: number; thumbnail: string | null; permalink: string; }
interface Analysis { reel: Reel; hookType: string; placement: string; hookScript: string; reason: string; viewsBoost: number; }
interface SavedSession { username: string; results: Analysis[]; savedAt: number; }

const STORAGE_KEY = 'hooked_pro_session';

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(username: string, results: Analysis[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username, results, savedAt: Date.now() }));
  } catch { /* ignore */ }
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-[11px] text-[#888] hover:text-black transition-colors shrink-0">
      {copied ? <><Check size={12} className="text-emerald-600" />Скопировано</> : <><Copy size={12} />Копировать</>}
    </button>
  );
}

function AnalysisCard({ data }: { data: Analysis }) {
  const { reel, hookType, placement, hookScript, reason, viewsBoost } = data;
  const tagClass = HOOK_COLORS[hookType] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden bg-white hover:border-black/20 transition-colors">
      <div className="flex">
        <a href={reel.permalink} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 w-[88px] relative block group">
          {reel.thumbnail
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" style={{ aspectRatio: '9/14' }} />
            : <div className="w-full bg-gradient-to-br from-gray-200 to-gray-400" style={{ aspectRatio: '9/14' }} />
          }
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="bg-black/60 rounded-full p-2"><ExternalLink size={14} className="text-white" /></div>
          </div>
        </a>
        <div className="flex-1 p-4 flex flex-col gap-2.5 min-w-0">
          <div className="flex items-center gap-3 text-[11px] text-[#aaa]">
            <span className="flex items-center gap-1"><Eye size={10} />{fmt(reel.views)}</span>
            <span className="flex items-center gap-1"><Heart size={10} />{fmt(reel.likes)}</span>
          </div>
          <p className="text-[11px] text-[#666] leading-snug line-clamp-2">{reel.caption}</p>
          <div className="bg-[#f9f9f9] rounded-xl p-3 flex flex-col gap-2 border border-black/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tagClass}`}>{hookType}</span>
              <span className="text-[10px] text-[#999]">{PLACEMENT_LABEL[placement] ?? placement}</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600 shrink-0">+{viewsBoost}%</span>
            </div>
            <div className="bg-white border border-black/8 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <Zap size={12} className="text-[#e8002d] mt-0.5 shrink-0" />
                <p className="text-[12px] font-medium leading-snug text-[#0a0a0a] flex-1 min-w-0">&ldquo;{hookScript}&rdquo;</p>
              </div>
              <div className="flex justify-end mt-2"><CopyButton text={hookScript} /></div>
            </div>
            <p className="text-[10px] text-[#999] leading-relaxed">{reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProAnalyzer() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Analysis[] | null>(null);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setResults(session.results);
      setActiveUser(session.username);
      setUsername(session.username);
    }
    setHydrated(true);
  }, []);

  const analyze = async (uname?: string) => {
    const target = (uname ?? username).replace('@', '').trim();
    if (!target) return;
    setLoading(true); setError(''); setResults(null); setActiveUser(null);
    setStep('Загружаем reels...');
    const timer = setTimeout(() => setStep('ИИ анализирует каждое видео...'), 20000);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: target }),
      });
      if (res.status === 401) { window.location.href = `/login?next=${encodeURIComponent('/pro')}`; return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Ошибка'); return; }
      setResults(data.reels);
      setActiveUser(target);
      saveSession(target, data.reels);
    } catch {
      setError('Ошибка сети. Попробуй ещё раз.');
    } finally {
      clearTimeout(timer); setLoading(false); setStep('');
    }
  };

  const reset = () => {
    clearSession();
    setResults(null);
    setActiveUser(null);
    setUsername('');
    setError('');
  };

  if (!hydrated) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Input row — always shown */}
      {!activeUser ? (
        <>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-black/20 rounded-full overflow-hidden focus-within:border-black transition-colors bg-white">
              <span className="pl-5 text-[#aaa] text-sm select-none">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && analyze()}
                placeholder="твой_instagram"
                className="flex-1 px-2 py-3.5 text-sm outline-none bg-transparent"
                autoFocus
              />
            </div>
            <button onClick={() => analyze()} disabled={loading || !username.trim()}
              className="bg-[#e8002d] text-white font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2 whitespace-nowrap">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Анализ...' : 'Анализировать'}
            </button>
          </div>
          <div className="flex items-center gap-2 -mt-2 pl-1">
            <Lock size={10} className="text-[#bbb]" />
            <p className="text-[11px] text-[#bbb]">Только ты видишь свой анализ · Публичный аккаунт · 30–60 сек</p>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between bg-[#f7f7f7] rounded-2xl px-4 py-3 border border-black/8">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-[#e8002d]" />
            <div>
              <p className="text-[11px] text-[#888] uppercase tracking-wider font-bold">Конфиденциальный анализ</p>
              <p className="text-sm font-semibold">@{activeUser}</p>
            </div>
          </div>
          <button onClick={reset} className="flex items-center gap-1 text-[11px] text-[#aaa] hover:text-black transition-colors">
            <RotateCcw size={11} /> Другой аккаунт
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#888]">{step}</p>
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => analyze()} className="text-xs font-bold underline ml-3 shrink-0">Повторить</button>
        </div>
      )}
      {results && !loading && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#888]">{results.length} reels · ИИ рекомендации готовы</p>
          {results.map((r, i) => <AnalysisCard key={i} data={r} />)}
          <div className="border border-dashed border-black/15 rounded-2xl p-6 text-center mt-1">
            <p className="text-sm font-medium">Хочешь больше примеров таких хуков?</p>
            <a href="/" className="inline-block mt-2 text-[#e8002d] text-sm font-bold hover:underline">Смотреть Hook Library →</a>
          </div>
        </div>
      )}
    </div>
  );
}
