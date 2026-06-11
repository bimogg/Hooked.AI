'use client';
import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface Props {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  reelUrl: string;
  hookDuration?: number;
}

function getEmbedUrl(reelUrl: string): string | null {
  const m = reelUrl.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/reel/${m[1]}/embed/?autoplay=1&cr=1` : null;
}

export default function HookPlayer({ thumbnailUrl, reelUrl }: Props) {
  const [active, setActive] = useState(false);
  const embedUrl = getEmbedUrl(reelUrl);

  const openReel = (e: React.MouseEvent) => { e.stopPropagation(); window.open(reelUrl, '_blank'); };

  return (
    <div className="relative w-full h-full bg-black">

      {/* Embed plays inline in the card */}
      {active && embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          style={{ border: 'none', display: 'block' }}
          allowFullScreen
          scrolling="no"
        />
      ) : (
        <div className="relative w-full h-full cursor-pointer" onClick={() => setActive(true)}>
          {/* Thumbnail */}
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
        </div>
      )}

      {/* External link — always on top */}
      <button
        onClick={openReel}
        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black rounded-full flex items-center justify-center transition-colors z-10"
        title="Открыть в Instagram"
      >
        <ExternalLink size={11} className="text-white" />
      </button>
    </div>
  );
}
