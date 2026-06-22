import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

// owner / founder accounts — always unlimited Pro
const OWNER_EMAILS = ['anagashtay@gmail.com'];

export async function GET() {
  const u = await getServerUser();
  const email = u?.email?.toLowerCase();
  if (!email) return NextResponse.json({ pro: false });

  if (OWNER_EMAILS.includes(email)) return NextResponse.json({ pro: true });

  const { data } = await supabaseAdmin
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .eq('status', 'active')
    .limit(1);

  return NextResponse.json({ pro: Array.isArray(data) && data.length > 0 });
}
