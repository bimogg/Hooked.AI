import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, getLongLivedToken, getMe } from '@/lib/instagram';

const RAW = process.env.NEXT_PUBLIC_APP_URL ?? '';
const APP_URL = RAW.startsWith('http://localhost') || !RAW
  ? 'https://hooked-ai-seven.vercel.app'
  : RAW;
const COOKIE_MAX = 60 * 60 * 24 * 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/pro?error=denied`);
  }

  try {
    const short = await exchangeCode(code);
    if (!short.access_token) {
      console.error('Token exchange failed:', short);
      return NextResponse.redirect(`${APP_URL}/pro?error=token`);
    }

    const long = await getLongLivedToken(short.access_token);
    if (!long.access_token) {
      return NextResponse.redirect(`${APP_URL}/pro?error=token`);
    }

    const me = await getMe(long.access_token);

    const res = NextResponse.redirect(`${APP_URL}/pro`);
    res.cookies.set('ig_token', long.access_token, { httpOnly: true, secure: true, maxAge: COOKIE_MAX, path: '/' });
    res.cookies.set('ig_user_id', me.id ?? '', { httpOnly: true, secure: true, maxAge: COOKIE_MAX, path: '/' });
    res.cookies.set('ig_username', me.username ?? '', { httpOnly: false, secure: true, maxAge: COOKIE_MAX, path: '/' });
    return res;
  } catch (e) {
    console.error('Auth callback error:', e);
    return NextResponse.redirect(`${APP_URL}/pro?error=server`);
  }
}
