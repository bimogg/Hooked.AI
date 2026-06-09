import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.INSTAGRAM_APP_ID ?? '1620617545694436';
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? '';
const APP_URL = 'https://hooked-ai-seven.vercel.app';
const REDIRECT_URI = 'https://hooked-ai-seven.vercel.app/api/auth/callback';
const COOKIE_MAX = 60 * 60 * 24 * 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/pro?error=denied`);
  }

  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      return NextResponse.redirect(`${APP_URL}/pro?error=token`);
    }

    const meRes = await fetch(
      `https://graph.facebook.com/v22.0/me?fields=id,name&access_token=${tokenData.access_token}`
    );
    const me = await meRes.json();

    const res = NextResponse.redirect(`${APP_URL}/pro`);
    res.cookies.set('fb_token', tokenData.access_token, { httpOnly: true, secure: true, maxAge: COOKIE_MAX, path: '/' });
    res.cookies.set('fb_name', me.name ?? '', { httpOnly: false, secure: true, maxAge: COOKIE_MAX, path: '/' });
    return res;
  } catch (e) {
    console.error('Auth callback error:', e);
    return NextResponse.redirect(`${APP_URL}/pro?error=server`);
  }
}
