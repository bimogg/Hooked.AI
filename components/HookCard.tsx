'use client';
import { useState } from 'react';
import { Hook } from '@/lib/supabase';
import { Eye, Heart, MessageCircle, X, ExternalLink } from 'lucide-react';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const NICHE_BG: Record<string, string> = {
  fitness: 'from-green-400 to-emerald-600',
  business: 'from-blue-400 to-indigo-600',
  food: 'from-orange-400 to-red-500',
  travel: 'from-cyan-400 to-sky-600',
  beauty: 'from-pink-400 to-rose-500',
  general: 'from-gray-400 to-gray-600',
};

const NICHE_TAG: Record<string, string> = {
  fitness: 'bg-green-50 text-green-700',
  business: 'bg-blue-50 text-blue-700',
  food: 'bg-orange-50 text-orange-700',
  travel: 'bg-cyan-50 text-cyan-700',
  beauty: 'bg-pink-50 text-pink-700',
  general: 'bg-gray-100 text-gray-600',
};

export default function HookCard({ hook }: { hook: Hook }) {
  const [open, setOpen] = useState(false);
  const bg = NICHE_BG[hook.niche] ?? NICHE_BG.general;
  const tag = NICHE_TAG[hook.niche] ?? NICHE_TAG.general;
  const igUrl = `https://www.instagram.com/${hook.creator_username}/`;

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
          {/* Overlay stats */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center gap-3 text-white text-[11px]">
            <span className="flex items-center gap-1"><Eye size={11} />{fmt(hook.views)}</span>
            <span className="flex items-center gap-1"><Heart size={11} />{fmt(hook.likes)}</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="p-3 flex items-center justify-between gap-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tag}`}>
            {hook.niche}
          </span>
          <span className="text-[11px] text-[#888]">@{hook.creator_username}</span>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thumbnail */}
            <div className="relative aspect-[9/12] w-full">
              {hook.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hook.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${bg}`} />
              )}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
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
