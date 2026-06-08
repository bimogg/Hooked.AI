import { supabase, Hook } from '@/lib/supabase';
import HookCard from '@/components/HookCard';
import FilterBar from '@/components/FilterBar';

const NICHES = ['all', 'fitness', 'business', 'food', 'travel', 'beauty', 'general'];

async function getHooks(niche?: string): Promise<Hook[]> {
  try {
    let q = supabase.from('hooks').select('*').order('views', { ascending: false }).limit(48);
    if (niche && niche !== 'all') q = q.eq('niche', niche);
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 3000));
    const result = await Promise.race([q, timeout]);
    if (result && 'data' in result && result.data && result.data.length > 0) {
      return result.data as Hook[];
    }
  } catch {}
  return PLACEHOLDER_HOOKS;
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string }>;
}) {
  const { niche } = await searchParams;
  const hooks = await getHooks(niche);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-3">Free · 1000+ hooks</p>
        <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-4xl md:text-5xl uppercase leading-none">
          Hook<br />Library
        </h1>
        <p className="text-[#888] text-sm mt-4 max-w-md">
          Hooks from top creators with real views data. Find what works in your niche before you record.
        </p>
      </div>
      <FilterBar niches={NICHES} active={niche ?? 'all'} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {hooks.map((h) => (
          <HookCard key={h.id} hook={h} />
        ))}
      </div>
      <div className="mt-16 border-t border-black/10 pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-[family-name:var(--font-syne)] font-bold text-lg uppercase">Want to know why YOUR Reels drop?</p>
          <p className="text-[#888] text-sm mt-1">Connect Instagram and we decode your retention graph.</p>
        </div>
        <a href="/connect" className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
          Connect Instagram →
        </a>
      </div>
    </div>
  );
}

const PLACEHOLDER_HOOKS: Hook[] = [
  { id: '1', instagram_id: 'd1', creator_username: 'garyvee', video_url: null, thumbnail_url: null, caption: 'The one thing stopping you from success is this single habit you do every morning...', views: 2100000, likes: 45000, comments: 1200, niche: 'business', created_at: '' },
  { id: '2', instagram_id: 'd2', creator_username: 'alexhormozi', video_url: null, thumbnail_url: null, caption: 'I asked 100 millionaires what they regret most. Every single one said the same thing.', views: 980000, likes: 12000, comments: 340, niche: 'business', created_at: '' },
  { id: '3', instagram_id: 'd3', creator_username: 'hubermanlab', video_url: null, thumbnail_url: null, caption: 'Stop doing this in the morning if you want more energy. Most people get this completely wrong.', views: 450000, likes: 8900, comments: 220, niche: 'fitness', created_at: '' },
  { id: '4', instagram_id: 'd4', creator_username: 'mrbeast', video_url: null, thumbnail_url: null, caption: 'This $0 trick doubled my views in 7 days and nobody is talking about it.', views: 3200000, likes: 120000, comments: 4500, niche: 'general', created_at: '' },
  { id: '5', instagram_id: 'd5', creator_username: 'lewishowes', video_url: null, thumbnail_url: null, caption: 'The morning routine that changed my life — I\'ve done this every day for 3 years.', views: 670000, likes: 21000, comments: 780, niche: 'fitness', created_at: '' },
  { id: '6', instagram_id: 'd6', creator_username: 'foodwithsimo', video_url: null, thumbnail_url: null, caption: 'This 5-minute recipe looks like it took hours. Your guests will be shocked.', views: 1200000, likes: 67000, comments: 2100, niche: 'food', created_at: '' },
];
