import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ pro: false });

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) return NextResponse.json({ pro: false });

  const { data } = await supabaseAdmin
    .from('subscribers')
    .select('status')
    .eq('email', email.toLowerCase())
    .single();

  const pro = data?.status === 'active';
  return NextResponse.json({ pro });
}
