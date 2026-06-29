import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getRequestUser } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

// Lets a signed-in user upload their own avatar / banner image to the public
// "avatars" bucket. The service-role key stays server-side; the client just
// gets back a public URL to store in user_metadata.
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  const kind = String(form.get('kind') || 'avatar');
  if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 });

  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: 'bad_type' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'too_large' }, { status: 400 });

  const path = `${user.id}/${kind === 'banner' ? 'banner' : 'avatar'}-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) return NextResponse.json({ error: 'upload_failed', detail: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
