'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';

type Slide = { type: 'image' | 'video'; url: string; poster?: string };

export interface Post {
  id: string;
  instagram_id: string;
  creator_username: string;
  caption: string | null;
  images: (string | Slide)[];
  cover_url: string | null;
  niche: string;
  views: number;
  likes: number;
}

function normalize(images: (string | Slide)[]): Slide[] {
  return (images || []).map((s) => (typeof s === 'string' ? { type: 'image', url: s } : s));
}

function Carousel({ slides, i, contain }: { slides: Slide[]; i: number; contain?: boolean }) {
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    vids.current.forEach((v, k) => {
      if (!v) return;
      if (k === i) { v.currentTime = 0; v.play().catch(() => {}); } else { v.pause(); }
    });
  }, [i]);
  const fit = contain ? 'object-contain' : 'object-cover';
  return (
    <div className="flex h-full transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translateX(-${i * 100}%)` }}>
      {slides.map((s, k) => (
        <div key={k} className="w-full h-full shrink-0" style={{ flex: '0 0 100%' }}>
          {s.type === 'video' ? (
            <video
              ref={(el) => { vids.current[k] = el; }}
              src={s.url}
              poster={s.poster}
              className={`w-full h-full ${fit}`}
              muted loop playsInline preload="metadata" controls={contain}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.url} alt="" className={`w-full h-full ${fit}`} loading={k === 0 ? 'eager' : 'lazy'} draggable={false} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CarouselCard({ post }: { post: Post }) {
  const slides = normalize(post.images?.length ? post.images : (post.cover_url ? [post.cover_url] : []));
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  if (!slides.length) return null;
  const reelUrl = `https://www.instagram.com/p/${post.instagram_id}/`;
  const clamp = (n: number) => (n + slides.length) % slides.length;
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setI(clamp(i - 1)); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setI(clamp(i + 1)); };

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-black/10 bg-white">
        <div className="relative aspect-[4/5] bg-black group cursor-pointer overflow-hidden" onClick={() => setOpen(true)}>
          <Carousel slides={slides} i={i} />
          {slides.length > 1 && (
            <>
              <button onClick={prev} aria-label="prev" className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronLeft size={16} /></button>
              <button onClick={next} aria-label="next" className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronRight size={16} /></button>
              <div className="absolute top-2 right-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-full z-10">{i + 1}/{slides.length}</div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                {slides.map((_, k) => <span key={k} className={`w-1.5 h-1.5 rounded-full transition-colors ${k === i ? 'bg-white' : 'bg-white/40'}`} />)}
              </div>
            </>
          )}
        </div>
        <div className="p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f0f0f0] text-[#555]">Carousel · {slides.length}</span>
            <span className="text-[10px] text-[#888] truncate max-w-[60%]">@{post.creator_username}</span>
          </div>
          {post.caption && <p className="text-[10px] text-[#666] leading-tight line-clamp-2">{post.caption}</p>}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} aria-label="close" className="absolute -top-9 right-0 text-white/70 hover:text-white"><X size={22} /></button>
            <div className="relative aspect-[4/5] bg-black rounded-xl overflow-hidden">
              <Carousel slides={slides} i={i} contain />
              {slides.length > 1 && (
                <>
                  <button onClick={prev} aria-label="prev" className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center z-10"><ChevronLeft size={20} /></button>
                  <button onClick={next} aria-label="next" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center z-10"><ChevronRight size={20} /></button>
                  <div className="absolute top-3 right-3 text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-full z-10">{i + 1}/{slides.length}</div>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {slides.map((_, k) => <button key={k} aria-label={`slide ${k + 1}`} onClick={(e) => { e.stopPropagation(); setI(k); }} className={`w-2 h-2 rounded-full ${k === i ? 'bg-white' : 'bg-white/40'}`} />)}
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-white/80 text-xs line-clamp-2 flex-1">{post.caption}</p>
              <a href={reelUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1 text-white text-xs bg-white/15 px-3 py-1.5 rounded-full hover:bg-white/25"><ExternalLink size={12} />Instagram</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
