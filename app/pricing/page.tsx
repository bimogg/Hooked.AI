import { Check } from 'lucide-react';

export const metadata = { title: 'HookedAI — Pricing' };

const plans = [
  {
    name: 'Free',
    badge: null,
    price: '$0',
    period: 'forever',
    desc: 'For creators just getting started',
    cta: 'Get Started',
    ctaHref: '/',
    ctaStyle: 'border border-black/20 text-black hover:bg-black hover:text-white',
    features: [
      'Full Hook Library access',
      '15+ viral hooks with real views data',
      'Filter by hook type & niche',
      'Copy hook scripts',
      'See what works before you record',
    ],
    missing: [
      'AI analysis of your videos',
      'Custom hook script for your content',
      'Competitor hook breakdown',
    ],
  },
  {
    name: 'Pro',
    badge: 'MOST POPULAR',
    price: '$12',
    period: 'per month',
    desc: 'For creators serious about growth',
    cta: 'Get Pro',
    ctaHref: '/pro',
    ctaStyle: 'bg-[#e8002d] text-white hover:opacity-90',
    features: [
      'Everything in Free',
      'Unlimited AI video analyses',
      'Upload video → get hook script',
      'Hook type + exact placement (0–3 sec)',
      'Copy-ready hook scripts',
      'Why your current hook is weak',
      'Variant A/B hook suggestions',
    ],
    missing: [],
  },
];

function Check2({ text, dim }: { text: string; dim?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 text-sm ${dim ? 'opacity-35 line-through' : ''}`}>
      <Check size={14} className={`mt-0.5 shrink-0 ${dim ? 'text-[#ccc]' : 'text-emerald-600'}`} />
      {text}
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold mb-3">Pricing</p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase leading-none">
          Stop Guessing.<br />Start Hooking.
        </h1>
        <p className="text-[#888] text-sm mt-5 max-w-md mx-auto">
          Pick your plan. Get hook scripts that actually make people watch to the end.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border p-7 flex flex-col gap-6 ${
              plan.badge === 'MOST POPULAR'
                ? 'border-[#e8002d] bg-[#fff8f8]'
                : plan.badge === 'BEST VALUE'
                ? 'border-black bg-[#0a0a0a] text-white'
                : 'border-black/15 bg-white'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  plan.badge === 'MOST POPULAR' ? 'bg-[#e8002d] text-white' : 'bg-white text-black'
                }`}>
                  {plan.badge}
                </span>
              </div>
            )}

            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${
                plan.badge === 'BEST VALUE' ? 'text-[#666]' : 'text-[#888]'
              }`}>{plan.name}</p>
              <div className="flex items-end gap-1.5">
                <span className="font-display font-extrabold text-5xl leading-none">{plan.price}</span>
                <span className={`text-xs mb-1.5 ${plan.badge === 'BEST VALUE' ? 'text-[#666]' : 'text-[#aaa]'}`}>
                  /{plan.period}
                </span>
              </div>
              <p className={`text-sm mt-2 ${plan.badge === 'BEST VALUE' ? 'text-[#888]' : 'text-[#666]'}`}>
                {plan.desc}
              </p>
            </div>

            <a
              href={plan.ctaHref}
              className={`block text-center text-sm font-bold py-3.5 rounded-full transition-all ${plan.ctaStyle}`}
            >
              {plan.cta}
            </a>

            <ul className="flex flex-col gap-3">
              {plan.features.map(f => <Check2 key={f} text={f} />)}
              {plan.missing.map(f => <Check2 key={f} text={f} dim />)}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#bbb] mt-10">
        No contracts. Cancel anytime. All prices in USD.
      </p>
    </div>
  );
}
