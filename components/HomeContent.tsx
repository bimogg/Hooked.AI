'use client';
import Link from 'next/link';
import { ArrowRight, Zap, BarChart2, BookOpen, Lock } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

export default function HomeContent() {
  const { lang } = useLang();
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#e8002d] rounded-full animate-pulse" />
          {tr('home', 'earlyAccess', lang)}
        </div>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight">
          Stop<br />
          <span className="text-[#e8002d]">The</span><br />
          Drop
        </h1>
        <p className="text-[#666] text-base md:text-lg max-w-lg leading-relaxed">
          {tr('home', 'heroSub', lang)}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/pro"
            className="bg-[#e8002d] text-white font-bold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
            {tr('home', 'ctaAnalyze', lang)} <ArrowRight size={16} />
          </Link>
          <Link href="/library"
            className="border border-black/20 text-black font-bold text-sm px-8 py-4 rounded-full hover:border-black transition-colors">
            {tr('home', 'ctaBrowse', lang)}
          </Link>
        </div>
        <p className="text-xs text-[#bbb]">{tr('home', 'freeBadge', lang)}</p>
      </section>

      {/* PROBLEM */}
      <section className="bg-[#0a0a0a] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-4">{tr('home', 'problemBadge', lang)}</p>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight mb-6">
            {tr('home', 'problemTitle', lang)}
          </h2>
          <p className="text-[#888] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {tr('home', 'problemSub', lang)}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { stat: '80%', key: 'stat1' },
              { stat: '3 sec', key: 'stat2' },
              { stat: '0', key: 'stat3' },
            ].map(({ stat, key }) => (
              <div key={stat} className="border border-white/10 rounded-2xl p-6">
                <p className="font-display font-extrabold text-4xl text-[#e8002d]">{stat}</p>
                <p className="text-[#888] text-sm mt-2 leading-snug">{tr('home', key, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-4 text-center">{tr('home', 'whatYouGet', lang)}</p>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight text-center mb-14">
            {tr('home', 'twoTools', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="border border-black/10 rounded-3xl p-8 flex flex-col gap-4 hover:border-black/25 transition-colors">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-1">Free</p>
                <h3 className="font-display font-extrabold text-2xl uppercase">Hook Library</h3>
              </div>
              <p className="text-[#666] text-sm leading-relaxed">{tr('home', 'libDesc', lang)}</p>
              <Link href="/library"
                className="mt-auto inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                {tr('home', 'browseLib', lang)} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="border border-[#e8002d] rounded-3xl p-8 flex flex-col gap-4 bg-[#fff8f8]">
              <div className="w-10 h-10 bg-[#e8002d] rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#e8002d] font-bold mb-1">Pro</p>
                <h3 className="font-display font-extrabold text-2xl uppercase">AI Hook Analyzer</h3>
              </div>
              <p className="text-[#666] text-sm leading-relaxed">{tr('home', 'analyzerDesc', lang)}</p>
              <Link href="/pro"
                className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#e8002d] hover:gap-3 transition-all">
                {tr('home', 'tryFree', lang)} <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#f7f7f7] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-4 text-center">{tr('home', 'howItWorks', lang)}</p>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight text-center mb-14">
            {tr('home', 'threeSteps', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', tk: 'step1t', dk: 'step1d' },
              { n: '02', tk: 'step2t', dk: 'step2d' },
              { n: '03', tk: 'step3t', dk: 'step3d' },
            ].map(({ n, tk, dk }) => (
              <div key={n} className="flex flex-col gap-3">
                <span className="font-display font-extrabold text-5xl text-black/10">{n}</span>
                <h3 className="font-display font-bold text-lg uppercase">{tr('home', tk, lang)}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{tr('home', dk, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <Lock size={20} className="text-[#e8002d]" />
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight">
            {tr('home', 'ctaTitle', lang)}
          </h2>
          <p className="text-[#888] text-sm leading-relaxed max-w-md">
            {tr('home', 'ctaSub', lang)}
          </p>
          <Link href="/pro"
            className="bg-[#e8002d] text-white font-bold text-sm px-10 py-4 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
            {tr('home', 'ctaBtn', lang)} <ArrowRight size={16} />
          </Link>
          <Link href="/pricing" className="text-xs text-[#aaa] hover:text-black transition-colors">
            {tr('home', 'ctaLink', lang)}
          </Link>
        </div>
      </section>

    </div>
  );
}
