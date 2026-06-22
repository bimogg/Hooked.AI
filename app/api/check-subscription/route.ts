import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// owner / founder accounts — always unlimited Pro
const OWNER_EMAILS = ['anagashtay@gmail.com'];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ pro: false });

  const user = await currentUser();
  const emails = (user?.emailAddresses ?? [])
    .map(e => e.emailAddress?.toLowerCase())
    .filter(Boolean) as string[];
  if (!emails.length) return NextResponse.json({ pro: false });

  // owner override — unlimited regardless of subscription table
  if (emails.some(e => OWNER_EMAILS.includes(e))) return NextResponse.json({ pro: true });

  const { data } = await supabaseAdmin
    .from('subscribers')
    .select('status')
    .in('email', emails)
    .eq('status', 'active')
    .limit(1);

  const pro = Array.isArray(data) && data.length > 0;
  return NextResponse.json({ pro });
}
