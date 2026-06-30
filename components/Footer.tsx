'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

export default function Footer() {
  const { lang } = useLang();
  const pathname = usePathname();
  if (pathname === '/login') return null;
  return (
    <footer className="bg-[#0a0a0a] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="HookedAI" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-display font-extrabold text-sm uppercase tracking-tight text-white">HookedAI</span>
            </Link>
            <p className="text-xs text-white/40 leading-relaxed max-w-[180px]">
              {tr('footer', 'desc', lang)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{tr('footer', 'product', lang)}</p>
            <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navHome', lang)}</Link>
            <Link href="/pro" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navAnalyzer', lang)}</Link>
            <Link href="/library" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navLibrary', lang)}</Link>
            <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navPricing', lang)}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{tr('footer', 'resources', lang)}</p>
            <Link href="/library?type=Visual+Hook" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navVisualHooks', lang)}</Link>
            <Link href="/library?type=Question+Hook" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navQuestionHooks', lang)}</Link>
            <Link href="/library?type=Warning+Hook" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navWarningHooks', lang)}</Link>
            <Link href="/library?type=Tutorial+Hook" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navTutorialHooks', lang)}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{tr('footer', 'legal', lang)}</p>
            <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navPrivacy', lang)}</Link>
            <Link href="/feedback" className="text-sm text-white/50 hover:text-white transition-colors">{tr('footer', 'navFeedback', lang)}</Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
