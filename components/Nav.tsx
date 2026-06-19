'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Home, LayoutGrid, Tag, Sparkles } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

export default function Nav() {
  const { lang } = useLang();
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  const tabs = [
    { href: '/', icon: Home, label: tr('footer', 'navHome', lang), match: (p: string) => p === '/' },
    { href: '/library', icon: LayoutGrid, label: tr('footer', 'navLibrary', lang), match: (p: string) => p.startsWith('/library') },
    { href: '/pricing', icon: Tag, label: tr('footer', 'navPricing', lang), match: (p: string) => p.startsWith('/pricing') },
    { href: '/pro', icon: Sparkles, label: tr('nav', 'cta', lang), match: (p: string) => p.startsWith('/pro'), accent: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/10 h-14 flex items-center px-6 justify-between">
        <Link href="/" className="font-display font-bold text-sm tracking-tight flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="HookedAI" className="w-7 h-7 rounded-md object-cover" />
          HookedAI
        </Link>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-[#888]">
          <Link href="/" className="hover:text-black transition-colors">{tr('footer', 'navHome', lang)}</Link>
          <Link href="/library" className="hover:text-black transition-colors">{tr('footer', 'navLibrary', lang)}</Link>
          <Link href="/pricing" className="hover:text-black transition-colors">{tr('footer', 'navPricing', lang)}</Link>
          <Link href="/privacy" className="hover:text-black transition-colors">{tr('footer', 'navPrivacy', lang)}</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs text-[#888] hover:text-black transition-colors font-medium px-3 py-1.5">
                {tr('nav', 'signIn', lang)}
              </button>
            </SignInButton>
          )}
          <Link href="/pro"
            className="bg-[#e8002d] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            {tr('nav', 'cta', lang)}
          </Link>
        </div>

        {/* mobile top-right: language + account */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs font-semibold text-[#888] px-2 py-1">{tr('nav', 'signIn', lang)}</button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-black/10 flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, icon: Icon, label, match, accent }) => {
          const active = match(pathname);
          const color = active ? '#e8002d' : '#9a9a9a';
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 active:opacity-60 transition-opacity">
              {accent ? (
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#e8002d] -mt-1 shadow-md shadow-[#e8002d]/30">
                  <Icon size={18} color="#fff" strokeWidth={2.4} />
                </span>
              ) : (
                <Icon size={21} color={color} strokeWidth={active ? 2.6 : 2} />
              )}
              <span className="text-[10px] font-semibold leading-none truncate max-w-[72px]"
                style={{ color: accent ? '#e8002d' : color }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
