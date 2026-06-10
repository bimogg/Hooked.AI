'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';
import { useReveal } from '@/hooks/useReveal';

/* ── dot matrix bar chart (kept from new design) ── */
function DotMatrix({ bars, on }: { bars: number[]; on: boolean }) {
  const H = 10;
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', marginTop: 18 }}>
      {bars.map((h, c) => (
        <div key={c} style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
          {Array.from({ length: H }).map((_, r) => (
            <div key={r} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: r < h ? '#0a0a0a' : 'rgba(10,10,10,0.08)',
              opacity: on ? 1 : 0,
              transform: on ? 'scale(1)' : 'scale(0)',
              transition: `opacity .25s ${(c * H + r) * 16}ms, transform .25s ${(c * H + r) * 16}ms`,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HomeContent() {
  const { lang } = useLang();
  useReveal();

  const [statsOn, setStatsOn] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = statRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true); }, { threshold: 0.25 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center px-6 md:px-12 py-16 border-b border-black/10">
        <div className="w-full flex items-center justify-between gap-10">

          {/* LEFT: text centered vertically */}
          <div className="flex flex-col gap-6 max-w-xl" data-reveal="left">
            <h1 className="font-display font-extrabold uppercase leading-[0.88] tracking-tighter text-[clamp(2.8rem,7vw,6rem)]">
              STOP<br />
              <span className="text-[#e8002d]">THE</span><br />
              DROP
            </h1>
            <p className="text-[#666] text-sm md:text-base max-w-sm leading-relaxed">
              {tr('home', 'heroSub', lang)}
            </p>
            <div className="flex items-center gap-3">
              <Link href="/pro"
                className="bg-[#e8002d] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
                {tr('home', 'ctaAnalyze', lang)} <ArrowRight size={15} />
              </Link>
              <Link href="/library"
                className="border border-black/20 text-black font-bold text-sm px-7 py-3.5 rounded-full hover:border-black transition-colors">
                {tr('home', 'ctaBrowse', lang)}
              </Link>
            </div>
            <p className="text-[10px] text-[#bbb]">{tr('home', 'freeBadge', lang)}</p>
          </div>

          {/* RIGHT: mockup */}
          <div className="hidden md:block shrink-0 w-[240px] lg:w-[290px] xl:w-[340px]" data-reveal="right">
            <div className="relative w-full aspect-[9/16] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-black/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mockup.png" alt="HookedAI app" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#e8002d] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-xl object-cover" />
                </div>
                <span className="text-xs text-[#bbb] font-medium">HookedAI</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── TRUSTED BY (dot matrix stats) ── */}
      <section ref={statRef} className="bg-white px-6 md:px-12 py-20">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#aaa] text-center mb-2">By the numbers</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-12 tracking-tight">
          Trusted by creators worldwide
        </h2>
        <div className="stats-grid">
          {[
            { label: 'Hooks in Library',      value: '1000+', bars: [3,5,4,6,7,5,8,6,7,8,7,8,6,8] },
            { label: 'Avg Retention Boost',   value: '80%',   bars: [2,4,3,5,4,6,5,7,6,8,7,8,8,7] },
            { label: 'Critical Hook Window',  value: '3 sec', bars: [8,7,7,6,5,5,4,4,3,3,2,2,1,1] },
          ].map(({ label, value, bars }) => (
            <div key={label} className="bg-[#f5f5f5] rounded-2xl p-6 md:p-7">
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#aaa] mb-2 leading-snug">{label}</p>
              <p className="font-display font-extrabold text-4xl md:text-5xl leading-none">{value}</p>
              <DotMatrix bars={bars} on={statsOn} />
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="border-b border-black/10">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { stat: '80%', label: tr('home', 'stat1', lang) },
            { stat: '3 sec', label: tr('home', 'stat2', lang) },
            { stat: '1000+', label: 'hooks in library' },
            { stat: '0', label: tr('home', 'stat3', lang) },
          ].map(({ stat, label }, i) => (
            <div key={i}
              data-reveal data-delay={String(i + 1)}
              className={`px-8 py-10 flex flex-col gap-2 ${i < 3 ? 'border-r border-black/10' : ''} ${i >= 2 ? 'border-t border-black/10 md:border-t-0' : ''}`}>
              <p className="font-display font-extrabold text-4xl md:text-5xl leading-none">{stat}</p>
              <p className="text-xs text-[#888] leading-snug max-w-[140px]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-[#0a0a0a] text-white px-6 md:px-12 py-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-16">
          <div className="md:w-1/2" data-reveal="left">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#555] mb-6">{tr('home', 'problemBadge', lang)}</p>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight">
              {tr('home', 'problemTitle', lang).split('.').filter(Boolean).map((line, i) => (
                <span key={i}>{line.trim()}.<br /></span>
              ))}
            </h2>
          </div>
          <div className="md:w-1/2 pt-2" data-reveal="right">
            <p className="text-[#888] text-sm md:text-base leading-relaxed mb-8">
              {tr('home', 'problemSub', lang)}
            </p>
            <Link href="/pro" className="inline-flex items-center gap-2 text-sm font-bold text-[#e8002d] hover:gap-3 transition-all">
              {tr('home', 'tryFree', lang)} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 md:px-12 py-20 border-b border-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16" data-reveal>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-3">{tr('home', 'howItWorks', lang)}</p>
              <h2 className="font-display font-extrabold text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight">
                {tr('home', 'threeSteps', lang).split('.').filter(Boolean).map((part, i) => (
                  <span key={i}>{part.trim()}.<br /></span>
                ))}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black/10 rounded-3xl overflow-hidden">
            {[
              { n: '01', tk: 'step1t', dk: 'step1d' },
              { n: '02', tk: 'step2t', dk: 'step2d' },
              { n: '03', tk: 'step3t', dk: 'step3d' },
            ].map(({ n, tk, dk }, i) => (
              <div key={n}
                data-reveal data-delay={String(i + 1)}
                className={`p-8 flex flex-col gap-4 ${i < 2 ? 'md:border-r border-black/10' : ''} ${i > 0 ? 'border-t border-black/10 md:border-t-0' : ''}`}>
                <span className="font-display font-extrabold text-6xl text-black/8 leading-none">{n}</span>
                <h3 className="font-display font-bold text-xl uppercase">{tr('home', tk, lang)}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{tr('home', dk, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO TOOLS ── */}
      <section className="px-6 md:px-12 py-20 border-b border-black/10 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div data-reveal className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-3">{tr('home', 'whatYouGet', lang)}</p>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight">
              {tr('home', 'twoTools', lang)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div data-reveal="left" className="bg-white border border-black/10 rounded-3xl p-10 flex flex-col gap-5">
              <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Free</p>
              <h3 className="font-display font-extrabold text-3xl uppercase">Hook Library</h3>
              <p className="text-[#666] text-sm leading-relaxed flex-1">{tr('home', 'libDesc', lang)}</p>
              <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                {tr('home', 'browseLib', lang)} <ArrowRight size={14} />
              </Link>
            </div>
            <div data-reveal="right" className="bg-[#0a0a0a] text-white border border-black rounded-3xl p-10 flex flex-col gap-5">
              <p className="text-[10px] uppercase tracking-widest text-[#e8002d] font-bold">Pro</p>
              <h3 className="font-display font-extrabold text-3xl uppercase">AI Hook Analyzer</h3>
              <p className="text-[#888] text-sm leading-relaxed flex-1">{tr('home', 'analyzerDesc', lang)}</p>
              <Link href="/pro" className="inline-flex items-center gap-2 text-sm font-bold text-[#e8002d] hover:gap-3 transition-all">
                {tr('home', 'tryFree', lang)} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIG CTA ── */}
      <section className="px-6 md:px-12 py-24 border-b border-black/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <h2 data-reveal="left" className="font-display font-extrabold uppercase leading-[0.85] tracking-tighter text-[clamp(3rem,8vw,7rem)]">
            YOUR<br />
            <span className="text-[#e8002d]">ANALYSIS.</span><br />
            ONLY YOURS.
          </h2>
          <div data-reveal="right" className="flex flex-col gap-5 max-w-sm">
            <p className="text-[#888] text-sm leading-relaxed">{tr('home', 'ctaSub', lang)}</p>
            <Link href="/pro"
              className="bg-[#e8002d] text-white font-bold text-sm px-10 py-4 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 w-fit">
              {tr('home', 'ctaBtn', lang)} <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="text-xs text-[#aaa] hover:text-black transition-colors">
              {tr('home', 'ctaLink', lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT TEXT ── */}
      <section className="bg-[#0a0a0a] px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.22em] mb-7">HookedAI</p>
          <p className="text-white/80 leading-[1.78] font-light" style={{ fontSize: 'clamp(15px,1.8vw,19px)' }}>
            Most creators lose their audience in the first 3 seconds without ever
            knowing why. HookedAI watches your video the way an algorithm does —
            spotting the exact frame where attention drops, matching it to hooks
            that retain, and giving you a script to fix it. No guesswork. No vanity
            metrics. Just the data that matters, and the words that work.
          </p>
        </div>
      </section>

      {/* ── GIANT BRAND FOOTER ── */}
      <section className="bg-white px-6 md:px-12 pt-12 pb-0 overflow-hidden">
        {/* nav */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <div className="flex gap-7">
            {([['/', 'Home'], ['/library', 'Library'], ['/pricing', 'Pricing']] as const).map(([href, label]) => (
              <Link key={href} href={href} className="text-xs text-[#999] hover:text-black transition-colors">{label}</Link>
            ))}
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-[#999] hover:text-black transition-colors">Privacy</Link>
            <Link href="/pricing" className="text-xs text-[#999] hover:text-black transition-colors">Terms</Link>
          </div>
        </div>

      </section>

    </div>
  );
}
