'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

export default function HomeContent() {
  const { lang } = useLang();
  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex flex-col justify-between px-6 md:px-12 pt-12 pb-10 border-b border-black/10">
        {/* top label */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#888]">{tr('home', 'earlyAccess', lang)}</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#888]">AI · Instagram · Reels</span>
        </div>

        {/* big text + mockup */}
        <div className="flex items-end justify-between gap-6 mt-8">
          <h1 className="font-display font-extrabold uppercase leading-[0.85] tracking-tighter text-[clamp(4rem,13vw,11rem)]">
            STOP<br />
            <span className="text-[#e8002d]">THE</span><br />
            DROP
          </h1>

          {/* mockup placeholder — replace src later */}
          <div className="hidden md:block shrink-0 w-[280px] lg:w-[340px] xl:w-[400px]">
            <div className="relative w-full aspect-[9/16] bg-[#f5f5f5] rounded-3xl overflow-hidden border border-black/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mockup.png" alt="HookedAI app" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#ccc]">
                <div className="w-12 h-12 rounded-2xl bg-[#e8002d] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-xl object-cover" />
                </div>
                <span className="text-xs text-[#bbb] font-medium">HookedAI</span>
              </div>
            </div>
          </div>
        </div>

        {/* bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mt-8">
          <p className="text-[#666] text-sm md:text-base max-w-sm leading-relaxed">
            {tr('home', 'heroSub', lang)}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/pro"
              className="bg-[#e8002d] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
              {tr('home', 'ctaAnalyze', lang)} <ArrowRight size={15} />
            </Link>
            <Link href="/library"
              className="border border-black/20 text-black font-bold text-sm px-7 py-3.5 rounded-full hover:border-black transition-colors">
              {tr('home', 'ctaBrowse', lang)}
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-[#bbb] mt-4">{tr('home', 'freeBadge', lang)}</p>
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
            <div key={i} className={`px-8 py-10 flex flex-col gap-2 ${i < 3 ? 'border-r border-black/10' : ''} ${i >= 2 ? 'border-t border-black/10 md:border-t-0' : ''}`}>
              <p className="font-display font-extrabold text-4xl md:text-5xl leading-none">{stat}</p>
              <p className="text-xs text-[#888] leading-snug max-w-[140px]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-[#0a0a0a] text-white px-6 md:px-12 py-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-16">
          <div className="md:w-1/2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#555] mb-6">{tr('home', 'problemBadge', lang)}</p>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight">
              {tr('home', 'problemTitle', lang).split('.').map((line, i) => (
                <span key={i}>{line.trim()}{i === 0 ? '.' : ''}<br /></span>
              ))}
            </h2>
          </div>
          <div className="md:w-1/2 pt-2">
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
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-3">{tr('home', 'howItWorks', lang)}</p>
              <h2 className="font-display font-extrabold text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight">
                {tr('home', 'threeSteps', lang).split('.').map((part, i) => (
                  <span key={i}>{part.trim()}{i === 0 ? '.' : ''}{i < 1 ? <br /> : ''}</span>
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
              <div key={n} className={`p-8 flex flex-col gap-4 ${i < 2 ? 'md:border-r border-black/10' : ''} ${i > 0 ? 'border-t border-black/10 md:border-t-0' : ''}`}>
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
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-3 text-center">{tr('home', 'whatYouGet', lang)}</p>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight text-center mb-16">
            {tr('home', 'twoTools', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-black/10 rounded-3xl p-10 flex flex-col gap-5">
              <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold">Free</p>
              <h3 className="font-display font-extrabold text-3xl uppercase">Hook Library</h3>
              <p className="text-[#666] text-sm leading-relaxed flex-1">{tr('home', 'libDesc', lang)}</p>
              <Link href="/library" className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                {tr('home', 'browseLib', lang)} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-[#0a0a0a] text-white border border-black rounded-3xl p-10 flex flex-col gap-5">
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
          <h2 className="font-display font-extrabold uppercase leading-[0.85] tracking-tighter text-[clamp(3rem,8vw,7rem)]">
            {tr('home', 'ctaTitle', lang).split('.').map((part, i) => (
              <span key={i} className={i === 1 ? 'text-[#e8002d]' : ''}>
                {part.trim()}{i === 0 ? '.' : ''}<br />
              </span>
            ))}
          </h2>
          <div className="flex flex-col gap-5 max-w-sm">
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

      {/* ── GIANT BRAND ── */}
      <section className="px-6 md:px-12 py-10 overflow-hidden">
        <p className="font-display font-extrabold uppercase leading-none tracking-tighter text-[clamp(5rem,20vw,18rem)] text-black/5 select-none whitespace-nowrap">
          HOOKEDAI
        </p>
      </section>

    </div>
  );
}
