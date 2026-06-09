import Link from 'next/link';
import { ArrowRight, Zap, BookOpen, BarChart2 } from 'lucide-react';

export const metadata = {
  title: 'HookedAI — Stop The Drop',
  description: 'AI hook analyzer for Instagram creators. Find winning hooks, decode why your Reels lose viewers.',
};

/* ── Linear design tokens (adapted) ── */
// canvas:    #010102
// surface-1: #0f1011
// surface-2: #141516
// hairline:  #23252a
// ink:       #f7f8f8
// ink-muted: #d0d6e0
// ink-subtle:#8a8f98
// accent:    #e8002d  (our red instead of Linear lavender)

const HOOKS = [
  { type: 'Visual Hook',    handle: '@slidergraph',          views: '3.5M', pct: '+78%' },
  { type: 'Question Hook',  handle: '@katrina_pahomova',     views: '2.1M', pct: '+91%' },
  { type: 'Tutorial Hook',  handle: '@marusya.naumenko',     views: '1.8M', pct: '+64%' },
  { type: 'Curiosity Hook', handle: '@yumerental',           views: '940K', pct: '+82%' },
  { type: 'Warning Hook',   handle: '@ugcbrookealicia',      views: '748K', pct: '+70%' },
  { type: 'Engage. Hook',   handle: '@barchevskaia.socials', views: '412K', pct: '+55%' },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Hook Library',
    tag: 'Free',
    desc: 'Browse viral hooks from top creators, sorted by real views data. Filter by type and niche.',
    href: '/library',
  },
  {
    icon: Zap,
    title: 'AI Hook Analyzer',
    tag: 'Pro',
    desc: 'Enter your Instagram username — AI writes a custom hook script per Reel. Type, placement, copy-ready.',
    href: '/pro',
  },
  {
    icon: BarChart2,
    title: 'Competitor Analysis',
    tag: 'Soon',
    desc: 'Analyze any public account. See exactly what hooks your competitors use and why they perform.',
    href: '/pricing',
  },
];

const TESTIMONIALS = [
  {
    quote: "It's much harder to figure out why views suddenly drop — I try everything but nothing usually works such as timing, content, aesthetic, following trends.",
    handle: 'Instagram creator',
    followers: '85K followers',
  },
  {
    quote: "The hook just wasn't strong enough. It didn't grab attention within the first few seconds. I think a video's gonna do great and it doesn't — and sometimes I'm wrong the other way.",
    handle: 'SMM Manager',
    followers: 'Social media professional',
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#010102', color: '#f7f8f8' }} className="min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">

        {/* eyebrow */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e8002d]" />
          <span style={{ color: '#8a8f98', fontSize: 13, letterSpacing: '0.4px', fontWeight: 500 }}>
            Early Access — Free Pro Trial
          </span>
        </div>

        {/* headline */}
        <h1
          className="font-display font-semibold uppercase"
          style={{ fontSize: 'clamp(48px,8vw,80px)', lineHeight: 1.05, letterSpacing: '-3px', maxWidth: 900 }}>
          Stop losing viewers<br />
          in{' '}
          <span style={{ color: '#e8002d' }}>3 seconds.</span>
        </h1>

        <p style={{ color: '#d0d6e0', fontSize: 18, lineHeight: 1.5, letterSpacing: '-0.1px', marginTop: 24, maxWidth: 520 }}>
          HookedAI analyzes your Instagram Reels and writes the exact hook that makes people stay — right type, right placement, copy-ready.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-10">
          <Link href="/pro" style={{
            background: '#e8002d', color: '#fff',
            fontWeight: 500, fontSize: 14, padding: '8px 16px',
            borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6,
            textDecoration: 'none',
          }}>
            Analyze My Reels <ArrowRight size={14} />
          </Link>
          <Link href="/library" style={{
            background: '#0f1011', color: '#f7f8f8',
            fontWeight: 500, fontSize: 14, padding: '8px 14px',
            borderRadius: 8, border: '1px solid #23252a', display: 'inline-flex',
            alignItems: 'center', gap: 6, textDecoration: 'none',
          }}>
            Hook Library
          </Link>
        </div>

        <p style={{ color: '#8a8f98', fontSize: 12, marginTop: 14 }}>
          No credit card · No Instagram login required · Public accounts only
        </p>
      </section>

      {/* ── PRODUCT UI MOCKUP ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div style={{
          background: '#0f1011', border: '1px solid #23252a',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {/* browser chrome */}
          <div style={{
            background: '#141516', borderBottom: '1px solid #23252a',
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8002d' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <div style={{
              flex: 1, marginLeft: 12, background: '#0f1011', border: '1px solid #23252a',
              borderRadius: 4, padding: '3px 10px', fontSize: 11, color: '#8a8f98',
            }}>
              hooked-ai-seven.vercel.app/library
            </div>
          </div>

          {/* app content */}
          <div style={{ padding: 20 }}>
            {/* filter row */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['All', 'Visual Hook', 'Question Hook', 'Tutorial Hook', 'Warning Hook'].map((t, i) => (
                <span key={t} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 9999,
                  border: `1px solid ${i === 0 ? '#e8002d' : '#23252a'}`,
                  color: i === 0 ? '#e8002d' : '#8a8f98', fontWeight: 500,
                }}>
                  {t}
                </span>
              ))}
            </div>

            {/* hook cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
              {HOOKS.map(({ type, handle, views, pct }) => (
                <div key={handle} style={{
                  background: '#141516', border: '1px solid #23252a',
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  {/* thumbnail */}
                  <div style={{ aspectRatio: '9/14', background: '#18191a', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', bottom: 6, left: 6,
                      background: '#e8002d', color: '#fff',
                      fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3,
                      textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}>
                      {pct}
                    </div>
                  </div>
                  <div style={{ padding: '8px 8px 10px' }}>
                    <div style={{ fontSize: 8, color: '#e8002d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{type}</div>
                    <div style={{ fontSize: 9, color: '#8a8f98' }}>{handle}</div>
                    <div style={{ fontSize: 10, color: '#d0d6e0', fontWeight: 600, marginTop: 2 }}>{views}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div style={{ borderTop: '1px solid #23252a', paddingTop: 64 }}>
          <p style={{ color: '#8a8f98', fontSize: 13, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 12 }}>
            Everything you need
          </p>
          <h2 className="font-display font-semibold" style={{ fontSize: 40, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 48 }}>
            Two tools. One mission.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {FEATURES.map(({ icon: Icon, title, tag, desc, href }) => (
              <Link key={title} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#0f1011', border: '1px solid #23252a',
                  borderRadius: 12, padding: 24, height: '100%',
                  display: 'flex', flexDirection: 'column', gap: 16,
                  transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#34343a')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#23252a')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Icon size={18} color="#8a8f98" />
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                      background: tag === 'Free' ? '#0f1011' : tag === 'Pro' ? '#e8002d' : '#0f1011',
                      color: tag === 'Free' ? '#8a8f98' : tag === 'Pro' ? '#fff' : '#8a8f98',
                      border: `1px solid ${tag === 'Free' ? '#34343a' : tag === 'Pro' ? 'transparent' : '#34343a'}`,
                      textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}>
                      {tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold" style={{ fontSize: 22, lineHeight: 1.25, letterSpacing: '-0.4px', color: '#f7f8f8', marginBottom: 8 }}>
                      {title}
                    </h3>
                    <p style={{ color: '#8a8f98', fontSize: 14, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                  <div style={{ marginTop: 'auto', color: '#e8002d', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Learn more <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div style={{ borderTop: '1px solid #23252a', paddingTop: 64 }}>
          <p style={{ color: '#8a8f98', fontSize: 13, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 12 }}>
            Real creator feedback
          </p>
          <h2 className="font-display font-semibold" style={{ fontSize: 40, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 48 }}>
            The pain is real.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {TESTIMONIALS.map(({ quote, handle, followers }) => (
              <div key={handle} style={{
                background: '#0f1011', border: '1px solid #23252a',
                borderRadius: 12, padding: 32,
              }}>
                <p style={{ color: '#d0d6e0', fontSize: 18, lineHeight: 1.5, letterSpacing: '-0.1px', fontStyle: 'italic', marginBottom: 24 }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#23252a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#8a8f98', fontWeight: 600 }}>
                    {handle[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#f7f8f8' }}>{handle}</p>
                    <p style={{ fontSize: 12, color: '#8a8f98' }}>{followers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div style={{
          background: '#0f1011', border: '1px solid #23252a',
          borderRadius: 12, padding: '48px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32,
          flexWrap: 'wrap',
        }}>
          <div>
            <h2 className="font-display font-semibold" style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.6px', marginBottom: 8 }}>
              Start for free. Stop the drop.
            </h2>
            <p style={{ color: '#8a8f98', fontSize: 14 }}>
              No credit card. No login. Just enter your username.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/library" style={{
              background: '#141516', color: '#f7f8f8',
              fontWeight: 500, fontSize: 14, padding: '8px 14px',
              borderRadius: 8, border: '1px solid #23252a', textDecoration: 'none',
            }}>
              Hook Library
            </Link>
            <Link href="/pro" style={{
              background: '#e8002d', color: '#fff',
              fontWeight: 500, fontSize: 14, padding: '8px 16px',
              borderRadius: 8, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Analyze My Reels <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
