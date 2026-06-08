const APP_ID = process.env.INSTAGRAM_APP_ID ?? '1620617545694436';
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'instagram_basic,instagram_manage_insights,pages_read_engagement',
    response_type: 'code',
  });
  return `https://api.instagram.com/oauth/authorize?${params}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });
  return res.json() as Promise<{ access_token: string; user_id: number }>;
}

export async function getLongLivedToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: APP_SECRET,
    access_token: shortToken,
  });
  const res = await fetch(`https://graph.instagram.com/access_token?${params}`);
  return res.json() as Promise<{ access_token: string; token_type: string; expires_in: number }>;
}

export async function getUserReels(token: string, userId: string) {
  const fields = 'id,caption,media_type,thumbnail_url,timestamp,like_count,comments_count';
  const res = await fetch(
    `https://graph.instagram.com/${userId}/media?fields=${fields}&access_token=${token}`
  );
  return res.json();
}

export async function getReelInsights(token: string, mediaId: string) {
  const metrics = 'reach,impressions,video_views,avg_watch_time,completion_rate';
  const res = await fetch(
    `https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&access_token=${token}`
  );
  return res.json();
}
