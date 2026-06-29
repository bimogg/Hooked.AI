'use client';
import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';
import type { Technique, Loc } from '@/lib/techniques';

export default function TechniqueCard({ t }: { t: Technique }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const L = (o: Loc) => (lang === 'ru' ? o.ru : o.en);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
        </div>
        <div className="p-3">
          <p className="text-[12px] font-semibold leading-tight line-clamp-2">{L(t.title)}</p>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[360px] overflow-hidden shadow-2xl my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full bg-black" style={{ aspectRatio: '9/14' }}>
              <video
                src={t.videoUrl}
                poster={t.thumbUrl}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white z-10"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5">
              <h3 className="font-display font-extrabold text-lg leading-tight mb-1">{L(t.title)}</h3>
              <p className="text-[11px] text-[#888] mb-4">{tr('library', 'techApp', lang)}: {L(t.app)}</p>
              <ol className="flex flex-col gap-3">
                {t.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#e8002d] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm leading-relaxed text-[#222] pt-0.5">{L(s)}</span>
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
