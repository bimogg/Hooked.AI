import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCode, getLongLivedToken } from '@/lib/instagram';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/connect?error=denied`);
  }

  const short = await exchangeCode(code);
  if (!short.access_token) {
    return NextResponse.redirect(`${APP_URL}/connect?error=token`);
  }

  const long = await getLongLivedToken(short.access_token);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const userId = String(short.user_id);
  const { error: dbErr } = await supabase.from('instagram_accounts').upsert({
    instagram_user_id: userId,
    access_token: long.access_token,
    token_expires_at: new Date(Date.now() + long.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'instagram_user_id' });

  if (dbErr) console.error('DB error saving token:', dbErr);

  const res = NextResponse.redirect(`${APP_URL}/dashboard?ig=${userId}`);
  res.cookies.set('ig_user_id', userId, { httpOnly: true, maxAge: 60 * 60 * 24 * 60 });
  return res;
}
