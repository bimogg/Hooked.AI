import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getRequestUser } from '@/lib/supabase-server';

// In-app account deletion — required by App Store Guideline 5.1.1(v).
// Authenticated via cookie (web) or Bearer token (mobile); deletes the user
// and their auth record via the service role.
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: 'delete_failed', detail: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
