import { supabaseAdmin as supabase, Hook } from '@/lib/supabase';
import HookCard from '@/components/HookCard';

const HOOK_TYPES = ['all', 'Hook Tutorial', 'Visual Hook', 'Question Hook', 'Tutorial Hook', 'Engagement Hook', 'Curiosity Hook', 'Warning Hook', 'Challenge Hook', 'Mistake Hook'];

async function getHooks(type?: string): Promise<Hook[]> {
  try {
    let q = supabase
      .from('hooks')
      .select('*')
      .not('caption', 'is', null)
      .neq('caption', '')
      .order('views', { ascending: false })
      .limit(200);
    if (type && type !== 'all') q = q.eq('niche', type);
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 5000));
    const result = await Promise.race([q, timeout]);
    if (result && 'data' in result && result.data && result.data.length > 0) {
      const hooks = result.data as Hook[];
      const seen = new Map<string, number>();
      return hooks.filter(h => {
        const c = seen.get(h.creator_username) ?? 0;
        if (c >= 2) return false;
        seen.set(h.creator_username, c + 1);
        return true;
      });
    }
  } catch {}
  return [];
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const hooks = await getHooks(type);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-3">Free · 1000+ hooks</p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase leading-none">
          Hook<br />Library
        </h1>
        <p className="text-[#888] text-sm mt-4 max-w-md">
          Hooks from top creators with real views data. Find what works before you record.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {HOOK_TYPES.map(t => (
          <a
            key={t}
            href={t === 'all' ? '/library' : `/library?type=${encodeURIComponent(t)}`}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors capitalize ${
              (type === t) || (!type && t === 'all')
                ? 'bg-black text-white border-black'
                : 'border-black/20 text-[#555] hover:border-black hover:text-black'
            }`}
          >
            {t}
          </a>
        ))}
      </div>

      <p className="text-xs text-[#888] mb-3">{hooks.length} hooks · sorted by views</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {hooks.map((h) => (
          <HookCard key={h.id} hook={h} />
        ))}
      </div>

      <div className="mt-16 border-t border-black/10 pt-10 text-center">
        <p className="text-[#888] text-sm">New hooks are added regularly. Check back often.</p>
      </div>
    </div>
  );
}
