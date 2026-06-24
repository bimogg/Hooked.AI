import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Supabase client for server (route handlers / server components) — reads the auth session from cookies.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return store.getAll(); },
        setAll(toSet) {
          try { toSet.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {}
        },
      },
    },
  );
}

// Returns the signed-in user (id + email) or null — from cookies (web).
export async function getServerUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

// Returns the signed-in user from EITHER a Bearer token (mobile app, no cookies)
// OR the cookie session (web). Use this in API routes that both clients call.
export async function getRequestUser(req: NextRequest) {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      if (data.user) return data.user;
    }
  }
  return getServerUser();
}
