'use client';

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { useAuth } from './AuthProvider';
import { tr } from '@/lib/translations';

const POLAR_CHECKOUT = 'https://buy.polar.sh/polar_cl_z60eWttODS3mrButkP1Q6WZzVsDpDLgpk4fMs4X32s4';

const VOLUME_STEPS = [3, 10, 20, 50, 100, 250, 500] as const;

type PlanId = 'free' | 'pro' | 'creator' | 'enterprise';

type Plan = {
  id: PlanId;
  name: string;
  price: number | null;
  volumeLabel: string;
  extraLabel?: string;
  features: string[];
  ctaKey: string;
  href: string | ((email?: string) => string);
  external?: boolean;
};

function recommendedPlan(volume: number): PlanId {
  if (volume <= 3) return 'free';
  if (volume <= 20) return 'pro';
  if (volume <= 100) return 'creator';
  return 'enterprise';
}

function formatVolume(n: number, lang: string): string {
  if (n >= 1000) return lang === 'ru' ? '1000+' : '1,000+';
  return n.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
}

export default function PricingContent() {
  const { lang } = useLang();
  const { user } = useAuth();
  const isSignedIn = !!user;
  const email = user?.email;

  const [stepIdx, setStepIdx] = useState(2);
  const volume = VOLUME_STEPS[stepIdx];
  const highlight = recommendedPlan(volume);

  const checkoutUrl = email
    ? `${POLAR_CHECKOUT}?customer_email=${encodeURIComponent(email)}`
    : POLAR_CHECKOUT;

  const plans: Plan[] = useMemo(() => [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      volumeLabel: tr('pricing', 'volFree', lang),
      features: ['freeF1', 'freeF2', 'freeF3', 'freeF4', 'freeF5'].map(k => tr('pricing', k, lang)),
      ctaKey: 'freeCta',
      href: '/',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 12,
      volumeLabel: tr('pricing', 'volPro', lang),
      extraLabel: tr('pricing', 'extraPro', lang),
      features: ['proF1', 'proF2', 'proF3', 'proF4', 'proF5'].map(k => tr('pricing', k, lang)),
      ctaKey: 'proCta',
      href: isSignedIn ? checkoutUrl : '/login',
      external: isSignedIn,
    },
    {
      id: 'creator',
      name: 'Creator',
      price: 25,
      volumeLabel: tr('pricing', 'volCreator', lang),
      extraLabel: tr('pricing', 'extraCreator', lang),
      features: ['creatorF1', 'creatorF2', 'creatorF3', 'creatorF4', 'creatorF5'].map(k => tr('pricing', k, lang)),
      ctaKey: 'creatorCta',
      href: isSignedIn ? checkoutUrl : '/login',
      external: isSignedIn,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      volumeLabel: tr('pricing', 'volEnterprise', lang),
      features: ['entF1', 'entF2', 'entF3', 'entF4'].map(k => tr('pricing', k, lang)),
      ctaKey: 'enterpriseCta',
      href: 'mailto:anagashtay@gmail.com?subject=Hooked%20AI%20Enterprise',
    },
  ], [lang, isSignedIn, checkoutUrl]);

  const sliderPct = (stepIdx / (VOLUME_STEPS.length - 1)) * 100;
  const current = plans.find(p => p.id === highlight)!;

  return (
    <div className="bg-white text-[#0a0a0a] min-h-[calc(100vh-80px)]">
      <div className="max-w-[1200px] mx-auto px-5 pt-14 pb-20 md:pt-20 md:pb-28">

        {/* Hero — serif title */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-display font-bold text-[56px] md:text-[80px] leading-[0.95] tracking-tight text-[#0a0a0a]">
            {tr('pricing', 'heroTitle', lang)}
          </h1>
          <p className="text-[#666] text-base md:text-lg mt-5 max-w-lg mx-auto leading-relaxed font-light">
            {tr('pricing', 'heroSubtitle', lang)}
          </p>
        </div>

        {/* Volume slider */}
        <div className="max-w-3xl mx-auto mb-14 md:mb-16">
          <p className="text-center text-sm text-[#888] mb-6">{tr('pricing', 'volumeLabel', lang)}</p>
          <div className="relative px-1">
            <div className="h-[3px] bg-black/[0.08] rounded-full relative">
              <div
                className="absolute inset-y-0 left-0 bg-[#e8002d] rounded-full transition-all duration-200"
                style={{ width: `${sliderPct}%` }}
              />
              <input
                type="range"
                min={0}
                max={VOLUME_STEPS.length - 1}
                step={1}
                value={stepIdx}
                onChange={e => setStepIdx(Number(e.target.value))}
                className="pricing-slider absolute inset-0 w-full h-6 -top-2 opacity-0 cursor-pointer z-10"
                aria-label={tr('pricing', 'volumeLabel', lang)}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e8002d] shadow-[0_0_0_4px_rgba(232,0,45,0.18)] pointer-events-none transition-all duration-200"
                style={{ left: `calc(${sliderPct}% - 10px)` }}
              />
            </div>
            <div className="flex justify-between mt-4 gap-1">
              {VOLUME_STEPS.map((v, i) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setStepIdx(i)}
                  className={`text-[10px] md:text-xs transition-colors ${i === stepIdx ? 'text-[#e8002d] font-semibold' : 'text-[#999] hover:text-[#555]'}`}
                >
                  {formatVolume(v, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live price readout — updates as the slider moves */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm text-[#888] mb-2">
            {formatVolume(volume, lang)} {tr('pricing', 'readoutUnit', lang)}
          </p>
          <div className="flex items-baseline justify-center gap-1.5">
            {current.price === null ? (
              <span className="font-display font-bold text-5xl md:text-6xl tracking-tight text-[#0a0a0a]">
                {tr('pricing', 'customPrice', lang)}
              </span>
            ) : (
              <>
                <span className="font-display font-bold text-5xl md:text-6xl tracking-tight text-[#0a0a0a]">
                  ${current.price}
                </span>
                <span className="text-lg text-[#999]">/ mo</span>
              </>
            )}
          </div>
          <p className="text-sm font-medium text-[#e8002d] mt-2 uppercase tracking-wide">{current.name}</p>
        </div>

        {/* Cards — 4 columns like Resend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {plans.map(plan => {
            const isHighlight = plan.id === highlight;
            const href = typeof plan.href === 'function' ? plan.href(email) : plan.href;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-5 md:p-6 transition-all duration-300 ${
                  isHighlight
                    ? 'border-[#e8002d] bg-white shadow-[0_12px_40px_-12px_rgba(232,0,45,0.35)]'
                    : 'border-black/[0.08] bg-white hover:border-black/[0.16] hover:shadow-[0_8px_30px_-16px_rgba(0,0,0,0.2)]'
                }`}
              >
                {isHighlight && plan.id !== 'free' && plan.id !== 'enterprise' && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e8002d] text-white">
                    {tr('pricing', 'recBadge', lang)}
                  </span>
                )}

                <p className="text-sm text-[#888] mb-4">{plan.name}</p>

                <div className="mb-1">
                  {plan.price === null ? (
                    <span className="text-3xl md:text-4xl font-semibold tracking-tight text-[#555]">
                      {tr('pricing', 'customPrice', lang)}
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-semibold tracking-tight text-[#0a0a0a]">${plan.price}</span>
                      <span className="text-sm text-[#999]">/ mo</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-[#888] mb-1">{plan.volumeLabel}</p>
                {plan.extraLabel && (
                  <p className="text-xs text-[#aaa] mb-5">{plan.extraLabel}</p>
                )}
                {!plan.extraLabel && <div className="mb-5" />}

                <a
                  href={href}
                  {...(plan.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`block w-full text-center text-sm font-medium py-2.5 rounded-lg mb-6 transition-colors ${
                    isHighlight
                      ? 'bg-[#e8002d] text-white hover:bg-[#c70027]'
                      : 'bg-white border border-black/15 text-[#0a0a0a] hover:bg-black/[0.04]'
                  }`}
                >
                  {tr('pricing', plan.ctaKey, lang)}
                </a>

                <ul className="flex flex-col gap-3 mt-auto">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#555] leading-snug">
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        className={`shrink-0 mt-0.5 ${isHighlight ? 'text-[#e8002d]' : 'text-[#bbb]'}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#999] mt-12 max-w-md mx-auto leading-relaxed">
          {tr('pricing', 'noContracts', lang)}
        </p>

        {/* Compact comparison — light variant */}
        <div className="max-w-2xl mx-auto mt-20 pt-16 border-t border-black/[0.08]">
          <h2 className="font-display font-bold text-xl md:text-2xl text-center mb-8 tracking-tight text-[#0a0a0a]">
            {tr('pricing', 'cmpTitle', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/[0.08] bg-[#fafafa] p-5">
              <p className="text-xs uppercase tracking-wider text-[#999] mb-4">{tr('pricing', 'cmpOld', lang)}</p>
              <ul className="flex flex-col gap-3">
                {['cmpO1', 'cmpO2', 'cmpO3'].map(k => (
                  <li key={k} className="text-sm text-[#888] leading-snug">{tr('pricing', k, lang)}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#e8002d]/30 bg-[#fff5f6] p-5">
              <p className="text-xs uppercase tracking-wider text-[#e8002d] mb-4">{tr('pricing', 'cmpNew', lang)}</p>
              <ul className="flex flex-col gap-3">
                {['cmpN1', 'cmpN2', 'cmpN3'].map(k => (
                  <li key={k} className="text-sm text-[#333] leading-snug">{tr('pricing', k, lang)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
