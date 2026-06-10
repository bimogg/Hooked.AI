'use client';
import Link from 'next/link';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { lang } = useLang();
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/10 h-14 flex items-center px-6 justify-between">
      <Link href="/" className="font-display font-bold text-sm tracking-tight flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="HookedAI" className="w-7 h-7 rounded-md object-cover" />
        HookedAI
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-[#888]">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <Link href="/library" className="hover:text-black transition-colors">Library</Link>
        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
        <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
      </nav>
      <div className="hidden md:flex items-center gap-3">
        <LanguageSwitcher />
        <Link href="/pro"
          className="bg-[#e8002d] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
          {tr('nav', 'cta', lang)}
        </Link>
      </div>
      <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
        <span className="block w-5 h-px bg-black mb-1" />
        <span className="block w-5 h-px bg-black mb-1" />
        <span className="block w-5 h-px bg-black" />
      </button>
      {open && (
        <div className="absolute top-14 inset-x-0 bg-white border-b border-black/10 flex flex-col gap-4 px-6 py-6 md:hidden">
          <Link href="/" onClick={() => setOpen(false)} className="text-sm text-[#888]">Home</Link>
          <Link href="/library" onClick={() => setOpen(false)} className="text-sm text-[#888]">Library</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="text-sm text-[#888]">Pricing</Link>
          <Link href="/privacy" onClick={() => setOpen(false)} className="text-sm text-[#888]">Privacy</Link>
          <Link href="/pro" onClick={() => setOpen(false)}
            className="bg-[#e8002d] text-white text-sm font-bold py-3 px-6 rounded-full text-center">
            Analyze My Video
          </Link>
        </div>
      )}
    </header>
  );
}
