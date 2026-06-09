import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: 'HookedAI — Stop The Drop',
  description: 'AI hook analyzer for Instagram creators. Find winning hooks, decode why your Reels lose viewers.',
};

const META_ROWS = [
  { label: 'Category',   value: 'Hook Analysis' },
  { label: 'Works with', value: 'Instagram Reels' },
  { label: 'Platform',   value: 'AI-Powered' },
  { label: 'Free plan',  value: 'Yes — no card' },
  { label: 'Pricing',    value: 'From $19 / mo' },
];

const STATS = [
  { n: '80%',    label: 'viewers leave in the first 3 seconds' },
  { n: '3 sec',  label: 'is all you have to hook someone' },
  { n: '15+',    label: 'viral hooks with real views data' },
  { n: '$0',     label: 'to start — free forever plan' },
];

const FEATURES = [
  {
    tag: 'Free',
    title: 'Hook Library',
    desc: 'Browse 15+ viral hooks from top creators, sorted by views. Filter by type — Visual, Question, Warning, Tutorial and more.',
    href: '/library',
    cta: 'Browse Library',
  },
  {
    tag: 'Pro',
    title: 'AI Hook Analyzer',
    desc: 'Enter your Instagram — AI scrapes your Reels and writes a custom hook script per video. Type, placement, copy-ready.',
    href: '/pro',
    cta: 'Try for Free',
  },
  {
    tag: 'Pro Max',
    title: 'Competitor Analysis',
    desc: 'Analyze any public account. See exactly what hooks your competitors use and why they work. Coming soon.',
    href: '/pricing',
    cta: 'See Pricing',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO — two-column split ── */}
      <section className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] min-h-[88vh]">

          {/* LEFT — info panel */}
          <div className="flex flex-col justify-between py-12 md:py-16 border-r border-black/10 pr-0 md:pr-12">
            <div className="flex flex-col gap-8">
              {/* eyebrow */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e8002d] animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#888] font-bold">Early Access Open</span>
              </div>

              {/* headline */}
              <div>
                <h1 className="font-display font-extrabold text-6xl md:text-7xl xl:text-8xl uppercase leading-[0.88] tracking-tight">
                  Stop<br />
                  The<br />
                  <span className="text-[#e8002d]">Drop.</span>
                </h1>
                <p className="text-[#666] text-sm mt-6 max-w-xs leading-relaxed">
                  Your Reels lose 80% of viewers in 3 seconds.
                  HookedAI finds the exact hook that makes them stay.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pro"
                  className="inline-flex items-center justify-center gap-2 bg-[#e8002d] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity">
                  Analyze My Reels <ArrowUpRight size={14} />
                </Link>
                <Link href="/library"
                  className="inline-flex items-center justify-center gap-2 border border-black/20 font-bold text-sm px-7 py-3.5 rounded-full hover:border-black transition-colors">
                  Hook Library
                </Link>
              </div>
            </div>

            {/* META ROWS */}
            <div className="mt-12 md:mt-0">
              {META_ROWS.map(({ label, value }, i) => (
                <div key={label}
                  className={`flex items-center justify-between py-3.5 ${i !== META_ROWS.length - 1 ? 'border-b border-black/10' : ''}`}>
                  <span className="text-[11px] text-[#999] uppercase tracking-wider">{label}</span>
                  <span className="text-[12px] font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — stats + visual */}
          <div className="flex flex-col justify-center gap-10 py-12 md:py-16 pl-0 md:pl-12">

            {/* stats grid */}
            <div className="grid grid-cols-2 gap-px bg-black/10 border border-black/10 rounded-3xl overflow-hidden">
              {STATS.map(({ n, label }) => (
                <div key={n} className="bg-white p-7 flex flex-col gap-2">
                  <span className="font-display font-extrabold text-4xl md:text-5xl text-[#e8002d] leading-none">{n}</span>
                  <span className="text-[11px] text-[#888] leading-snug">{label}</span>
                </div>
              ))}
            </div>

            {/* quote */}
            <div className="border-l-2 border-[#e8002d] pl-5">
              <p className="text-sm text-[#444] leading-relaxed italic">
                &ldquo;It&rsquo;s much harder to figure out why views suddenly drop — I try everything but nothing usually works.&rdquo;
              </p>
              <p className="text-[10px] text-[#aaa] mt-2 uppercase tracking-wider">— Instagram creator, 85K followers</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 border-b border-black/10 pb-5">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl uppercase">What&rsquo;s Inside</h2>
          <Link href="/pricing" className="text-xs text-[#888] hover:text-black transition-colors uppercase tracking-wider">
            See all plans →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-3xl overflow-hidden">
          {FEATURES.map(({ tag, title, desc, href, cta }) => (
            <div key={title} className="bg-white p-8 flex flex-col gap-5">
              <span className={`self-start text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                tag === 'Free' ? 'bg-black text-white' :
                tag === 'Pro' ? 'bg-[#e8002d] text-white' :
                'bg-black/8 text-[#888]'
              }`}>{tag}</span>
              <div>
                <h3 className="font-display font-extrabold text-xl uppercase leading-tight">{title}</h3>
                <p className="text-[#666] text-sm mt-3 leading-relaxed">{desc}</p>
              </div>
              <Link href={href}
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:text-[#e8002d] transition-colors">
                {cta} <ArrowUpRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-black/10 bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-5">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl uppercase">How It Works</h2>
            <span className="text-xs text-[#555] uppercase tracking-wider">3 steps</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            {[
              { n: '01', title: 'Enter username', desc: 'Type your Instagram @username. Account must be public. Takes 2 seconds.' },
              { n: '02', title: 'AI analyzes',    desc: 'We pull your latest Reels and Claude AI analyzes each hook in detail.' },
              { n: '03', title: 'Get scripts',     desc: 'Custom hook scripts per video — type, placement, copy-ready text.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-[#0a0a0a] p-8 flex flex-col gap-4">
                <span className="font-display font-extrabold text-6xl text-white/10 leading-none">{n}</span>
                <h3 className="font-display font-bold text-lg uppercase">{title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="border border-[#e8002d] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#e8002d] font-bold mb-3">Free to start</p>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight">
              Your hook.<br />Your analysis.<br />Only yours.
            </h2>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
            <Link href="/pro"
              className="bg-[#e8002d] text-white font-bold text-sm px-10 py-4 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              Analyze My Reels Free <ArrowUpRight size={16} />
            </Link>
            <Link href="/pricing" className="text-xs text-[#aaa] hover:text-black transition-colors">
              See pricing →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
