'use client';
import { Check, Video, Infinity, Sparkles, BarChart3, FileText, Zap, Crown } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

const POLAR_CHECKOUT = 'https://buy.polar.sh/polar_cl_z60eWttODS3mrButkP1Q6WZzVsDpDLgpk4fMs4X32s4';
const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

const PRO_ICONS = [Video, Infinity, Sparkles, BarChart3, FileText, Zap, Crown];

export default function PricingContent() {
  const { lang } = useLang();
  const { isSignedIn, user } = useUser();

  const proBtnClass = 'block w-full text-center text-sm font-bold py-3.5 rounded-full transition-opacity bg-black text-white hover:opacity-90 cursor-pointer';
  const email = user?.primaryEmailAddress?.emailAddress;
  const checkoutUrl = email ? `${POLAR_CHECKOUT}?customer_email=${encodeURIComponent(email)}` : POLAR_CHECKOUT;

  const freeFeatures = ['freeF1', 'freeF2', 'freeF3', 'freeF4', 'freeF5'];
  const freeMissing = ['freeM1', 'freeM2', 'freeM3'];
  const proFeatures = ['proF1', 'proF2', 'proF3', 'proF4', 'proF5', 'proF6', 'proF7'];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-16">
      <div className="text-center mb-10 md:mb-14" style={{ fontFamily: APPLE_FONT }}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#e8002d] font-semibold mb-3">{tr('pricing', 'badge', lang)}</p>
        <h1 className="font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">
          {tr('pricing', 'title', lang)}
        </h1>
        <p className="text-[#555] text-base md:text-lg mt-5 max-w-xl mx-auto leading-relaxed">
          {tr('pricing', 'subtitle', lang)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">

        {/* Free — same typography as Pro */}
        <div className="relative rounded-[28px] border border-black/10 bg-white p-6 md:p-7 flex flex-col shadow-[0_30px_70px_-40px_rgba(0,0,0,0.25)]"
          style={{ fontFamily: APPLE_FONT }}>
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-lg">Free</p>
          </div>
          <div className="flex items-baseline gap-2 mb-5">
            <span className="font-extrabold text-[46px] md:text-[54px] leading-none tracking-tight">$0</span>
            <span className="text-xs text-[#5a5a5a]">{tr('pricing', 'freePeriod', lang)}</span>
          </div>
          <a href="/"
            className="block text-center text-sm font-bold py-3.5 rounded-full transition-colors border border-black/15 text-black hover:bg-black hover:text-white">
            {tr('pricing', 'freeCta', lang)}
          </a>
          <ul className="flex flex-col gap-4 mt-7">
            {freeFeatures.map(k => (
              <li key={k} className="flex items-center gap-3 text-sm text-[#1a1a1a]">
                <Check size={18} strokeWidth={2} className="text-[#1a1a1a] shrink-0" />
                {tr('pricing', k, lang)}
              </li>
            ))}
            {freeMissing.map(k => (
              <li key={k} className="flex items-center gap-3 text-sm text-[#bbb] line-through">
                <Check size={18} strokeWidth={2} className="text-[#d0d0d0] shrink-0" />
                {tr('pricing', k, lang)}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro — reference style */}
        <div className="relative overflow-hidden rounded-[28px] bg-white p-6 md:p-7 flex flex-col shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)]"
          style={{ fontFamily: APPLE_FONT }}>
          {/* soft warm gradient fill behind the header + button */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[230px]"
            style={{ background: 'linear-gradient(172deg, #ffe7d4 0%, #ffb9c6 40%, #ffd7dd 63%, #ffffff 93%)' }} />

          {/* header */}
          <div className="relative flex items-center justify-between mb-5">
            <p className="font-bold text-lg">Pro</p>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/85 text-white">
              {tr('pricing', 'popularBadge', lang)}
            </span>
          </div>

          {/* price */}
          <div className="relative flex items-baseline gap-2 mb-5">
            <span className="font-extrabold text-[46px] md:text-[54px] leading-none tracking-tight">$12</span>
            <span className="text-xs text-[#5a5a5a] leading-snug">{tr('pricing', 'perMonth', lang)}</span>
          </div>

          {/* button right after price */}
          {isSignedIn ? (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={`relative ${proBtnClass}`}>
              {tr('pricing', 'proCta', lang)}
            </a>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/pricing" signUpForceRedirectUrl="/pricing">
              <button className={`relative ${proBtnClass}`}>{tr('pricing', 'proCta', lang)}</button>
            </SignInButton>
          )}

          {/* features — clean dark line icons */}
          <ul className="relative flex flex-col gap-4 mt-7">
            {proFeatures.map((k, i) => {
              const Icon = PRO_ICONS[i % PRO_ICONS.length];
              return (
                <li key={k} className="flex items-center gap-3 text-sm text-[#1a1a1a]">
                  <Icon size={18} strokeWidth={1.8} className="text-[#1a1a1a] shrink-0" />
                  {tr('pricing', k, lang)}
                </li>
              );
            })}
          </ul>

          <a href="mailto:anagashtay@gmail.com" className="relative text-center text-xs text-[#aaa] hover:text-black transition-colors mt-7">
            {tr('pricing', 'needHelp', lang)}
          </a>
        </div>

      </div>

      {/* Pro includes — concise checklist (Spotify-style) */}
      <div className="max-w-3xl mx-auto mt-20 flex flex-col md:flex-row md:items-start gap-6 md:gap-12" style={{ fontFamily: APPLE_FONT }}>
        <h2 className="font-bold text-2xl md:text-4xl tracking-tight md:w-1/2 leading-tight">{tr('pricing', 'includesTitle', lang)}</h2>
        <ul className="md:w-1/2 flex flex-col gap-3">
          {proFeatures.map(k => (
            <li key={k} className="flex items-start gap-2.5 text-sm md:text-base">
              <Check size={17} strokeWidth={2.4} className="text-[#e8002d] shrink-0 mt-0.5" />
              {tr('pricing', k, lang)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
