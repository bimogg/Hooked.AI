import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: 'HookedAI — Stop The Drop',
  description: 'AI hook analyzer for Instagram creators. Find winning hooks, decode why your Reels lose viewers.',
};

const META = [
  { label: 'Category',   value: 'Hook Analysis' },
  { label: 'Works with', value: 'Instagram Reels' },
  { label: 'Platform',   value: 'AI-Powered' },
  { label: 'Free plan',  value: 'Yes — no card' },
  { label: 'Pro',        value: 'From $19 / mo' },
];

const HOOKS = [
  { type: 'Visual Hook',     user: '@slidergraph',         views: '3.5M', color: 'bg-pink-100 text-pink-700' },
  { type: 'Question Hook',   user: '@katrina_pahomova',    views: '2.1M', color: 'bg-sky-100 text-sky-700' },
  { type: 'Tutorial Hook',   user: '@marusya.naumenko',    views: '1.8M', color: 'bg-teal-100 text-teal-700' },
  { type: 'Curiosity Hook',  user: '@yumerental',          views: '940K', color: 'bg-amber-100 text-amber-700' },
  { type: 'Warning Hook',    user: '@ugcbrookealicia',     views: '748K', color: 'bg-red-100 text-red-700' },
  { type: 'Engagement Hook', user: '@barchevskaia.socials',views: '412K', color: 'bg-orange-100 text-orange-700' },
];

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* ── PAGE COMPONENT: 1fr 3fr grid ── */}
      <div className="grid gap-16" style={{ gridTemplateColumns: '1fr 3fr', alignItems: 'start' }}>

        {/* ── LEFT PANEL (sticky) ── */}
        <div className="flex flex-col justify-between gap-8 sticky top-10" style={{ minHeight: '90vh' }}>

          {/* top section */}
          <div className="flex flex-col gap-6">

            {/* icon */}
            <div className="w-12 h-12 border border-black/15 rounded-xl overflow-hidden flex items-center justify-center bg-[#e8002d]">
              <span className="text-white font-black text-xl">H</span>
            </div>

            {/* title */}
            <div>
              <h1 className="font-display font-extrabold text-2xl uppercase leading-tight">
                HookedAI
              </h1>
              <p className="text-[#888] text-xs mt-1 leading-relaxed">
                Stop losing viewers in the first 3 seconds
              </p>
            </div>

            {/* CTA */}
            <Link href="/pro"
              className="inline-flex items-center gap-2 bg-[#e8002d] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity w-fit">
              Try for Free <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* META GRID — exact Saaspo style */}
          <div className="w-full border border-black/15 rounded-[4px] overflow-hidden flex flex-col">
            {META.map(({ label, value }, i) => (
              <div key={label}
                className="grid w-full"
                style={{ gridTemplateColumns: '1fr 1.5fr' }}>
                <div className={`px-2 py-2 border-right border-b border-black/15 text-[11px] text-[#888] ${i < META.length - 1 ? 'border-b' : ''}`}
                  style={{ borderRight: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  {label}
                </div>
                <div className="px-2 py-2 text-[11px] font-medium"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col gap-10">

          {/* Big headline */}
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#e8002d] font-bold mb-5">AI Hook Analyzer</p>
            <h2 className="font-display font-extrabold text-5xl md:text-6xl xl:text-7xl uppercase leading-[0.88]">
              Your Reels lose<br />
              viewers in<br />
              <span className="text-[#e8002d]">3 seconds.</span>
            </h2>
            <p className="text-[#666] text-base mt-6 max-w-xl leading-relaxed">
              HookedAI analyzes your Instagram Reels and writes the exact hook script that makes people stay — right type, right placement, copy-ready.
            </p>
            <div className="flex gap-4 mt-8">
              <Link href="/pro"
                className="inline-flex items-center gap-2 bg-[#e8002d] text-white font-bold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity">
                Analyze My Reels <ArrowUpRight size={14} />
              </Link>
              <Link href="/library"
                className="inline-flex items-center gap-2 border border-black/20 font-bold text-sm px-8 py-4 rounded-full hover:border-black transition-colors">
                Hook Library
              </Link>
            </div>
          </div>

          {/* Hook library preview — browser mockup */}
          <div className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-sm">
            {/* browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-black/10 bg-[#f7f7f7]">
              <div className="w-3 h-3 rounded-full bg-[#e8002d]" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1 mx-4 bg-white border border-black/10 rounded-md px-3 py-1 text-[10px] text-[#aaa]">
                hooked-ai-seven.vercel.app/library
              </div>
            </div>
            {/* hook grid */}
            <div className="p-5 bg-white">
              <div className="flex gap-2 mb-4 flex-wrap">
                {['All','Visual Hook','Question Hook','Tutorial Hook'].map((t,i) => (
                  <span key={t} className={`text-[10px] px-3 py-1 rounded-full border font-medium ${i===0 ? 'bg-black text-white border-black' : 'border-black/15 text-[#666]'}`}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {HOOKS.map(({ type, user, views, color }) => (
                  <div key={user} className="border border-black/8 rounded-xl overflow-hidden bg-[#f9f9f9]">
                    <div className="aspect-[9/14] bg-gradient-to-br from-gray-200 to-gray-300" />
                    <div className="p-2.5 flex flex-col gap-1.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded self-start ${color}`}>{type}</span>
                      <p className="text-[9px] text-[#888]">{user}</p>
                      <p className="text-[10px] font-bold">{views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden">
            {[
              { n: '80%',   label: 'viewers leave in first 3 sec' },
              { n: '15+',   label: 'viral hooks in the library' },
              { n: '$0',    label: 'to start — free forever' },
            ].map(({ n, label }) => (
              <div key={n} className="bg-white px-6 py-5">
                <p className="font-display font-extrabold text-3xl text-[#e8002d]">{n}</p>
                <p className="text-[11px] text-[#888] mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className="border-l-2 border-[#e8002d] pl-6 py-1">
            <p className="text-sm text-[#444] leading-relaxed italic">
              &ldquo;It&rsquo;s much harder to figure out why views suddenly drop —
              I try everything but nothing usually works.&rdquo;
            </p>
            <p className="text-[10px] text-[#aaa] mt-2 uppercase tracking-wider">— SMM creator, 85K followers</p>
          </div>

          {/* Pricing teaser */}
          <div className="border border-black/10 rounded-2xl p-8 flex items-center justify-between gap-6">
            <div>
              <p className="font-display font-bold text-lg uppercase">Ready to stop guessing?</p>
              <p className="text-[#888] text-sm mt-1">Free plan available. Pro from $19/mo.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/pricing" className="border border-black/20 font-bold text-xs px-5 py-2.5 rounded-full hover:border-black transition-colors whitespace-nowrap">
                See Plans
              </Link>
              <Link href="/pro" className="bg-[#e8002d] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
                Start Free
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
