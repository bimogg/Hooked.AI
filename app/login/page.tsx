'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LanguageProvider';
import { tr } from '@/lib/translations';

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

export default function LoginPage() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [thumbs, setThumbs] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('hooks').select('thumbnail_url').not('thumbnail_url', 'is', null).limit(21)
      .then(({ data }) => setThumbs(((data ?? []) as { thumbnail_url: string | null }[]).map(r => r.thumbnail_url).filter((u): u is string => !!u)));
  }, []);

  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  const google = async () => {
    setBusy(true);
    await supabaseBrowser().auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  };

  const emailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (!error) setSent(true);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]" style={{ fontFamily: APPLE_FONT }}>
      {/* LEFT — auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-16 text-white">
        <div className="w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="HookedAI" className="w-12 h-12 rounded-xl object-cover mx-auto mb-7" />
          <h1 className="text-2xl font-bold text-center tracking-tight">{tr('auth', 'title', lang)}</h1>
          <p className="text-sm text-white/50 text-center mt-2 mb-8">{tr('auth', 'sub', lang)}</p>

          {sent ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm text-center px-5 py-6">
              {tr('auth', 'sent', lang)}
            </div>
          ) : (
            <>
              <button onClick={google} disabled={busy}
                className="w-full flex items-center justify-center gap-3 border border-white/15 bg-white/[0.04] rounded-full py-3.5 font-semibold text-sm hover:bg-white/[0.08] transition-colors disabled:opacity-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                {tr('auth', 'google', lang)}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] uppercase tracking-widest text-white/40">{tr('upload', 'or', lang)}</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={emailLink} className="flex flex-col gap-3">
                <div className="relative">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder={tr('auth', 'emailPlaceholder', lang)}
                    className="w-full bg-white/[0.06] border border-white/12 rounded-full pl-5 pr-12 py-3.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/40" />
                  <button type="submit" disabled={busy || !email.trim()} aria-label="continue"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-opacity">
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <button type="submit" disabled={busy || !email.trim()}
                  className="w-full bg-white text-black font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40">
                  {tr('auth', 'continueBtn', lang)}
                </button>
              </form>
            </>
          )}

          <p className="text-[11px] text-white/35 text-center mt-6 leading-relaxed">{tr('auth', 'terms', lang)}</p>
        </div>
      </div>

      {/* RIGHT — tilted collage of real hook thumbnails */}
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 -rotate-6 scale-125 origin-center">
          <div className="columns-3 gap-3 p-3">
            {thumbs.map((t, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={t} alt="" loading="lazy" className="w-full mb-3 rounded-xl object-cover" />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
      </div>
    </div>
  );
}
