import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getReelInsights, getUserReels } from '@/lib/instagram';
import { findDropPoints, getAIRecommendations } from '@/lib/analyze';

export async function POST(req: NextRequest) {
  const igUserId = req.cookies.get('ig_user_id')?.value;
  if (!igUserId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: account } = await supabase
    .from('instagram_accounts')
    .select('access_token')
    .eq('instagram_user_id', igUserId)
    .single();

  if (!account?.access_token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 401 });
  }

  const token = account.access_token;

  // Fetch reels and insights
  const mediaRes = await getUserReels(token, igUserId);
  if (!mediaRes.data) return NextResponse.json({ error: 'No media found' }, { status: 404 });

  const reels = mediaRes.data.filter((r: { media_type: string }) => r.media_type === 'VIDEO').slice(0, 9);

  // Fetch top hooks from our library for context
  const { data: topHooks } = await supabase
    .from('hooks')
    .select('caption')
    .order('views', { ascending: false })
    .limit(10);

  const hookTexts = (topHooks ?? []).map((h: { caption: string }) => h.caption).filter(Boolean);

  const results = await Promise.all(
    reels.map(async (reel: { id: string; caption?: string }) => {
      const insightsRes = await getReelInsights(token, reel.id);
      const metrics = insightsRes.data ?? [];

      const avgWatchTime = metrics.find((m: { name: string }) => m.name === 'avg_watch_time')?.values?.[0]?.value ?? 0;
      const completionRate = metrics.find((m: { name: string }) => m.name === 'completion_rate')?.values?.[0]?.value ?? 0;

      // Build synthetic retention curve from avg_watch_time + completion_rate
      const retentionData = buildRetentionCurve(avgWatchTime, completionRate);
      const dropPoints = findDropPoints(retentionData);
      const recommendations = await getAIRecommendations(dropPoints, hookTexts);

      // Cache in Supabase
      await supabase.from('user_reels').upsert({
        instagram_user_id: igUserId,
        reel_id: reel.id,
        caption: reel.caption,
        avg_watch_time: avgWatchTime,
        completion_rate: completionRate,
        retention_data: retentionData,
        drop_points: dropPoints,
        recommendations,
        analyzed_at: new Date().toISOString(),
      }, { onConflict: 'instagram_user_id,reel_id' });

      return { reel_id: reel.id, drop_points: dropPoints, recommendations };
    })
  );

  return NextResponse.json({ results });
}

function buildRetentionCurve(avgWatchSec: number, completionRate: number) {
  // Estimate a 30-second reel retention curve
  const duration = avgWatchSec > 0 ? Math.round(avgWatchSec / Math.max(completionRate, 0.01)) : 30;
  const steps = 12;
  return Array.from({ length: steps }, (_, i) => {
    const second = Math.round((i / (steps - 1)) * duration);
    // Exponential decay model: heavier drop early, then plateau
    const t = i / (steps - 1);
    const retention = Math.exp(-2.5 * t) * (1 - completionRate) + completionRate;
    return { second, viewers: Math.round(retention * 1000) };
  });
}
