import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'subscription.created' || type === 'subscription.updated') {
      const email = data?.user?.email ?? data?.customer?.email;
      const status = data?.status;
      const polarId = data?.id;

      if (!email) return NextResponse.json({ ok: true });

      await supabaseAdmin.from('subscribers').upsert({
        email: email.toLowerCase(),
        status,
        polar_subscription_id: polarId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    }

    if (type === 'subscription.canceled' || type === 'subscription.revoked') {
      const email = data?.user?.email ?? data?.customer?.email;
      if (email) {
        await supabaseAdmin.from('subscribers').upsert({
          email: email.toLowerCase(),
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Polar webhook error:', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
