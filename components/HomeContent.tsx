'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

/* ── Hook cards data ──────────────────────────────── */
const HOOK_CARDS = [
  { n: '01 / 04', type: 'Question Hook',  hook: '"You\'ve been doing this wrong your entire career..."',            score: '+87%', bg: '#fff5f5', accent: '#e8002d' },
  { n: '02 / 04', type: 'Curiosity Hook', hook: '"Nobody talks about what happens after 1 million followers."',     score: '+79%', bg: '#f5f5f5', accent: '#222'    },
  { n: '03 / 04', type: 'Visual Hook',    hook: '"Watch what happens in exactly the first 3 seconds."',             score: '+92%', bg: '#fff8f0', accent: '#e8002d' },
  { n: '04 / 04', type: 'Warning Hook',   hook: '"Stop posting until you see this. Seriously."',                    score: '+83%', bg: '#f0f4ff', accent: '#3730a3' },
];

const STATS = [
  { label: 'Hooks in Library',      value: '1000+', bars: [3,5,4,6,7,5,8,6,5,7,8,6] },
  { label: 'Avg Retention Boost',   value: '80%',   bars: [2,4,3,5,4,6,5,7,6,8,7,8] },
  { label: 'Critical Hook Window',  value: '3 sec', bars: [8,7,6,5,4,5,3,4,3,2,2,1] },
];

const FEATURES = [
  {
    n: '01',
    words: ['Upload', 'Analyze', 'Improve'],
    screen: 0 as const,
    desc: 'Upload any Reel, TikTok, or Short. AI watches every frame and maps exactly where attention drops.',
    card: { top: 'Any Format', bot: 'MP4 · MOV · WebM' },
  },
  {
    n: '02',
    words: ['Detect', 'Pinpoint', 'Compare'],
    screen: 1 as const,
    desc: 'See the exact second viewers leave and why. Compare your hook side-by-side with a proven winner.',
    card: { top: 'Split View', bot: 'Hook comparison' },
  },
  {
    n: '03',
    words: ['Write', 'Copy', 'Post'],
    screen: 2 as const,
    desc: 'Get a ready-made hook script that replaces your weak opening. Copy it, post it, grow.',
    card: { top: 'Ready Script', bot: 'Copy & Post' },
  },
];

/* ── Dot-bar chart ──────────────────────────────────── */
function DotBar({ bars, visible }: { bars: number[]; visible: boolean }) {
  const maxH = 8;
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', paddingTop: 20 }}>
      {bars.map((h, col) => (
        <div key={col} style={{ display: 'flex', flexDirection: 'column-reverse', gap: 3 }}>
          {Array.from({ length: maxH }).map((_, row) => (
            <div
              key={row}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: row < h ? '#0a0a0a' : 'rgba(10,10,10,0.08)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0)',
                transition: `opacity 0.3s ease ${(col * 6 + row) * 18}ms, transform 0.3s ease ${(col * 6 + row) * 18}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Phone mockup with 3 screens ───────────────────── */
function PhoneMockup({ screen }: { screen: 0 | 1 | 2 }) {
  return (
    <div style={{
      width: 210, height: 420,
      background: '#111827',
      borderRadius: 32,
      border: '1.5px solid rgba(255,255,255,0.07)',
      boxShadow: '0 50px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Dynamic island */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 22, background: '#000', borderRadius: 12, zIndex: 2 }} />
      {/* Status bar */}
      <div style={{ height: 42, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px 8px', fontSize: 11, color: '#fff', fontWeight: 600 }}>
        <span>9:41</span><span style={{ opacity: 0.5 }}>● ● ●</span>
      </div>

      {/* SCREEN 0: Upload */}
      {screen === 0 && (
        <div style={{ padding: '14px 14px' }}>
          <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginBottom: 14 }}>Analyze Hook</div>
          <div style={{
            border: '1.5px dashed rgba(232,0,45,0.5)', borderRadius: 16, height: 130,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'rgba(232,0,45,0.04)',
          }}>
            <div style={{ width: 32, height: 32, background: '#e8002d', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 7px 11px 7px', borderColor: 'transparent transparent white transparent' }} />
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Drop video here</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            {['MP4', 'MOV', 'WebM'].map(f => (
              <div key={f} style={{ background: '#1f2937', borderRadius: 6, padding: '4px 9px', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{f}</div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>Analyzing frames...</div>
            <div style={{ height: 4, background: '#1f2937', borderRadius: 2 }}>
              <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #e8002d, #ff6b6b)', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 1: Analysis */}
      {screen === 1 && (
        <div style={{ padding: '12px 12px' }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10 }}>Hook Analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
            <div style={{ background: '#1c1c1c', borderRadius: 10, height: 86, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'rgba(232,0,45,0.38)' }} />
              <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>Your video</div>
              <div style={{ position: 'absolute', bottom: 4, left: 5, fontSize: 8, color: '#e8002d', fontWeight: 700 }}>⚠ WEAK</div>
            </div>
            <div style={{ background: '#0d1117', borderRadius: 10, height: 86, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70%', background: 'rgba(74,222,128,0.1)' }} />
              <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>Library hook</div>
              <div style={{ position: 'absolute', bottom: 4, left: 5, fontSize: 8, color: '#4ade80', fontWeight: 700 }}>✓ STRONG</div>
            </div>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '8px 10px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Hook Score</span>
              <span style={{ fontSize: 11, color: '#e8002d', fontWeight: 800 }}>63%</span>
            </div>
            <div style={{ height: 4, background: '#333', borderRadius: 2 }}>
              <div style={{ width: '63%', height: '100%', background: '#e8002d', borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ background: '#111', borderRadius: 10, padding: '7px 10px' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>Weak zone: 0:00–0:03</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>Opening too slow. Viewers leave before the message.</div>
          </div>
        </div>
      )}

      {/* SCREEN 2: Script */}
      {screen === 2 && (
        <div style={{ padding: '14px 14px' }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10 }}>Hook Script</div>
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>AI Generated · Question Hook</div>
            <div style={{ fontSize: 10, color: '#fff', lineHeight: 1.6 }}>
              &ldquo;Stop. You&apos;ve been posting at the wrong time — and I can prove it in 10 seconds...&rdquo;
            </div>
          </div>
          <div style={{ background: '#111', borderRadius: 12, padding: '8px 10px', marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Expected boost</div>
            <div style={{ fontFamily: 'Syne, system-ui', fontSize: 20, color: '#4ade80', fontWeight: 900 }}>+87% retention</div>
          </div>
          <div style={{ background: '#e8002d', borderRadius: 10, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>Copy Script</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function HomeContent() {
  useReveal();
  const [activeCard, setActiveCard] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setActiveCard(c => (c + 1) % HOOK_CARDS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const card = HOOK_CARDS[activeCard];
  const prev = HOOK_CARDS[(activeCard - 1 + HOOK_CARDS.length) % HOOK_CARDS.length];

  return (
    <div className="overflow-x-hidden">

      {/* ══ 1. HERO ══════════════════════════════════════════ */}
      <section style={{
        minHeight: '92vh',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(28px, 4vw, 48px)',
      }}>

        {/* Blob 1 – upper right – red/crimson */}
        <div style={{
          position: 'absolute', top: '-12%', right: '-8%',
          width: 'clamp(320px, 40vw, 520px)', height: 'clamp(320px, 40vw, 520px)',
          background: 'radial-gradient(circle at 40% 40%, #e8002d 0%, #ff4d6d 38%, #9b0020 70%, transparent 100%)',
          animation: 'blob-morph 14s ease-in-out infinite, blob-drift 20s ease-in-out infinite',
          opacity: 0.78, zIndex: 0,
        }} />

        {/* Blob 2 – lower left – deeper red */}
        <div style={{
          position: 'absolute', bottom: '0%', left: '-12%',
          width: 'clamp(360px, 45vw, 580px)', height: 'clamp(360px, 45vw, 580px)',
          background: 'radial-gradient(circle at 55% 55%, #7f0015 0%, #c0392b 40%, #e8002d 65%, transparent 100%)',
          animation: 'blob-morph 18s ease-in-out infinite 4s, blob-drift-2 24s ease-in-out infinite',
          opacity: 0.45, zIndex: 0,
        }} />

        {/* Top strip */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)' }}>
            Early Access
          </span>
          <Link href="/pro" style={{
            background: 'white', color: '#0a0a0a',
            padding: '8px 20px', borderRadius: 999,
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
          }}>
            Try Free →
          </Link>
        </div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'Syne, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(3.2rem, 11vw, 9.5rem)',
            lineHeight: 0.88,
            letterSpacing: '-0.03em',
            color: 'white',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            STOP THE<br />
            <span style={{ color: '#e8002d' }}>SCROLL.</span><br />
            HOOK THEM.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(13px, 1.5vw, 16px)', maxWidth: 420, lineHeight: 1.65 }}>
            Upload your Reel. AI finds the exact second viewers leave.
            Get a script that makes them stay.
          </p>
        </div>

        {/* Bottom strip */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/library" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'rgba(255,255,255,0.35)',
            textDecoration: 'none',
          }}>
            <ArrowDown size={13} /> Explore Further
          </Link>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>© HookedAI 2026</span>
        </div>
      </section>

      {/* ══ 2. FEATURE SECTIONS (01 / 02 / 03) ══════════════ */}
      {FEATURES.map(({ n, words, screen, desc, card: fc }) => (
        <section key={n} data-reveal style={{
          minHeight: '90vh',
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'clamp(20px, 4vw, 60px)',
          padding: 'clamp(40px, 6vw, 80px) clamp(28px, 5vw, 56px)',
        }}>
          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 340 }}>
            {/* Big faint number */}
            <div style={{
              fontFamily: 'Syne, system-ui', fontWeight: 900,
              fontSize: 'clamp(80px, 12vw, 140px)',
              lineHeight: 1, color: 'rgba(255,255,255,0.04)',
              letterSpacing: '-0.05em',
            }}>{n}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 240, lineHeight: 1.65 }}>{desc}</p>
              {/* Feature highlight card */}
              <div style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '14px 16px',
                width: 'fit-content',
              }}>
                <div style={{ fontSize: 12, color: '#e8002d', fontWeight: 700, marginBottom: 4 }}>{fc.top}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{fc.bot}</div>
              </div>
            </div>
          </div>

          {/* Center: phone */}
          <PhoneMockup screen={screen} />

          {/* Right: stacked bold words */}
          <div style={{ textAlign: 'right' }}>
            {words.map(w => (
              <div key={w} style={{
                fontFamily: 'Syne, system-ui', fontWeight: 900,
                fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
                color: 'white', lineHeight: 1,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
              }}>{w}</div>
            ))}
          </div>
        </section>
      ))}

      {/* ══ 3. EXPLORE HOOKS + CTA SPLIT ══════════════════ */}
      <section style={{ position: 'relative' }}>

        {/* Dark top */}
        <div style={{ background: '#0a0a0a', padding: 'clamp(48px, 7vw, 80px) clamp(28px, 5vw, 56px) 100px' }}>

          <h2 style={{
            fontFamily: 'Syne, system-ui', fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'white', textAlign: 'center',
            marginBottom: 56, letterSpacing: '-0.02em',
          }}>
            Explore Hooks
          </h2>

          {/* Stacked cards */}
          <div style={{ position: 'relative', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Card behind (previous) */}
            <div style={{
              position: 'absolute',
              width: 'clamp(240px, 35vw, 320px)', height: 240,
              background: prev.bg,
              borderRadius: 24,
              transform: 'rotate(-6deg) scale(0.9) translateY(16px)',
              opacity: 0.5,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }} />
            {/* Active card */}
            <div
              key={activeCard}
              style={{
                position: 'absolute',
                width: 'clamp(240px, 35vw, 320px)', height: 240,
                background: card.bg,
                borderRadius: 24,
                padding: '24px 22px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
                transform: 'rotate(-3deg)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                animation: 'card-in 0.45s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: card.accent }}>{card.type}</div>
              <div style={{ fontSize: 14, color: '#0a0a0a', lineHeight: 1.55, fontStyle: 'italic' }}>{card.hook}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#888' }}>Hook Score</span>
                <span style={{ fontFamily: 'Syne, system-ui', fontSize: 20, fontWeight: 900, color: card.accent }}>{card.score}</span>
              </div>
            </div>
          </div>

          {/* Counter */}
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 24, letterSpacing: '0.2em' }}>{card.n}</div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            {HOOK_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCard(i)}
                style={{
                  width: i === activeCard ? 22 : 7, height: 7,
                  borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === activeCard ? '#e8002d' : 'rgba(255,255,255,0.18)',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Light bottom – CTA */}
        <div style={{ background: '#f5f5f5', padding: 'clamp(44px, 6vw, 72px) clamp(28px, 5vw, 56px)', marginTop: -36 }}>
          <div style={{ maxWidth: 600 }}>
            <h2 style={{
              fontFamily: 'Syne, system-ui', fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              color: '#0a0a0a', lineHeight: 1.05,
              marginBottom: 36, letterSpacing: '-0.02em',
            }}>
              Never Lose Your<br />Viewers Again
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480, borderBottom: '1.5px solid #ccc', paddingBottom: 4 }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: 14, color: '#333', padding: '10px 0',
                  fontFamily: 'inherit',
                }}
              />
              <Link href="/pro" style={{
                background: '#0a0a0a', color: 'white',
                padding: '10px 22px', borderRadius: 999,
                fontSize: 12, fontWeight: 700, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                Try Free <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4. STATS ═══════════════════════════════════════ */}
      <section ref={statsRef} style={{ background: 'white', padding: 'clamp(56px, 8vw, 80px) clamp(28px, 5vw, 56px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {STATS.map(({ label, value, bars }) => (
            <div key={label} style={{
              background: '#f5f5f5', borderRadius: 20, padding: 'clamp(20px, 3vw, 28px)',
            }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', marginBottom: 8, lineHeight: 1.4 }}>{label}</div>
              <div style={{
                fontFamily: 'Syne, system-ui', fontWeight: 900,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1, color: '#0a0a0a',
              }}>{value}</div>
              <DotBar bars={bars} visible={statsVisible} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ 5. ABOUT TEXT ══════════════════════════════════ */}
      <section data-reveal style={{ background: '#0a0a0a', padding: 'clamp(56px, 8vw, 96px) clamp(28px, 5vw, 56px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: 28 }}>HookedAI</p>
          <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, fontWeight: 300 }}>
            Most creators lose their audience in the first 3 seconds without ever knowing why. HookedAI watches your video the way an algorithm does — spotting the exact frame where attention drops, matching it to hooks that retain, and giving you a script to fix it. No guesswork. No vanity metrics. Just the data that matters, and the words that work.
          </p>
        </div>
      </section>

      {/* ══ 6. FOOTER WITH GIANT TEXT ══════════════════════ */}
      <section style={{ background: 'white', padding: 'clamp(40px, 5vw, 56px) clamp(28px, 5vw, 56px) 0', overflow: 'hidden' }}>
        {/* Footer nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 28 }}>
            {(['/', '/library', '/pricing'] as const).map((href, i) => (
              <Link key={href} href={href} style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>
                {['Home', 'Library', 'Pricing'][i]}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/pricing" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Terms</Link>
          </div>
        </div>

        {/* Giant gradient text */}
        <div style={{ position: 'relative', lineHeight: 0 }}>
          {/* Blob behind letters */}
          <div style={{
            position: 'absolute', top: '10%', left: '20%',
            width: '60%', height: '80%',
            background: 'radial-gradient(ellipse at 40% 50%, #e8002d 0%, #ff6b6b 35%, #c0392b 65%, transparent 90%)',
            animation: 'blob-drift 18s ease-in-out infinite',
            opacity: 0.65,
            zIndex: 0,
            filter: 'blur(8px)',
          }} />
          <div style={{
            position: 'absolute', top: '30%', right: '10%',
            width: '35%', height: '60%',
            background: 'radial-gradient(ellipse at 60% 40%, #7f0015 0%, #e8002d 50%, transparent 85%)',
            animation: 'blob-drift-2 22s ease-in-out infinite 3s',
            opacity: 0.5,
            zIndex: 0,
            filter: 'blur(10px)',
          }} />

          <p style={{
            fontFamily: 'Syne, system-ui', fontWeight: 900,
            fontSize: 'clamp(5rem, 19vw, 17rem)',
            lineHeight: 0.82, letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #e8002d 0%, #ff4d6d 30%, #c0392b 55%, #e8002d 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative', zIndex: 1,
            userSelect: 'none',
          }}>
            HOOKEDAI
          </p>
        </div>
      </section>

    </div>
  );
}
