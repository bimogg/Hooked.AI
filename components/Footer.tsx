'use client';
import Link from 'next/link';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

export default function Footer() {
  const { lang } = useLang();
  return (
    <footer className="border-t border-black/10 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="HookedAI" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-display font-extrabold text-sm uppercase tracking-tight">HookedAI</span>
            </Link>
            <p className="text-xs text-[#888] leading-relaxed max-w-[180px]">
              {tr('footer', 'desc', lang)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]">{tr('footer', 'product', lang)}</p>
            <Link href="/" className="text-sm text-[#555] hover:text-black transition-colors">Home</Link>
            <Link href="/pro" className="text-sm text-[#555] hover:text-black transition-colors">AI Analyzer</Link>
            <Link href="/library" className="text-sm text-[#555] hover:text-black transition-colors">Hook Library</Link>
            <Link href="/pricing" className="text-sm text-[#555] hover:text-black transition-colors">Pricing</Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]">{tr('footer', 'resources', lang)}</p>
            <Link href="/library?type=Visual+Hook" className="text-sm text-[#555] hover:text-black transition-colors">Visual Hooks</Link>
            <Link href="/library?type=Question+Hook" className="text-sm text-[#555] hover:text-black transition-colors">Question Hooks</Link>
            <Link href="/library?type=Warning+Hook" className="text-sm text-[#555] hover:text-black transition-colors">Warning Hooks</Link>
            <Link href="/library?type=Tutorial+Hook" className="text-sm text-[#555] hover:text-black transition-colors">Tutorial Hooks</Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]">{tr('footer', 'legal', lang)}</p>
            <Link href="/privacy" className="text-sm text-[#555] hover:text-black transition-colors">Privacy Policy</Link>
          </div>

        </div>

        <div className="border-t border-black/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#aaa]">{tr('footer', 'rights', lang)}</p>
          <a href="/pro"
            className="text-xs bg-[#e8002d] text-white font-bold px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
            {tr('footer', 'analyzeBtn', lang)}
          </a>
        </div>
      </div>
    </footer>
  );
}
