'use client';
import { useState } from 'react';
import { Hook } from '@/lib/supabase';
import { Eye, Heart, MessageCircle, X, ExternalLink, Play } from 'lucide-react';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function hookScore(views: number): number {
  if (views >= 5_000_000) return 97;
  if (views >= 1_000_000) return 93;
  if (views >= 500_000) return 87;
  if (views >= 100_000) return 78;
  if (views >= 50_000) return 70;
  return 64;
}

function hookDesc(niche: string, caption: string): string {
  const c = caption?.toLowerCase() ?? '';
  if (niche === 'Visual Hook') return 'Визуальный хук — захватывает без слов';
  if (niche === 'Question Hook') return 'Вопрос-хук — заставляет досмотреть до ответа';
  if (niche === 'Warning Hook') return 'Хук-предупреждение — создаёт срочность';
  if (niche === 'Curiosity Hook') return 'Хук любопытства — нельзя не узнать';
  if (niche === 'Challenge Hook') return 'Хук-челлендж — вовлекает через эмоцию';
  if (niche === 'Mistake Hook') return 'Хук-ошибка — триггер на узнавание';
  if (niche === 'Tutorial Hook') return 'Хук-обучение — даёт конкретную ценность';
  if (niche === 'Hook Tutorial') return 'Разбор хуков — показывает как делать';
  return 'Engagement хук — удерживает внимание';
}

const NICHE_BG: Record<string, string> = {
  'Hook Tutorial': 'from-violet-500 to-purple-700',
  'Visual Hook': 'from-pink-400 to-rose-600',
  'Question Hook': 'from-sky-400 to-blue-600',
  'Tutorial Hook': 'from-teal-400 to-emerald-600',
  'Engagement Hook': 'from-orange-400 to-red-600',
  'Curiosity Hook': 'from-amber-400 to-orange-600',
  'Warning Hook': 'from-red-500 to-red-700',
  'Challenge Hook': 'from-indigo-400 to-violet-600',
  'Mistake Hook': 'from-slate-500 to-gray-700',
  general: 'from-gray-400 to-gray-600',
};

const NICHE_TAG: Record<string, string> = {
  'Hook Tutorial': 'bg-violet-50 text-violet-700',
  'Visual Hook': 'bg-pink-50 text-pink-700',
  'Question Hook': 'bg-sky-50 text-sky-700',
  'Tutorial Hook': 'bg-teal-50 text-teal-700',
  'Engagement Hook': 'bg-orange-50 text-orange-700',
  'Curiosity Hook': 'bg-amber-50 text-amber-700',
  'Warning Hook': 'bg-red-50 text-red-700',
  'Challenge Hook': 'bg-indigo-50 text-indigo-700',
  'Mistake Hook': 'bg-slate-100 text-slate-700',
  general: 'bg-gray-100 text-gray-600',
};

export default function HookCard({ hook }: { hook: Hook }) {
  const [open, setOpen] = useState(false);
  const bg = NICHE_BG[hook.niche] ?? NICHE_BG.general;
  const tag = NICHE_TAG[hook.niche] ?? NICHE_TAG.general;
  const igUrl = hook.instagram_id
    ? `https://www.instagram.com/reel/${hook.instagram_id}/`
    : `https://www.instagram.com/${hook.creator_username}/`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#f5f5f5] rounded-xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform cursor-pointer text-left w-full"
      >
        {/* Thumbnail */}
        <div className="relative aspect-[9/12] w-full overflow-hidden">
          {hook.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hook.thumbnail_url}
              alt={hook.creator_username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${bg} flex items-end p-4`}>
              <p className="text-white text-sm font-bold leading-snug line-clamp-4 drop-shadow">
                {hook.caption ?? ''}
              </p>
            </div>
          )}
          {hook.video_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                <Play size={16} className="text-white ml-0.5" />
              </div>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center gap-3 text-white text-[11px]">
            <span className="flex items-center gap-1"><Eye size={11} />{fmt(hook.views)}</span>
            <span className="flex items-center gap-1"><Heart size={11} />{fmt(hook.likes)}</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tag}`}>
              {hook.niche}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">+{hookScore(hook.views)}% внимания</span>
          </div>
          <p className="text-[10px] text-[#666] leading-tight line-clamp-2">{hookDesc(hook.niche, hook.caption ?? '')}</p>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[300px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full bg-black" style={{ aspectRatio: '9/14' }}>
              {hook.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hook.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${bg}`} />
              )}
              {(hook.video_url || hook.instagram_id) && (
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-[#e8002d]/80 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </a>
              )}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white z-10"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tag}`}>
                  {hook.niche}
                </span>
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#888] flex items-center gap-1 hover:text-[#e8002d]"
                >
                  @{hook.creator_username} <ExternalLink size={10} />
                </a>
              </div>
              <p className="text-sm font-medium leading-relaxed text-[#0a0a0a] mb-4">
                {hook.caption ?? '—'}
              </p>
              <div className="flex items-center gap-4 text-[#888] text-xs pt-3 border-t border-black/10">
                <span className="flex items-center gap-1.5"><Eye size={12} />{fmt(hook.views)}</span>
                <span className="flex items-center gap-1.5"><Heart size={12} />{fmt(hook.likes)}</span>
                <span className="flex items-center gap-1.5"><MessageCircle size={12} />{fmt(hook.comments)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
