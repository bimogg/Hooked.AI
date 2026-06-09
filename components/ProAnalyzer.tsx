'use client';
import { useState, useEffect, useCallback } from 'react';
import { Eye, Heart, Zap, Copy, Check, Loader2, ArrowRight, ExternalLink, Sparkles, Lock, TrendingUp } from 'lucide-react';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const HOOK_COLORS: Record<string, string> = {
  'Hook Tutorial':  'bg-violet-50 text-violet-700 border-violet-200',
  'Visual Hook':    'bg-pink-50 text-pink-700 border-pink-200',
  'Question Hook':  'bg-sky-50 text-sky-700 border-sky-200',
  'Tutorial Hook':  'bg-teal-50 text-teal-700 border-teal-200',
  'Engagement Hook':'bg-orange-50 text-orange-700 border-orange-200',
  'Curiosity Hook': 'bg-amber-50 text-amber-700 border-amber-200',
  'Warning Hook':   'bg-red-50 text-red-700 border-red-200',
  'Challenge Hook': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Mistake Hook':   'bg-slate-100 text-slate-700 border-slate-200',
};

const PLACEMENT_LABEL: Record<string, string> = {
  'Opening (first 3 sec)':        '🎬 0–3 сек — Вступление',
  'Pattern interrupt (10-15 sec)': '⚡ 10–15 сек — Удержание',
  'Loop hook (last 5 sec)':        '🔄 Последние 5 сек — Петля',
};

interface Reel { shortCode: string; caption: string; views: number; likes: number; thumbnail: string | null; permalink: string; }
interface Analysis { reel: Reel; hookType: string; placement: string; hookScript: string; reason: string; viewsBoost: number; }

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
        <a href={reel.permalink} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-[88px] relative block group">
          {reel.thumbnail
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" style={{ aspectRatio: '9/14' }} />
            : <div className="w-full bg-gradient-to-br from-gray-200 to-gray-400" style={{ aspectRatio: '9/14' }} />}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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

function ConnectButton({ onConnected }: { onConnected: (username: string) => void }) {
  const [connecting, setConnecting] = useState(false);

  const openPopup = useCallback(() => {
    setConnecting(true);
    const w = 480, h = 650;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open('/api/auth/instagram', 'ig_auth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`);

    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'ig_auth') return;
      window.removeEventListener('message', handler);
      if (e.data.success) {
        onConnected(e.data.username ?? '');
      } else {
        setConnecting(false);
      }
      popup?.close();
    };
    window.addEventListener('message', handler);

    // Fallback if popup closed manually
    const check = setInterval(() => {
      if (popup?.closed) { clearInterval(check); setConnecting(false); window.removeEventListener('message', handler); }
    }, 500);
  }, [onConnected]);

  return (
    <div className="border border-black/10 rounded-2xl p-8 bg-[#fafafa]">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8002d] to-[#ff6b35] flex items-center justify-center">
          <Sparkles size={28} className="text-white" />
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl uppercase">Подключи Instagram</h2>
          <p className="text-[#888] text-sm mt-2">Нужен Business или Creator аккаунт. Откроется окно авторизации — прямо здесь.</p>
        </div>
        <div className="w-full flex flex-col gap-2">
          {[
            { icon: TrendingUp, text: 'Анализ твоих последних Reels' },
            { icon: Zap,        text: 'ИИ пишет готовый скрипт хука для каждого видео' },
            { icon: Lock,       text: 'Read-only — мы ничего не публикуем' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white border border-black/8 rounded-xl px-4 py-3 text-left">
              <Icon size={15} className="text-[#e8002d] shrink-0" />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={openPopup}
          disabled={connecting}
          className="w-full bg-[#e8002d] text-white font-bold text-sm py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {connecting ? <><Loader2 size={16} className="animate-spin" />Открываем окно...</> : 'Войти через Instagram →'}
        </button>
        <p className="text-[10px] text-[#bbb]">Откроется popup — не уйдёшь со страницы</p>
      </div>
    </div>
  );
}

export default function ProAnalyzer({ isConnected, username: initialUsername }: { isConnected: boolean; username?: string }) {
  const [connected, setConnected] = useState(isConnected);
  const [username, setUsername] = useState(initialUsername ?? '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Analysis[] | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  const analyze = useCallback(async (user?: string) => {
    const name = user ?? username;
    if (!name) return;
    setLoading(true); setError(''); setResults(null);
    setStep('Загружаем reels из Instagram...');
    const timer = setTimeout(() => setStep('ИИ анализирует каждое видео...'), 20000);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Ошибка'); return; }
      setResults(data.reels);
    } catch { setError('Ошибка сети. Попробуй ещё раз.'); }
    finally { clearTimeout(timer); setLoading(false); setStep(''); }
  }, [username]);

  const handleConnected = useCallback((user: string) => {
    setConnected(true);
    setUsername(user);
    analyze(user);
  }, [analyze]);

  // Auto-analyze if already connected
  useEffect(() => {
    if (isConnected && initialUsername) analyze(initialUsername);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!connected) {
    return <ConnectButton onConnected={handleConnected} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Account bar */}
      <div className="flex items-center justify-between bg-[#f5f5f5] rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8002d] to-[#ff6b35] flex items-center justify-center text-white text-xs font-bold">
            {username?.[0]?.toUpperCase() ?? 'IG'}
          </div>
          <div>
            <p className="text-sm font-medium">@{username}</p>
            <p className="text-[10px] text-[#888]">Подключён · Instagram</p>
          </div>
        </div>
        <button onClick={() => analyze()} disabled={loading}
          className="text-[11px] text-[#888] hover:text-black transition-colors disabled:opacity-40 flex items-center gap-1">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
          Обновить
        </button>
      </div>

      {loading && (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#888]">{step}</p>
          <p className="text-[11px] text-[#bbb]">Обычно 30–60 секунд</p>
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
          <p className="text-xs text-[#888]">{results.length} reels проанализировано</p>
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
