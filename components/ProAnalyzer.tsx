'use client';
import { useState, useEffect } from 'react';
import { Eye, Heart, Zap, Copy, Check, Loader2, LogOut, ExternalLink } from 'lucide-react';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const HOOK_COLORS: Record<string, string> = {
  'Hook Tutorial': 'bg-violet-50 text-violet-700 border-violet-200',
  'Visual Hook': 'bg-pink-50 text-pink-700 border-pink-200',
  'Question Hook': 'bg-sky-50 text-sky-700 border-sky-200',
  'Tutorial Hook': 'bg-teal-50 text-teal-700 border-teal-200',
  'Engagement Hook': 'bg-orange-50 text-orange-700 border-orange-200',
  'Curiosity Hook': 'bg-amber-50 text-amber-700 border-amber-200',
  'Warning Hook': 'bg-red-50 text-red-700 border-red-200',
  'Challenge Hook': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Mistake Hook': 'bg-slate-100 text-slate-700 border-slate-200',
};

const PLACEMENT_LABEL: Record<string, string> = {
  'Opening (first 3 sec)': '🎬 0–3 сек — Вступление',
  'Pattern interrupt (10-15 sec)': '⚡ 10–15 сек — Удержание',
  'Loop hook (last 5 sec)': '🔄 последние 5 сек — Петля',
};

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

interface Analysis {
  reel: Reel;
  hookType: string;
  placement: string;
  hookScript: string;
  reason: string;
  viewsBoost: number;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-[11px] text-[#888] hover:text-black transition-colors shrink-0">
      {copied ? <><Check size={12} className="text-emerald-600" />Скопировано</> : <><Copy size={12} />Копировать</>}
    </button>
  );
}

function AnalysisCard({ data }: { data: Analysis }) {
  const { reel, hookType, placement, hookScript, reason, viewsBoost } = data;
  const tagClass = HOOK_COLORS[hookType] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const placementLabel = PLACEMENT_LABEL[placement] ?? placement;

  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden bg-white hover:border-black/20 transition-colors">
      <div className="flex gap-0">
        {/* Thumbnail */}
        <a href={reel.permalink} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 w-[88px] relative block group">
          {reel.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" style={{ aspectRatio: '9/14' }} />
          ) : (
            <div className="w-full bg-gradient-to-br from-gray-200 to-gray-400" style={{ aspectRatio: '9/14' }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 rounded-full p-2">
              <ExternalLink size={14} className="text-white" />
            </div>
          </div>
        </a>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-2.5 min-w-0">
          {/* Stats */}
          <div className="flex items-center gap-3 text-[11px] text-[#aaa]">
            <span className="flex items-center gap-1"><Eye size={10} />{fmt(reel.views)}</span>
            <span className="flex items-center gap-1"><Heart size={10} />{fmt(reel.likes)}</span>
          </div>

          {/* Caption */}
          <p className="text-[11px] text-[#666] leading-snug line-clamp-2">{reel.caption}</p>

          {/* AI Recommendation */}
          <div className="bg-[#f9f9f9] rounded-xl p-3 flex flex-col gap-2 border border-black/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tagClass}`}>
                {hookType}
              </span>
              <span className="text-[10px] text-[#999]">{placementLabel}</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600 shrink-0">+{viewsBoost}%</span>
            </div>

            {/* Script */}
            <div className="bg-white border border-black/8 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <Zap size={12} className="text-[#e8002d] mt-0.5 shrink-0" />
                <p className="text-[12px] font-medium leading-snug text-[#0a0a0a] flex-1 min-w-0">
                  &ldquo;{hookScript}&rdquo;
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <CopyButton text={hookScript} />
              </div>
            </div>

            <p className="text-[10px] text-[#999] leading-relaxed">{reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProAnalyzer({ username }: { username?: string }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Analysis[] | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  const analyze = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    setStep('Загружаем твои Reels из Instagram...');

    const timer = setTimeout(() => setStep('ИИ анализирует каждое видео...'), 15000);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Ошибка'); return; }
      setResults(data.reels);
    } catch {
      setError('Ошибка сети. Попробуй ещё раз.');
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setStep('');
    }
  };

  // Auto-analyze on mount
  useEffect(() => { analyze(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = () => {
    document.cookie = 'ig_token=; Max-Age=0; path=/';
    document.cookie = 'ig_user_id=; Max-Age=0; path=/';
    document.cookie = 'ig_username=; Max-Age=0; path=/';
    window.location.href = '/pro';
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Account header */}
      <div className="flex items-center justify-between bg-[#f5f5f5] rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8002d] to-[#ff6b35] flex items-center justify-center text-white text-xs font-bold">
            {username?.[0]?.toUpperCase() ?? 'IG'}
          </div>
          <div>
            <p className="text-sm font-medium">@{username ?? 'instagram'}</p>
            <p className="text-[10px] text-[#888]">Подключён · Business/Creator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={analyze}
            disabled={loading}
            className="text-[11px] text-[#888] hover:text-black transition-colors disabled:opacity-40"
          >
            Обновить
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] text-[#888] hover:text-red-600 transition-colors"
          >
            <LogOut size={12} />
            Выйти
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#888]">{step}</p>
          <p className="text-[11px] text-[#bbb]">Занимает 30–60 секунд</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={analyze} className="text-xs font-bold underline">Повторить</button>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#888]">
            {results.length} Reels проанализировано · ИИ рекомендации готовы
          </p>
          {results.map((r, i) => <AnalysisCard key={i} data={r} />)}

          <div className="border border-dashed border-black/15 rounded-2xl p-6 text-center mt-1">
            <p className="text-sm font-medium">Хочешь больше примеров таких хуков?</p>
            <a href="/" className="inline-block mt-2 text-[#e8002d] text-sm font-bold hover:underline">
              Смотреть Hook Library →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
