import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, getLongLivedToken, getMe } from '@/lib/instagram';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hooked-ai-seven.vercel.app';
const COOKIE_MAX = 60 * 60 * 24 * 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // This page closes the popup and notifies the parent window
  const closePopup = (success: boolean, username?: string) => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'ig_auth', success: ${success}, username: '${username ?? ''}' }, '*');
    window.close();
  } else {
    window.location.href = '${APP_URL}/pro${success ? '' : '?error=token'}';
  }
</script>
</body>
</html>`;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  };

  if (error || !code) return closePopup(false);

  try {
    const short = await exchangeCode(code);
    if (!short.access_token) return closePopup(false);

    const long = await getLongLivedToken(short.access_token);
    if (!long.access_token) return closePopup(false);

    const me = await getMe(long.access_token);

    const res = closePopup(true, me.username);
    res.cookies.set('ig_token', long.access_token, { httpOnly: true, secure: true, maxAge: COOKIE_MAX, path: '/' });
    res.cookies.set('ig_user_id', me.id, { httpOnly: true, secure: true, maxAge: COOKIE_MAX, path: '/' });
    res.cookies.set('ig_username', me.username, { httpOnly: false, secure: true, maxAge: COOKIE_MAX, path: '/' });
    return res;
  } catch (e) {
    console.error('Auth callback error:', e);
    return closePopup(false);
  }
}
