'use client';
import { Hook } from '@/lib/supabase';
import HookCard from './HookCard';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

const HOOK_TYPES = ['all', 'Hook Tutorial', 'Visual Hook', 'Question Hook', 'Tutorial Hook', 'Engagement Hook', 'Curiosity Hook', 'Warning Hook', 'Challenge Hook', 'Mistake Hook'];

export default function LibraryContent({ hooks, activeType }: { hooks: Hook[]; activeType?: string }) {
  const { lang } = useLang();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-3">Free · 1000+ hooks</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase leading-none">
          Hook<br />Library
        </h1>
        <p className="text-[#888] text-sm mt-4 max-w-md">
          {tr('library', 'subtitle', lang)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {HOOK_TYPES.map(t => (
          <a
            key={t}
            href={t === 'all' ? '/library' : `/library?type=${encodeURIComponent(t)}`}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize ${
              (activeType === t) || (!activeType && t === 'all')
                ? 'bg-black text-white border-black'
                : 'border-black/20 text-[#555] hover:border-black hover:text-black'
            }`}
          >
            {t}
          </a>
        ))}
      </div>

      <p className="text-xs text-[#888] mb-3">{hooks.length} hooks · {tr('library', 'sorted', lang)}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {hooks.map((h) => (
          <HookCard key={h.id} hook={h} />
        ))}
      </div>

      <div className="mt-16 border-t border-black/10 pt-10 text-center">
        <p className="text-[#888] text-sm">{tr('library', 'updated', lang)}</p>
      </div>
    </div>
  );
}
