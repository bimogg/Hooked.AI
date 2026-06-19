'use client';
import { Check } from 'lucide-react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

const POLAR_CHECKOUT = 'https://buy.polar.sh/polar_cl_z60eWttODS3mrButkP1Q6WZzVsDpDLgpk4fMs4X32s4';

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

  const proBtnClass = 'block w-full text-center text-sm font-bold py-3.5 rounded-full transition-all bg-[#e8002d] text-white hover:opacity-90 cursor-pointer';
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
        <div className="relative rounded-3xl border border-[#e8002d] bg-[#fff8f8] p-7 flex flex-col gap-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#e8002d] text-white">
              {tr('pricing', 'popularBadge', lang)}
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-[#888]">Pro</p>
            <div className="flex items-end gap-1.5">
              <span className="font-display font-extrabold text-5xl leading-none">$12</span>
              <span className="text-xs mb-1.5 text-[#aaa]">/mo</span>
            </div>
            <p className="text-sm mt-2 text-[#666]">{tr('pricing', 'proDesc', lang)}</p>
          </div>
          {isSignedIn ? (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className={proBtnClass}>
              {tr('pricing', 'proCta', lang)}
            </a>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/pricing" signUpForceRedirectUrl="/pricing">
              <button className={proBtnClass}>{tr('pricing', 'proCta', lang)}</button>
            </SignInButton>
          )}
          <ul className="flex flex-col gap-3">
            {proFeatures.map(k => <CheckItem key={k} text={tr('pricing', k, lang)} />)}
          </ul>
        </div>

      </div>

      <p className="text-center text-xs text-[#bbb] mt-10">
        {tr('pricing', 'noContracts', lang)}
      </p>
    </div>
  );
}
