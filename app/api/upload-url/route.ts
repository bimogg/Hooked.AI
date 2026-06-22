import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

// Returns a one-time signed upload URL so the client can upload a video
// straight to Supabase Storage (no public bucket, key stays server-side).
export async function POST() {
  const path = `temp/${randomUUID()}.mp4`;
  const { data, error } = await supabaseAdmin.storage
    .from('videos')
    .createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: 'sign_failed' }, { status: 500 });
  }
  return NextResponse.json({ path: data.path, token: data.token });
}
