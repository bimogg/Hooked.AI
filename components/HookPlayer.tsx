'use client';
import { useRef, useState } from 'react';
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

function proxied(url: string | null) {
  if (!url) return null;
  return `/api/proxy-video?url=${encodeURIComponent(url)}`;
}

export default function HookPlayer({ videoUrl, thumbnailUrl, reelUrl, hookDuration = 4 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [modal, setModal] = useState(false);

  const embedUrl = getEmbedUrl(reelUrl);
  const src = proxied(videoUrl);

  const play = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const v = videoRef.current;
    if (src && v && !failed) {
      v.currentTime = 0;
      v.play().then(() => setPlaying(true)).catch(() => { setFailed(true); setModal(true); });
    } else {
      setModal(true);
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.currentTime >= hookDuration) { v.currentTime = 0; v.play(); }
  };

  const openReel = (e: React.MouseEvent) => { e.stopPropagation(); window.open(reelUrl, '_blank'); };

  return (
    <>
      {/* Modal overlay with embed */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setModal(false)}
        >
          <div className="relative w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setModal(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1 text-sm"
            >
              <X size={16} /> закрыть
            </button>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full rounded-xl"
                style={{ height: 600, border: 'none' }}
                allowFullScreen
                allow="autoplay"
                scrolling="no"
              />
            ) : (
              <div className="bg-black rounded-xl p-8 text-center">
                <p className="text-white/60 text-sm mb-4">Нет встроенного плеера</p>
                <button onClick={openReel} className="text-[#e8002d] text-sm underline">
                  Открыть в Instagram
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card */}
      <div className="relative w-full h-full bg-black cursor-pointer" onClick={play}>
        {/* Inline video (when proxy works) */}
        {src && !failed && (
          <video
            ref={videoRef}
            src={src}
            className={`w-full h-full object-cover transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`}
            muted playsInline preload="none"
            onTimeUpdate={onTimeUpdate}
            onError={() => setFailed(true)}
            onEnded={() => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } }}
          />
        )}

        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className={`absolute inset-0 transition-opacity duration-300 ${playing ? 'opacity-0' : 'opacity-100'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {!thumbnailUrl && !playing && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}

        {/* Play button */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/60 hover:bg-[#e8002d] rounded-full flex items-center justify-center transition-colors">
              <Play size={18} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* HOOK badge */}
        {playing && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#e8002d] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            HOOK 0–{hookDuration}s
          </div>
        )}

        {/* Reel link button */}
        <button
          onClick={openReel}
          className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black rounded-full flex items-center justify-center transition-colors"
          title="Открыть рил в Instagram"
        >
          <ExternalLink size={11} className="text-white" />
        </button>
      </div>
    </>
  );
}
