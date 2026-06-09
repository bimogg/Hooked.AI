import { cookies } from 'next/headers';
import Link from 'next/link';
import { getUserMedia, getMediaInsights } from '@/lib/instagram';
import { findDropPoints } from '@/lib/analyze';
import RetentionChart from '@/components/RetentionChart';
import AnalyzeButton from '@/components/AnalyzeButton';

async function getToken(_igUserId: string): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const store = await cookies();
  return store.get('ig_token')?.value ?? null;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const igUserId = cookieStore.get('ig_user_id')?.value;

  if (!igUserId) {
    return <NotConnected />;
  }

  const token = await getToken(igUserId);
  if (!token) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <p className="text-[#888] text-sm">
          Session expired.{' '}
          <Link href="/connect" className="text-[#e8002d] underline">Reconnect Instagram</Link>
        </p>
      </div>
    );
  }

  let reels: ReelItem[] = [];
  let fetchError = false;

  try {
    const mediaRes = await getUserMedia(token);
    if (mediaRes.data) {
      const videos = mediaRes.data.filter((r: RawReel) => r.media_type === 'VIDEO').slice(0, 9);
      reels = await Promise.all(
        videos.map(async (r: RawReel) => {
          try {
            const ins = await getMediaInsights(token, r.id);
            return { ...r, insights: ins.data ?? [] };
          } catch {
            return { ...r, insights: [] };
          }
        })
      );
    }
  } catch {
    fetchError = true;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-10 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-1">Pro · Connected</p>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase">
            Your Reels
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AnalyzeButton />
          <Link href="/connect" className="text-xs text-[#888] hover:text-black transition-colors">
            Reconnect
          </Link>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-sm text-red-700">
          Could not fetch Reels insights. Make sure it&apos;s a Business or Creator account.
          App Review may still be pending for insights access.
        </div>
      )}

      {reels.length === 0 && !fetchError ? (
        <div className="text-center py-20 text-[#888] text-sm">
          No video Reels found on this account.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reels.map((reel) => <ReelCard key={reel.id} reel={reel} />)}
        </div>
      )}

      {(fetchError || reels.length === 0) && <DemoSection />}
    </div>
  );
}

type RawReel = { id: string; caption?: string; media_type: string; timestamp: string; like_count: number; comments_count: number };
type InsightMetric = { name: string; values?: { value: number }[] };
type ReelItem = RawReel & { insights: InsightMetric[] };

function getMetric(insights: InsightMetric[], name: string): number {
  return insights.find((i) => i.name === name)?.values?.[0]?.value ?? 0;
}

function ReelCard({ reel }: { reel: ReelItem }) {
  const views = getMetric(reel.insights, 'video_views');
  const reach = getMetric(reel.insights, 'reach');
  const avgWatch = getMetric(reel.insights, 'avg_watch_time');
  const completion = getMetric(reel.insights, 'completion_rate');

  const retentionData = buildCurve(avgWatch, completion);
  const drops = findDropPoints(retentionData);
  const worstDrop = drops.sort((a, b) => b.drop_pct - a.drop_pct)[0];

  return (
    <div className="bg-[#f5f5f5] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
        {reel.caption ?? 'No caption'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Views', value: fmt(views) },
          { label: 'Reach', value: fmt(reach) },
          { label: 'Avg watch', value: avgWatch ? `${avgWatch}s` : '—' },
          { label: 'Completion', value: completion ? `${(completion * 100).toFixed(0)}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-[#888]">{label}</p>
            <p className="font-bold text-lg tabular-nums leading-tight">{value}</p>
          </div>
        ))}
      </div>
      {retentionData.length > 1 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#888] mb-2">Retention</p>
          <RetentionChart data={retentionData} />
          {worstDrop && (
            <p className="text-xs text-[#e8002d] mt-1.5">
              −{worstDrop.drop_pct}% drop at {worstDrop.second}s
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function buildCurve(avgWatchSec: number, completionRate: number) {
  if (!avgWatchSec && !completionRate) return [];
  const duration = avgWatchSec > 0 ? Math.round(avgWatchSec / Math.max(completionRate, 0.01)) : 30;
  const steps = 10;
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const second = Math.round(t * duration);
    const retention = Math.exp(-2.5 * t) * (1 - completionRate) + completionRate;
    return { second, viewers: Math.round(retention * 1000) };
  });
}

function DemoSection() {
  const demo = [
    { second: 0, viewers: 1000 },
    { second: 1, viewers: 960 },
    { second: 2, viewers: 560 },
    { second: 4, viewers: 490 },
    { second: 6, viewers: 440 },
    { second: 10, viewers: 400 },
    { second: 15, viewers: 360 },
    { second: 20, viewers: 330 },
    { second: 25, viewers: 310 },
    { second: 30, viewers: 290 },
  ];
  return (
    <div className="mt-10 bg-[#0a0a0a] text-white rounded-2xl p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Demo</p>
      <p className="font-display font-bold text-2xl uppercase mb-1">
        Drop at 0:02s
      </p>
      <p className="text-[#e8002d] text-sm mb-5">−44% viewers lost at second 2</p>
      <RetentionChart data={demo} dark />
      <div className="mt-5 border border-[#e8002d]/25 rounded-xl p-4 space-y-2">
        <p className="text-[10px] text-[#e8002d] uppercase tracking-wider mb-3">
          HookedAI · AI Recommendations
        </p>
        {[
          'Open mid-action — skip the intro, start at the moment of highest tension.',
          'Add a bold text overlay at frame 0 teasing the payoff before it happens.',
          'Cut to your face reacting in the first second — emotional hook before content.',
        ].map((rec, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-[#e8002d] font-black text-sm shrink-0">{i + 1}.</span>
            <p className="text-white/75 text-sm leading-snug">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotConnected() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-4">Pro feature</p>
      <h1 className="font-display font-extrabold text-3xl uppercase mb-4">
        Dashboard
      </h1>
      <p className="text-[#888] text-sm mb-8">
        Connect your Instagram to see your retention analysis and AI hook recommendations.
      </p>
      <Link
        href="/connect"
        className="bg-[#e8002d] text-white font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
      >
        Connect Instagram →
      </Link>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n ? String(n) : '—';
}
