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
      const raw = (vh * 0.8 - rect.top) / (rect.height * 0.6);
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
              background: r < h ? '#e8002d' : 'rgba(10,10,10,0.08)',
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
      <section className="relative md:min-h-[92vh] flex items-center px-6 md:px-12 py-8 md:py-16">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-10">

          {/* LEFT: text centered vertically */}
          <div className="flex flex-col gap-6 max-w-xl" data-reveal="left">
            <h1 className="font-display font-extrabold uppercase leading-[0.88] tracking-tighter text-[clamp(2.8rem,7vw,6rem)]">
              HOOK<br />
              <span className="text-[#e8002d]">OR</span><br />
              LOSE
            </h1>
            <p className="text-[#666] text-sm md:text-base max-w-xs leading-relaxed"
               style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300, letterSpacing: '-0.01em' }}>
              {tr('home', 'heroSubShort', lang)}
            </p>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Link href="/pro"
                className="w-full md:w-auto bg-[#e8002d] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {tr('home', 'ctaAnalyze', lang)} <ArrowRight size={15} />
              </Link>
              <Link href="/library"
                className="w-full md:w-auto text-center md:text-left border border-black/20 text-black font-bold text-sm px-7 py-3.5 rounded-full hover:border-black transition-colors">
                {tr('home', 'ctaBrowse', lang)}
              </Link>
            </div>

            {/* mobile-only app screenshot */}
            <div className="md:hidden mt-4 rounded-xl overflow-hidden border border-black/10"
              style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.16)' }}>
              <div style={{ background: 'linear-gradient(180deg,#ebebeb,#d8d8d8)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'block' }} />
                </div>
                <div style={{ flex: 1, background: 'rgba(0,0,0,0.07)', borderRadius: 6, padding: '3px 10px', fontSize: 10, color: '#666', textAlign: 'center' }}>
                  hookedai.com/library
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/app-screenshot.png" alt="HookedAI app" style={{ width: '100%', display: 'block' }} />
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
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#aaa] text-center mb-2">{tr('home', 'byNumbers', lang)}</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl text-center mb-12 tracking-tight">
          {tr('home', 'trustedBy', lang)}
        </h2>
        <div className="stats-grid">
          {[
            { labelKey: 'statLabel1', value: '1000+', bars: [3,5,4,6,7,5,8,6,7,8,7,8,6,8] },
            { labelKey: 'statLabel2', value: '80%',   bars: [2,4,3,5,4,6,5,7,6,8,7,8,8,7] },
            { labelKey: 'statLabel3', value: '3 sec', bars: [8,7,7,6,5,5,4,4,3,3,2,2,1,1] },
          ].map(({ labelKey, value, bars }) => (
            <div key={labelKey} className="bg-[#f5f5f5] rounded-2xl p-6 md:p-7">
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#aaa] mb-2 leading-snug">{tr('home', labelKey, lang)}</p>
              <p className="font-display font-extrabold text-4xl md:text-5xl leading-none">{value}</p>
              <DotMatrix bars={bars} on={statsOn} />
            </div>
          ))}
        </div>
      </section>


      {/* ── PROBLEM ── */}
      <section className="bg-[#0a0a0a] text-white px-6 md:px-12 pb-20 border-b border-white/5" style={{ clipPath: 'polygon(0 80px, 100% 0, 100% calc(100% - 80px), 0 100%)', marginTop: -2, paddingTop: 'calc(80px + 5rem)', paddingBottom: 'calc(80px + 5rem)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-16">
          <div className="md:w-1/2" data-reveal="left">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#555] mb-6">{tr('home', 'problemBadge', lang)}</p>
            <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-[0.9] tracking-tight">
              {tr('home', 'problemTitle', lang).split('.').filter(Boolean).map((line, i) => (
                <span key={i}>{line.trim()}.<br /></span>
              ))}
            </h2>
          </div>
          <div className="md:w-1/2 md:mt-[34px]" data-reveal="right">
            <p className="text-white/85 text-lg md:text-2xl leading-relaxed mb-8 font-light">
              {tr('home', 'problemSub', lang)}
            </p>
            <Link href="/pro" className="inline-flex items-center gap-2 text-sm font-bold text-[#e8002d] hover:gap-3 transition-all">
              {tr('home', 'tryFree', lang)} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 md:px-12 pt-20 pb-40 border-b border-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16" data-reveal>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] mb-3">{tr('home', 'howItWorks', lang)}</p>
              <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-[0.9] tracking-tight lining-nums" style={{ fontFeatureSettings: '"lnum" 1, "onum" 0' }}>
                {tr('home', 'threeSteps', lang).split('.').filter(Boolean).map((part, i) => (
                  <span key={i} className={i === 1 ? 'text-[#e8002d]' : ''}>{part.trim()}. </span>
                ))}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {[
              { n: '01', tk: 'step1t', dk: 'step1d' },
              { n: '02', tk: 'step2t', dk: 'step2d' },
              { n: '03', tk: 'step3t', dk: 'step3d' },
            ].map(({ n, tk, dk }, i) => (
              <div key={n} data-reveal data-delay={String(i + 1)} className="flex flex-col gap-3">
                <span className="font-display font-extrabold text-7xl text-[#e8002d]/40 leading-none">{n}</span>
                <h3 className="font-bold text-xs uppercase tracking-widest">{tr('home', tk, lang)}</h3>
                <p className="text-[#444] text-base md:text-lg leading-relaxed font-light">{tr('home', dk, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── ABOUT TEXT ── */}
      <section className="bg-[#0a0a0a] px-6 md:px-12 py-24 md:py-36">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.22em] mb-10">HookedAI</p>
          <ScrollText text={tr('home', 'aboutText', lang)} />
        </div>
      </section>

    </div>
  );
}
