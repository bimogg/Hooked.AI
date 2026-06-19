'use client';
import VideoAnalyzer from '@/components/VideoAnalyzer';
import { useLang } from '@/components/LanguageProvider';
import { tr } from '@/lib/translations';

export default function ProPage() {
  const { lang } = useLang();
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
          AI Hook<br />Analyzer
        </h1>
        <p className="text-[#666] text-base md:text-lg mt-3 max-w-md leading-relaxed"
           style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300, letterSpacing: '-0.01em' }}>
          {tr('pro', 'desc', lang)}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm text-[#888]" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300 }}>{tr('pro', 'freeBadge', lang)}</span>
        </div>
      </div>
      <VideoAnalyzer />
    </div>
  );
}
