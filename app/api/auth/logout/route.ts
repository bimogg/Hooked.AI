import { NextResponse } from 'next/server';

const RAW = process.env.NEXT_PUBLIC_APP_URL ?? '';
const APP_URL = RAW.startsWith('http://localhost') || !RAW ? 'https://hooked-ai-seven.vercel.app' : RAW;

export async function POST() {
  const res = NextResponse.redirect(`${APP_URL}/pro`);
  res.cookies.delete('ig_token');
  res.cookies.delete('ig_user_id');
  res.cookies.delete('ig_username');
  return res;
}
