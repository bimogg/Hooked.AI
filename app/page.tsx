import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export const metadata = {
  title: 'HookedAI — Stop The Drop',
  description: 'AI hook analyzer for Instagram creators. Find winning hooks, decode why your Reels lose viewers.',
};

const CREATORS = [
  { handle: '@slidergraph',          niche: 'Photography',   views: '3.5M views' },
  { handle: '@katrina_pahomova',     niche: 'Lifestyle',     views: '2.1M views' },
  { handle: '@marusya.naumenko',     niche: 'Education',     views: '1.8M views' },
  { handle: '@yumerental',           niche: 'Real Estate',   views: '940K views' },
  { handle: '@ugcbrookealicia',      niche: 'UGC',           views: '748K views' },
];

const LOGOS = [
  '@slidergraph', '@katrina_pahomova', '@marusya.naumenko',
  '@yumerental', '@ugcbrookealicia', '@barchevskaia.socials',
  '@slidergraph', '@katrina_pahomova', '@marusya.naumenko',
];

const CASES = [
  {
    handle: '@ugcbrookealicia',
    quote: '"What we were missing is, what was the hook thinking? That\'s where HookedAI comes in."',
    title: null,
  },
  {
    handle: null,
    quote: null,
    title: 'How a lifestyle creator grew from 40K to 200K using AI hook scripts',
  },
  {
    handle: '@katrina_pahomova',
    quote: '"I used to guess what hook to use. Now I know exactly what to put in the first 3 seconds."',
    title: null,
  },
  {
    handle: null,
    quote: null,
    title: 'Why question hooks outperform visual hooks by 45% in the education niche',
  },
];

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">

      {/* ── HERO ── */}
      <section className="px-6 md:px-10 pt-16 pb-10 max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[#555] font-bold mb-8">Trusted by growing creators</p>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.0] max-w-4xl">
          The hook that stops<br />
          the scroll.{' '}
          <span className="text-[#555]">
            Across every niche and every platform.
          </span>
        </h1>
      </section>

      {/* ── HORIZONTAL CREATOR CARDS ── */}
      <section className="px-6 md:px-10 pb-12 max-w-7xl mx-auto">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {CREATORS.map(({ handle, niche, views }) => (
            <div key={handle}
              className="flex-shrink-0 w-52 border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              {/* thumbnail placeholder */}
              <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5 relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#e8002d] transition-colors">
                  <Play size={14} className="text-white ml-0.5" />
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {niche}
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold text-white/90">{handle}</p>
                <p className="text-[10px] text-[#555] mt-0.5">{views}</p>
                <Link href="/library" className="text-[10px] text-[#e8002d] mt-1.5 inline-block hover:underline">
                  See hook →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOGOS TICKER ── */}
      <section className="border-y border-white/10 py-4 overflow-hidden">
        <div className="flex gap-12 animate-none whitespace-nowrap px-10">
          {LOGOS.map((l, i) => (
            <span key={i} className="text-xs text-[#444] font-medium uppercase tracking-widest shrink-0">
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-6">Why HookedAI</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl leading-tight max-w-3xl">
          These creators post to millions of viewers every day.{' '}
          <span className="text-[#e8002d]">
            See how they hook, retain, and grow with HookedAI.
          </span>
        </h2>
      </section>

      {/* ── CASE STUDIES GRID ── */}
      <section className="px-6 md:px-10 pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CASES.map((c, i) => (
            <div key={i}
              className="border border-white/10 rounded-2xl p-7 flex flex-col justify-between gap-6 min-h-[220px] hover:border-white/20 transition-colors">
              {c.quote ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {c.handle?.[1]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white/80 leading-relaxed italic">{c.quote}</p>
                    <p className="text-xs text-[#555] mt-3">{c.handle}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-[#e8002d]/20 flex items-center justify-center">
                    <span className="text-[#e8002d] text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{c.title}</h3>
                    <Link href="/library"
                      className="inline-flex items-center gap-1.5 text-[#e8002d] text-xs font-bold mt-4 hover:gap-3 transition-all">
                      Read story <ArrowRight size={12} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="border-t border-white/10 px-6 md:px-10 py-20 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl uppercase">
            Start for free.<br />
            <span className="text-[#e8002d]">Stop the drop.</span>
          </h2>
          <p className="text-[#555] text-sm mt-3 max-w-md">
            No credit card. No Instagram login required. Just enter your username and get your hook analysis in 60 seconds.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/library"
            className="border border-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-full hover:border-white/50 transition-colors whitespace-nowrap">
            Hook Library
          </Link>
          <Link href="/pro"
            className="bg-[#e8002d] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2">
            Analyze My Reels <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
