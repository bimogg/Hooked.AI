import { NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hooked-ai-seven.vercel.app';

export async function POST() {
  const res = NextResponse.redirect(`${APP_URL}/pro`);
  res.cookies.delete('ig_token');
  res.cookies.delete('ig_user_id');
  res.cookies.delete('ig_username');
  return res;
}
