'use client';
import { useState } from 'react';
import { Eye, Heart, Zap, ArrowRight, Copy, Check, Loader2 } from 'lucide-react';

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
  'Opening (first 3 sec)': '0–3 сек',
  'Pattern interrupt (10-15 sec)': '10–15 сек',
  'Loop hook (last 5 sec)': 'последние 5 сек',
};

interface Reel {
  id: string;
  shortCode: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail: string | null;
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
    <button onClick={copy} className="ml-auto flex items-center gap-1 text-[11px] text-[#888] hover:text-black transition-colors">
      {copied ? <><Check size={12} className="text-emerald-600" /> Скопировано</> : <><Copy size={12} /> Копировать</>}
    </button>
  );
}

function AnalysisCard({ data }: { data: Analysis }) {
  const { reel, hookType, placement, hookScript, reason, viewsBoost } = data;
  const tagClass = HOOK_COLORS[hookType] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const igUrl = reel.shortCode
    ? `https://www.instagram.com/reel/${reel.shortCode}/`
    : `https://www.instagram.com/`;

  return (
    <div className="border border-black/10 rounded-2xl overflow-hidden bg-white">
      <div className="flex gap-0">
        {/* Thumbnail */}
        <a href={igUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-[90px] relative block">
          {reel.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" style={{ aspectRatio: '9/14' }} />
          ) : (
            <div className="w-full bg-gradient-to-br from-gray-200 to-gray-400" style={{ aspectRatio: '9/14' }} />
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
        </a>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          {/* Stats */}
          <div className="flex items-center gap-3 text-[11px] text-[#888]">
            <span className="flex items-center gap-1"><Eye size={11} />{fmt(reel.views)}</span>
            <span className="flex items-center gap-1"><Heart size={11} />{fmt(reel.likes)}</span>
          </div>

          {/* Caption */}
          <p className="text-[11px] text-[#555] leading-relaxed line-clamp-2">{reel.caption}</p>

          {/* Hook recommendation */}
          <div className="bg-[#f9f9f9] rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tagClass}`}>
                {hookType}
              </span>
              <span className="text-[10px] text-[#888]">→</span>
              <span className="text-[10px] font-medium text-[#555]">
                {PLACEMENT_LABEL[placement] ?? placement}
              </span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600">+{viewsBoost}% просмотров</span>
            </div>

            {/* Hook script */}
            <div className="bg-white border border-black/8 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <Zap size={12} className="text-[#e8002d] mt-0.5 flex-shrink-0" />
                <p className="text-[12px] font-medium leading-snug text-[#0a0a0a] flex-1">"{hookScript}"</p>
                <CopyButton text={hookScript} />
              </div>
            </div>

            <p className="text-[10px] text-[#888] leading-relaxed">{reason}</p>
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
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  const analyze = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    setStep('Загружаем reels...');

    const timer = setTimeout(() => setStep('ИИ анализирует каждое видео...'), 20000);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Ошибка'); return; }
      setResults(data.reels);
    } catch {
      setError('Сеть недоступна. Попробуй ещё раз.');
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center border border-black/20 rounded-full overflow-hidden focus-within:border-black transition-colors bg-white">
          <span className="pl-4 text-[#888] text-sm">@</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="instagram_username"
            className="flex-1 px-2 py-3 text-sm outline-none bg-transparent"
          />
        </div>
        <button
          onClick={analyze}
          disabled={loading || !username.trim()}
          className="bg-[#e8002d] text-white font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          {loading ? 'Анализ...' : 'Анализировать'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#888]">{step}</p>
          <p className="text-[11px] text-[#bbb]">Обычно занимает 30–60 секунд</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#888]">
            {results.length} reels проанализировано · AI рекомендации готовы
          </p>
          {results.map((r, i) => <AnalysisCard key={i} data={r} />)}

          <div className="border border-dashed border-black/20 rounded-2xl p-6 text-center mt-2">
            <p className="text-sm font-medium">Хочешь больше примеров таких хуков?</p>
            <a href="/" className="inline-block mt-3 text-[#e8002d] text-sm font-bold hover:underline">
              Смотреть Hook Library →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
