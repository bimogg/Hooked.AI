'use client';
import { Check, Video, Infinity, Sparkles, BarChart3, FileText, Zap, Crown } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

const POLAR_CHECKOUT = 'https://buy.polar.sh/polar_cl_z60eWttODS3mrButkP1Q6WZzVsDpDLgpk4fMs4X32s4';

const PRO_ICONS = [Video, Infinity, Sparkles, BarChart3, FileText, Zap, Crown];

function CheckItem({ text, dim }: { text: string; dim?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 text-sm ${dim ? 'opacity-35 line-through' : ''}`}>
      <Check size={14} className={`mt-0.5 shrink-0 ${dim ? 'text-[#ccc]' : 'text-emerald-600'}`} />
      {text}
    </li>
  );
}

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
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold mb-3">{tr('pricing', 'badge', lang)}</p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase leading-none">
          {tr('pricing', 'title', lang)}
        </h1>
        <p className="text-[#888] text-sm mt-5 max-w-md mx-auto">
          {tr('pricing', 'subtitle', lang)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">

        {/* Free */}
        <div className="relative rounded-3xl border border-black/15 bg-white p-7 flex flex-col gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#888]">Free</p>
            <div className="flex items-end gap-1.5">
              <span className="font-display font-extrabold text-5xl leading-none">$0</span>
              <span className="text-xs mb-1.5 text-[#aaa]">/{tr('pricing', 'freePeriod', lang)}</span>
            </div>
            <p className="text-sm mt-2 text-[#666]">{tr('pricing', 'freeDesc', lang)}</p>
          </div>
          <a href="/"
            className="block text-center text-sm font-bold py-3.5 rounded-full transition-all border border-black/20 text-black hover:bg-black hover:text-white">
            {tr('pricing', 'freeCta', lang)}
          </a>
          <ul className="flex flex-col gap-3">
            {freeFeatures.map(k => <CheckItem key={k} text={tr('pricing', k, lang)} />)}
            {freeMissing.map(k => <CheckItem key={k} text={tr('pricing', k, lang)} dim />)}
          </ul>
        </div>

        {/* Pro */}
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-7 flex flex-col gap-6 shadow-[0_24px_60px_-24px_rgba(232,0,45,0.4)]">
          {/* brand gradient glow */}
          <div className="pointer-events-none absolute -top-12 inset-x-0 h-52 blur-3xl opacity-55"
            style={{ background: 'radial-gradient(58% 80% at 50% 35%, #ff5a72 0%, #e8002d 45%, transparent 74%)' }} />

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#888]">Pro</p>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#e8002d] text-white">
                {tr('pricing', 'popularBadge', lang)}
              </span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="font-display font-extrabold text-6xl leading-none">$12</span>
              <span className="text-xs mb-2 text-[#888]">/mo</span>
            </div>
            <p className="text-sm mt-2 text-[#666]">{tr('pricing', 'proDesc', lang)}</p>
          </div>

          {isSignedIn ? (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={`relative ${proBtnClass}`}>
              {tr('pricing', 'proCta', lang)}
            </a>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/pricing" signUpForceRedirectUrl="/pricing">
              <button className={`relative ${proBtnClass}`}>{tr('pricing', 'proCta', lang)}</button>
            </SignInButton>
          )}

          <ul className="relative flex flex-col gap-3.5 pt-1">
            {proFeatures.map((k, i) => {
              const Icon = PRO_ICONS[i % PRO_ICONS.length];
              return (
                <li key={k} className="flex items-center gap-3 text-sm">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#e8002d]/10 text-[#e8002d] shrink-0">
                    <Icon size={14} />
                  </span>
                  {tr('pricing', k, lang)}
                </li>
              );
            })}
          </ul>

          <a href="mailto:anagashtay@gmail.com" className="relative text-center text-xs text-[#999] hover:text-black transition-colors">
            {tr('pricing', 'needHelp', lang)}
          </a>
        </div>

      </div>

      <p className="text-center text-xs text-[#bbb] mt-10">
        {tr('pricing', 'noContracts', lang)}
      </p>
    </div>
  );
}
