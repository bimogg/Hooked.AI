'use client';
import { useRef, useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface Props {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  reelUrl: string;
  hookDuration?: number; // seconds to play before looping, default 4
}

export default function HookPlayer({ videoUrl, thumbnailUrl, reelUrl, hookDuration = 4 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const play = (e: React.MouseEvent) => {
    e.preventDefault();
    const v = videoRef.current;
    if (!v || failed) { window.open(reelUrl, '_blank'); return; }
    v.currentTime = 0;
    v.play().then(() => setPlaying(true)).catch(() => { setFailed(true); window.open(reelUrl, '_blank'); });
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.currentTime >= hookDuration) { v.currentTime = 0; v.play(); }
  };

  const openInstagram = (e: React.MouseEvent) => { e.stopPropagation(); window.open(reelUrl, '_blank'); };

  return (
    <div className="relative w-full h-full bg-black cursor-pointer" onClick={play}>
      {/* Video (hidden until playing) */}
      {videoUrl && !failed && (
        <video
          ref={videoRef}
          src={videoUrl}
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

      {/* Play button overlay */}
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
          ХУК 0–{hookDuration}с
        </div>
      )}

      {/* Instagram link — always accessible */}
      <button
        onClick={openInstagram}
        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black rounded-full flex items-center justify-center transition-colors"
        title="Открыть в Instagram"
      >
        <ExternalLink size={11} className="text-white" />
      </button>
    </div>
  );
}
