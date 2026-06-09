const APP_ID = process.env.INSTAGRAM_APP_ID ?? '1620617545694436';
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hooked-ai-seven.vercel.app';
export const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'public_profile,email',
    response_type: 'code',
  });
  return `https://www.facebook.com/dialog/oauth?${params}`;
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
  return res.json() as Promise<{ access_token: string; user_id: string; error_message?: string }>;
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

export async function getMe(token: string) {
  const res = await fetch(
    `https://graph.instagram.com/v22.0/me?fields=id,username,profile_picture_url&access_token=${token}`
  );
  return res.json() as Promise<{ id: string; username: string; profile_picture_url?: string }>;
}

export async function getUserMedia(token: string) {
  const fields = 'id,caption,media_type,thumbnail_url,timestamp,like_count,comments_count,media_url,permalink,video_views';
  const res = await fetch(
    `https://graph.instagram.com/v22.0/me/media?fields=${fields}&limit=9&access_token=${token}`
  );
  return res.json() as Promise<{ data: IgMedia[]; error?: { message: string } }>;
}

export async function getMediaInsights(token: string, mediaId: string) {
  const res = await fetch(
    `https://graph.instagram.com/v22.0/${mediaId}/insights?metric=reach,plays,saved,shares&access_token=${token}`
  );
  return res.json();
}

export interface IgMedia {
  id: string;
  caption?: string;
  media_type: string;
  thumbnail_url?: string;
  media_url?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  video_views?: number;
  permalink: string;
}
