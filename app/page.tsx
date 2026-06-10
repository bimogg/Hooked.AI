import Link from 'next/link';
import { ArrowRight, Zap, BarChart2, BookOpen, Lock } from 'lucide-react';

export const metadata = {
  title: 'HookedAI — Stop The Drop',
  description: 'AI hook analyzer for Instagram creators. Find winning hooks, decode why your Reels lose viewers.',
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#e8002d] rounded-full animate-pulse" />
          Early Access — Free Pro Trial
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight">
          Stop<br />
          <span className="text-[#e8002d]">The</span><br />
          Drop
        </h1>

        <p className="text-[#666] text-base md:text-lg max-w-lg leading-relaxed">
          Your Reels lose 80% of viewers in the first 3 seconds.
          HookedAI finds the exact hook that makes them stay.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/pro"
            className="bg-[#e8002d] text-white font-bold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
            Analyze My Reels <ArrowRight size={16} />
          </Link>
          <Link href="/library"
            className="border border-black/20 text-black font-bold text-sm px-8 py-4 rounded-full hover:border-black transition-colors">
            Browse Hook Library
          </Link>
        </div>

        <p className="text-xs text-[#bbb]">Free to start · No credit card · Works with public accounts</p>
      </section>

      {/* PROBLEM */}
      <section className="bg-[#0a0a0a] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-4">The Problem</p>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight mb-6">
            You tried everything.<br />Views still drop.
          </h2>
          <p className="text-[#888] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            You post consistently. You follow trends. You copy what works for others.
            But your Reels still lose viewers after 2 seconds — and nobody tells you why.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { stat: '80%', label: 'of viewers leave in the first 3 seconds' },
              { stat: '3 sec', label: 'is all you have to hook someone in' },
              { stat: '0', label: 'tools that tell you exactly what hook to use' },
            ].map(({ stat, label }) => (
              <div key={stat} className="border border-white/10 rounded-2xl p-6">
                <p className="font-display font-extrabold text-4xl text-[#e8002d]">{stat}</p>
                <p className="text-[#888] text-sm mt-2 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-4 text-center">What You Get</p>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight text-center mb-14">
            Two tools.<br />One mission.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Hook Library */}
            <div className="border border-black/10 rounded-3xl p-8 flex flex-col gap-4 hover:border-black/25 transition-colors">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-1">Free</p>
                <h3 className="font-display font-extrabold text-2xl uppercase">Hook Library</h3>
              </div>
              <p className="text-[#666] text-sm leading-relaxed">
                15+ viral hooks from top creators with real views data. Filter by type — Visual, Question, Warning, Tutorial and more. See what actually works before you record.
              </p>
              <Link href="/library"
                className="mt-auto inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                Browse Library <ArrowRight size={14} />
              </Link>
            </div>

            {/* Pro Analyzer */}
            <div className="border border-[#e8002d] rounded-3xl p-8 flex flex-col gap-4 bg-[#fff8f8]">
              <div className="w-10 h-10 bg-[#e8002d] rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#e8002d] font-bold mb-1">Pro</p>
                <h3 className="font-display font-extrabold text-2xl uppercase">AI Hook Analyzer</h3>
              </div>
              <p className="text-[#666] text-sm leading-relaxed">
                Upload your Reel — AI analyzes the entire video, finds every weak hook moment, and writes custom scripts for opening, mid-video, and loop hooks. Ready to copy.
              </p>
              <Link href="/pro"
                className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#e8002d] hover:gap-3 transition-all">
                Try for Free <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#f7f7f7] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-4 text-center">How It Works</p>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl uppercase leading-tight text-center mb-14">
            3 steps.<br />Better hooks.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Upload your Reel', desc: 'Drop any MP4 or MOV. No account needed, works instantly.' },
              { n: '02', title: 'AI reads the whole video', desc: 'Claude analyzes frames across the entire video — opening, middle, and loop hook.' },
              { n: '03', title: 'Get hook scripts', desc: 'Custom scripts for each weak moment — type, placement, copy-ready.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col gap-3">
                <span className="font-display font-extrabold text-5xl text-black/10">{n}</span>
                <h3 className="font-display font-bold text-lg uppercase">{title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
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
            Your analysis.<br />Only yours.
          </h2>
          <p className="text-[#888] text-sm leading-relaxed max-w-md">
            Results are private and saved to your browser. No account needed. Just upload your video and get your confidential hook analysis.
          </p>
          <Link href="/pro"
            className="bg-[#e8002d] text-white font-bold text-sm px-10 py-4 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
            Analyze My Reels Free <ArrowRight size={16} />
          </Link>
          <Link href="/pricing" className="text-xs text-[#aaa] hover:text-black transition-colors">
            See pricing plans →
          </Link>
        </div>
      </section>

    </div>
  );
}
