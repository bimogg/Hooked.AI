'use client';
import { Hook } from '@/lib/supabase';
import HookCard from './HookCard';
import CarouselCard, { Post } from './CarouselCard';
import { useLang } from './LanguageProvider';
import { tr } from '@/lib/translations';

const HOOK_TYPES = ['all', 'Reels', 'Posts', 'Inserts', 'Hook Tutorial', 'Visual Hook', 'Question Hook', 'Tutorial Hook', 'Engagement Hook', 'Curiosity Hook', 'Warning Hook', 'Challenge Hook', 'Mistake Hook'];

const FILTER_KEY: Record<string, string> = {
  'all': 'fAll', 'Reels': 'fReels', 'Posts': 'fPosts', 'Inserts': 'fInserts',
  'Hook Tutorial': 'fHookTutorial', 'Visual Hook': 'fVisual', 'Question Hook': 'fQuestion',
  'Tutorial Hook': 'fTutorial', 'Engagement Hook': 'fEngagement', 'Curiosity Hook': 'fCuriosity',
  'Warning Hook': 'fWarning', 'Challenge Hook': 'fChallenge', 'Mistake Hook': 'fMistake',
};

export default function LibraryContent({ hooks, posts = [], activeType }: { hooks: Hook[]; posts?: Post[]; activeType?: string }) {
  const { lang } = useLang();
  const total = hooks.length + posts.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-3">{tr('library', 'freeBadge', lang)}</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase leading-none">
          {tr('library', 'titleLine1', lang)}<br />{tr('library', 'titleLine2', lang)}
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
            {tr('library', FILTER_KEY[t], lang)}
          </a>
        ))}
      </div>

      <p className="text-xs text-[#888] mb-3">{total} {total === 1 ? tr('library', 'result', lang) : tr('library', 'results', lang)} · {tr('library', 'sorted', lang)}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {posts.map((p) => <CarouselCard key={`p-${p.id}`} post={p} />)}
        {hooks.map((h) => <HookCard key={`h-${h.id}`} hook={h} />)}
      </div>

      <div className="mt-16 border-t border-black/10 pt-10 text-center">
        <p className="text-[#888] text-sm">{tr('library', 'updated', lang)}</p>
      </div>
    </div>
  );
}
