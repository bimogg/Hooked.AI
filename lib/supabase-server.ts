import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

// Returns the signed-in user (id + email) or null.
export async function getServerUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
