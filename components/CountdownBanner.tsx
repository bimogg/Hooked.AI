'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hooked_countdown_end';
const DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function getEnd(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return Number(stored);
    const end = Date.now() + DURATION_MS;
    localStorage.setItem(STORAGE_KEY, String(end));
    return end;
  } catch {
    return Date.now() + DURATION_MS;
  }
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function CountdownBanner() {
  const [time, setTime] = useState<{ h: string; m: string; s: string } | null>(null);

  useEffect(() => {
    const end = getEnd();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setTime({ h: '00', m: '00', s: '00' }); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTime({ h: pad(h), m: pad(m), s: pad(s) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="bg-[#0a0a0a] text-white text-center py-2.5 px-4 text-xs flex items-center justify-center gap-3 flex-wrap">
      <span className="text-[#888] uppercase tracking-widest text-[9px] font-bold">Early Access</span>
      <span className="text-white/90">Free Pro access ends in</span>
      <span className="font-mono font-bold text-[#e8002d] tabular-nums">
        {time.h}:{time.m}:{time.s}
      </span>
      <a href="/pro" className="bg-[#e8002d] text-white text-[10px] font-bold px-3 py-1 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
        Try Pro Free →
      </a>
    </div>
  );
}
