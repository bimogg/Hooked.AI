'use client';
import { useState } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface Props {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  reelUrl: string;
  hookDuration?: number;
}

function getEmbedUrl(reelUrl: string): string | null {
  const m = reelUrl.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/reel/${m[1]}/embed/` : null;
}

export default function HookPlayer({ videoUrl, thumbnailUrl, reelUrl }: Props) {
  const [modal, setModal] = useState(false);
  const embedUrl = getEmbedUrl(reelUrl);

  const open = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setModal(true); };
  const openReel = (e: React.MouseEvent) => { e.stopPropagation(); window.open(reelUrl, '_blank'); };

  return (
    <>
      {/* Embed modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setModal(false)}
        >
          <div className="relative w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-white/60 text-xs">Нажми за пределами чтобы закрыть</span>
              <button onClick={() => setModal(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full rounded-xl bg-black"
                style={{ height: 580, border: 'none' }}
                allowFullScreen
                scrolling="no"
              />
            ) : (
              <div className="bg-[#111] rounded-xl p-10 text-center">
                <p className="text-white/50 text-sm mb-4">Встроенный плеер недоступен</p>
                <button onClick={openReel} className="text-[#e8002d] font-bold text-sm">
                  Открыть в Instagram →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card thumbnail */}
      <div className="relative w-full h-full bg-black cursor-pointer" onClick={open}>
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-black/60 hover:bg-[#e8002d] rounded-full flex items-center justify-center transition-colors">
            <Play size={18} className="text-white ml-1" fill="white" />
          </div>
        </div>

        {/* External link */}
        <button
          onClick={openReel}
          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black rounded-full flex items-center justify-center transition-colors"
          title="Открыть в Instagram"
        >
          <ExternalLink size={11} className="text-white" />
        </button>
      </div>
    </>
  );
}
