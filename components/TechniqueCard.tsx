'use client';
import { useRef, useState } from 'react';
import { X, Play, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';
import type { Technique, Loc } from '@/lib/techniques';

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

export default function TechniqueCard({ t }: { t: Technique }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const L = (o: Loc) => (lang === 'ru' ? o.ru : o.en);
  const many = t.clips.length > 1;

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  const go = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: (idx + dir) * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setIdx(0); }}
        className="bg-[#f5f5f5] rounded-xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform cursor-pointer text-left w-full"
      >
        <div className="relative aspect-[9/12] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.thumbUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
              <Play size={16} className="text-white ml-0.5" />
            </div>
          </div>
          <span className="absolute top-2 left-2 bg-[#e8002d] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            {tr('library', 'fTechniques', lang)}
          </span>
          {many && (
            <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/55 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
              <Layers size={11} /> {t.clips.length}
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-[12px] font-semibold leading-tight line-clamp-2">{L(t.title)}</p>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-[380px] sm:max-w-[840px] h-[90vh] sm:h-[80vh] flex flex-col sm:flex-row"
            style={{ fontFamily: APPLE_FONT }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* VIDEO carousel — top on mobile, left on desktop (fixed) */}
            <div className="relative bg-black shrink-0 h-[42vh] sm:h-full sm:w-[42%]">
              <div
                ref={trackRef}
                onScroll={onScroll}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none' }}
              >
                {t.clips.map((c, i) => (
                  <div key={i} className="snap-center shrink-0 w-full h-full">
                    <video
                      src={c.videoUrl}
                      poster={c.thumbUrl}
                      controls
                      autoPlay={i === 0}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {many && (
                <>
                  {idx > 0 && (
                    <button onClick={() => go(-1)}
                      className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/45 hover:bg-black/70 rounded-full items-center justify-center text-white z-10">
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {idx < t.clips.length - 1 && (
                    <button onClick={() => go(1)}
                      className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/45 hover:bg-black/70 rounded-full items-center justify-center text-white z-10">
                      <ChevronRight size={18} />
                    </button>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {t.clips.map((_, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white z-10"
              >
                <X size={14} />
              </button>
            </div>

            {/* STEPS — scrolls independently */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7">
              <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#0a0a0a] leading-tight">{L(t.title)}</h3>
              <span className="inline-flex items-center gap-1.5 mt-2.5 mb-6 bg-[#f1f1f3] text-[#444] text-[12px] font-semibold px-3 py-1.5 rounded-full">
                <Play size={11} className="fill-current" /> {L(t.app)}
              </span>

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#999] mb-4">{tr('library', 'howTo', lang)}</p>

              <ol className="flex flex-col gap-5">
                {t.steps.map((s, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#e8002d] text-white text-[13px] font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] leading-[1.5] text-[#1a1a1a] pt-0.5">{L(s.text)}</p>
                      {s.img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.img} alt="" loading="lazy" className="mt-3 w-full max-w-[200px] max-h-[300px] object-contain rounded-2xl border border-black/[0.08] shadow-sm" />
                      )}
                      {s.video && (
                        <video src={s.video} controls muted loop playsInline preload="metadata"
                          className="mt-3 w-full max-w-[200px] max-h-[300px] rounded-2xl border border-black/[0.08] shadow-sm bg-black" />
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
