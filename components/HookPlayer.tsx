'use client';
import { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';

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

export default function HookPlayer({ thumbnailUrl, reelUrl }: Props) {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const embedUrl = getEmbedUrl(reelUrl);

  // When user clicks the invisible iframe on top, window loses focus — detect that
  useEffect(() => {
    const onBlur = () => { if (hovered) setActive(true); };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [hovered]);

  const openReel = (e: React.MouseEvent) => { e.stopPropagation(); window.open(reelUrl, '_blank'); };

  return (
    <div
      className="relative w-full h-full bg-black"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* iframe always on top — invisible until clicked, but receives the click */}
      {embedUrl && (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none', opacity: active ? 1 : 0, zIndex: 2 }}
          allow="autoplay; fullscreen"
          allowFullScreen
          scrolling="no"
        />
      )}

      {/* Thumbnail + play button below iframe (visual only) */}
      {!active && (
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
              <Play size={18} className="text-white ml-1" fill="white" />
            </div>
          </div>
        </div>
      )}

      {/* External link always accessible */}
      <button
        onClick={openReel}
        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black rounded-full flex items-center justify-center transition-colors"
        style={{ zIndex: 3 }}
        title="Открыть в Instagram"
      >
        <ExternalLink size={11} className="text-white" />
      </button>
    </div>
  );
}
