'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';
import { useReveal } from '@/hooks/useReveal';

/* ── scroll-driven word reveal (Apple-style) ── */
function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when top of el hits bottom of viewport, 1 when bottom of el hits top
      const raw = (vh - rect.top) / (vh + rect.height);
      setProgress(Math.max(0, Math.min(1, raw)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const words = text.split(' ');
  return (
    <p ref={ref} style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 300,
      fontSize: 'clamp(22px, 2.6vw, 34px)',
      lineHeight: 1.55,
      letterSpacing: '-0.01em',
    }}>
      {words.map((word, i) => {
        const threshold = i / words.length;
        // each word lights up when scroll progress passes its threshold
        const lit = progress > threshold + 0.02;
        return (
          <span key={i} style={{
            color: lit ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.13)',
            transition: 'color 0.4s ease',
          }}>{word}{' '}</span>
        );
      })}
    </p>
  );
}

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
      <section className="relative min-h-[92vh] flex items-center px-6 md:px-12 py-16">
        <div className="w-full flex items-center justify-between gap-10">

          {/* LEFT: text centered vertically */}
          <div className="flex flex-col gap-6 max-w-xl md:pl-10 lg:pl-20" data-reveal="left">
            <h1 className="font-display font-extrabold uppercase leading-[0.88] tracking-tighter text-[clamp(2.8rem,7vw,6rem)]">
              HOOK<br />
              <span className="text-[#e8002d]">OR</span><br />
              LOSE
            </h1>
            <p className="text-[#666] text-sm md:text-base max-w-xs leading-relaxed">
              Upload your video. AI finds where you lose viewers. Get a script to fix it.
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
          </div>

          {/* RIGHT: Mac browser mockup 3D */}
          <div className="hidden md:block shrink-0 w-[420px] lg:w-[520px] xl:w-[600px]" data-reveal="right" style={{
            perspective: '1200px',
          }}>
            <div style={{
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '-24px 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.07)',
              background: '#e8e8e8',
              transform: 'rotateY(-14deg) rotateX(4deg)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'rotateY(-6deg) rotateX(2deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'rotateY(-14deg) rotateX(4deg)')}
            >
              {/* Mac window chrome */}
              <div style={{
                background: 'linear-gradient(180deg, #ebebeb 0%, #d8d8d8 100%)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}>
                {/* Traffic lights */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                </div>
                {/* URL bar */}
                <div style={{
                  flex: 1, background: 'rgba(0,0,0,0.08)', borderRadius: 6,
                  padding: '3px 10px', fontSize: 11, color: '#666',
                  textAlign: 'center', fontFamily: 'system-ui',
                }}>
                  hookedai.com/library
                </div>
              </div>
              {/* Screenshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-screenshot.png" alt="HookedAI app" style={{ width: '100%', display: 'block' }} />
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


      {/* ── ABOUT TEXT ── */}
      <section className="bg-[#0a0a0a] px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.22em] mb-10">HookedAI</p>
          <ScrollText text="Your Reels lose 80% of viewers before your message even starts. HookedAI uploads your video, finds the exact second people leave, and shows you a hook that keeps them watching. Then writes you a script to replace your weak opening — ready to copy and post." />
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-[#0a0a0a] text-white px-6 md:px-12 py-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2" data-reveal="left">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#555] mb-6">{tr('home', 'problemBadge', lang)}</p>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-[0.9] tracking-tight">
              {tr('home', 'problemTitle', lang).split('.').filter(Boolean).map((line, i) => (
                <span key={i}>{line.trim()}.<br /></span>
              ))}
            </h2>
          </div>
          <div className="md:w-1/2" data-reveal="right">
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
              <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-[0.9] tracking-tight">
                {tr('home', 'threeSteps', lang).split('.').filter(Boolean).map((part, i) => (
                  <span key={i} className={i === 1 ? 'text-[#e8002d]' : ''}>{part.trim()}. </span>
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
                <span className="font-extrabold text-6xl text-black/8 leading-none">{n}</span>
                <h3 className="font-bold text-xl uppercase">{tr('home', tk, lang)}</h3>
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
            <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-[0.9] tracking-tight">
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



    </div>
  );
}
