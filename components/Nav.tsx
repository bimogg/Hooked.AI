'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Video, DollarSign, User } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from './LanguageProvider';
import { useAuth } from './AuthProvider';
import { tr } from '@/lib/translations';

export default function Nav() {
  const { lang } = useLang();
  const { user } = useAuth();
  const isSignedIn = !!user;
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) || '';
  const pathname = usePathname();

  // clean full-screen auth page — no nav
  if (pathname === '/login') return null;

  const tabs = [
    { href: '/', icon: Home, match: (p: string) => p === '/' },
    { href: '/library', icon: BookOpen, match: (p: string) => p.startsWith('/library') },
    { href: '/pro', icon: Video, match: (p: string) => p === '/pro' || p.startsWith('/pro/') },
    { href: '/pricing', icon: DollarSign, match: (p: string) => p.startsWith('/pricing') },
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
            <Link href="/profile" className={`flex items-center justify-center w-8 h-8 rounded-full overflow-hidden text-xs font-bold uppercase ${avatarUrl ? 'bg-white border border-black/10' : 'bg-[#e8002d] text-white'}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.email?.[0] ?? 'U'
              )}
            </Link>
          ) : (
            <Link href="/login" className="text-xs text-[#888] hover:text-black transition-colors font-medium px-3 py-1.5">
              {tr('nav', 'signIn', lang)}
            </Link>
          )}
          <Link href="/pro"
            className="bg-[#e8002d] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
            {tr('nav', 'cta', lang)}
          </Link>
        </div>

        {/* mobile top-right: language only (account lives in bottom bar) */}
        <div className="flex md:hidden items-center">
          <LanguageSwitcher />
        </div>
      </header>

      {/* mobile bottom tab bar — floating light glass */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 px-4 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pointer-events-none">
        <nav className="pointer-events-auto mx-auto max-w-xs flex items-center justify-around rounded-full border border-white/60 px-2 py-2"
          style={{ background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}>
          {tabs.map(({ href, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link key={href} href={href}
                className="flex items-center justify-center px-4 py-2 rounded-full transition-all active:scale-90"
                style={active ? { background: 'rgba(232,0,45,0.12)' } : undefined}>
                <Icon size={22} color={active ? '#e8002d' : '#2a2a2a'} strokeWidth={active ? 2.5 : 2} />
              </Link>
            );
          })}
          <Link href="/profile"
            className="flex items-center justify-center px-4 py-2 rounded-full transition-all active:scale-90"
            style={pathname.startsWith('/profile') ? { background: 'rgba(232,0,45,0.12)' } : undefined}>
            <User size={22} color={pathname.startsWith('/profile') ? '#e8002d' : '#2a2a2a'} strokeWidth={pathname.startsWith('/profile') ? 2.5 : 2} />
          </Link>
        </nav>
      </div>
    </>
  );
}
