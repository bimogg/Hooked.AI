'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useLang } from '@/components/LanguageProvider';
import { tr } from '@/lib/translations';

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

export default function LoginPage() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  const google = async () => {
    setBusy(true);
    await supabaseBrowser().auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  };

  const emailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setBusy(false);
    if (!error) setSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16" style={{ fontFamily: APPLE_FONT }}>
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="HookedAI" className="w-12 h-12 rounded-xl object-cover mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-center tracking-tight">{tr('auth', 'title', lang)}</h1>
        <p className="text-sm text-[#888] text-center mt-2 mb-8">{tr('auth', 'sub', lang)}</p>

        {sent ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm text-center px-5 py-6">
            {tr('auth', 'sent', lang)}
          </div>
        ) : (
          <>
            <button onClick={google} disabled={busy}
              className="w-full flex items-center justify-center gap-3 border border-black/15 rounded-full py-3.5 font-semibold text-sm hover:bg-black/[0.03] transition-colors disabled:opacity-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
              {tr('auth', 'google', lang)}
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-[11px] uppercase tracking-widest text-[#bbb]">{tr('upload', 'or', lang)}</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <form onSubmit={emailLink} className="flex flex-col gap-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={tr('auth', 'emailPlaceholder', lang)}
                className="w-full border border-black/15 rounded-full px-5 py-3.5 text-sm outline-none focus:border-black/40" />
              <button type="submit" disabled={busy || !email.trim()}
                className="w-full bg-black text-white font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40">
                {tr('auth', 'continueBtn', lang)}
              </button>
            </form>
          </>
        )}

        <p className="text-[11px] text-[#bbb] text-center mt-6 leading-relaxed">{tr('auth', 'terms', lang)}</p>
      </div>
    </div>
  );
}
