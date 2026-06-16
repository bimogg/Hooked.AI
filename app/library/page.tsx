import { supabaseAdmin as supabase, Hook } from '@/lib/supabase';
import LibraryContent from '@/components/LibraryContent';
import type { Post } from '@/components/CarouselCard';

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

async function getPosts(): Promise<Post[]> {
  try {
    const q = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(200);
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 5000));
    const result = await Promise.race([q, timeout]);
    if (result && 'data' in result && result.data) return result.data as Post[];
  } catch {}
  return [];
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  if (type === 'Posts') {
    const posts = await getPosts();
    return <LibraryContent hooks={[]} posts={posts} activeType={type} />;
  }
  const hooks = await getHooks(type);
  return <LibraryContent hooks={hooks} activeType={type} />;
}
