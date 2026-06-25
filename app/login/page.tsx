'use client';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LanguageProvider';
import { tr } from '@/lib/translations';

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

type Mode = 'signin' | 'signup' | 'forgot' | 'recovery';

export default function LoginPage() {
  const { lang } = useLang();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);

  useEffect(() => {
    supabase.from('hooks').select('thumbnail_url').not('thumbnail_url', 'is', null).order('views', { ascending: false }).limit(60)
      .then(({ data }) => setThumbs(((data ?? []) as { thumbnail_url: string | null }[]).map(r => r.thumbnail_url).filter((u): u is string => !!u)));
  }, []);

  // When the user opens the password-reset link, Supabase emits PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: sub } = supabaseBrowser().auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') { setMode('recovery'); setErr(null); setMsg(null); }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectTo = origin ? `${origin}/auth/callback` : undefined;

  const google = async () => {
    setBusy(true);
    await supabaseBrowser().auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    const sb = supabaseBrowser();
    const em = email.trim();
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await sb.auth.signInWithPassword({ email: em, password });
        if (error) throw error;
        window.location.href = '/';
      } else if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({ email: em, password, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        if (data.session) window.location.href = '/';
        else setMsg(tr('auth', 'sent', lang));
      } else if (mode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: origin ? `${origin}/login` : undefined });
        if (error) throw error;
        setMsg(tr('auth', 'resetSent', lang));
      } else {
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
        setMsg(tr('auth', 'updated', lang));
        setTimeout(() => { window.location.href = '/'; }, 1200);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const titleKey = mode === 'signup' ? 'signupTitle' : mode === 'forgot' ? 'forgotTitle' : mode === 'recovery' ? 'recoveryTitle' : 'signinTitle';
  const submitKey = mode === 'signup' ? 'signupBtn' : mode === 'forgot' ? 'forgotBtn' : mode === 'recovery' ? 'updateBtn' : 'signinBtn';
  const showEmail = mode !== 'recovery';
  const showPassword = mode !== 'forgot';
  const showGoogle = mode === 'signin' || mode === 'signup';

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]" style={{ fontFamily: APPLE_FONT }}>
      {/* LEFT — auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-16 text-white">
        <div className="w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="HookedAI" className="w-12 h-12 rounded-xl object-cover mx-auto mb-7" />
          <h1 className="text-2xl font-bold text-center tracking-tight mb-8">{tr('auth', titleKey, lang)}</h1>

          {msg ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm text-center px-5 py-6">
              {msg}
            </div>
          ) : (
            <>
              {showGoogle && (
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
                </>
              )}

              <form onSubmit={submit} className="flex flex-col gap-3">
                {showEmail && (
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    autoComplete="email"
                    placeholder={tr('auth', 'emailPlaceholder', lang)}
                    className="w-full bg-white/[0.06] border border-white/12 rounded-full px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/40" />
                )}

                {showPassword && (
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      placeholder={tr('auth', mode === 'recovery' ? 'newPassword' : 'password', lang)}
                      className="w-full bg-white/[0.06] border border-white/12 rounded-full pl-5 pr-12 py-3.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/40" />
                    <button type="button" onClick={() => setShowPw(v => !v)} aria-label="toggle password"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {mode === 'signin' && (
                  <button type="button" onClick={() => { setMode('forgot'); setErr(null); }}
                    className="self-end text-xs text-white/50 hover:text-white/80 -mt-1">
                    {tr('auth', 'forgotLink', lang)}
                  </button>
                )}

                {err && <p className="text-xs text-red-400 text-center">{err}</p>}

                <button type="submit" disabled={busy}
                  className="w-full bg-white text-black font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 mt-1">
                  {busy ? '…' : tr('auth', submitKey, lang)}
                </button>
              </form>

              {/* mode toggles */}
              <div className="text-center mt-6 text-sm text-white/50">
                {mode === 'signin' && (
                  <>{tr('auth', 'noAccount', lang)}{' '}
                    <button onClick={() => { setMode('signup'); setErr(null); }} className="text-white font-semibold hover:underline">{tr('auth', 'toSignup', lang)}</button>
                  </>
                )}
                {mode === 'signup' && (
                  <>{tr('auth', 'haveAccount', lang)}{' '}
                    <button onClick={() => { setMode('signin'); setErr(null); }} className="text-white font-semibold hover:underline">{tr('auth', 'toSignin', lang)}</button>
                  </>
                )}
                {(mode === 'forgot' || mode === 'recovery') && (
                  <button onClick={() => { setMode('signin'); setErr(null); }} className="text-white/70 hover:text-white">{tr('auth', 'backSignin', lang)}</button>
                )}
              </div>
            </>
          )}

          <p className="text-[11px] text-white/35 text-center mt-6 leading-relaxed">{tr('auth', 'terms', lang)}</p>
        </div>
      </div>

      {/* RIGHT — animated tilted wall of real Reels (Mobbin-style) */}
      <div className="hidden md:block w-1/2 relative overflow-hidden bg-[#0a0a0a] border-l border-white/10">
        <div className="absolute inset-0 -rotate-[8deg] scale-[1.12] origin-center flex gap-2 px-2">
          {[0, 1, 2, 3, 4].map(col => {
            const colThumbs = thumbs.filter((_, i) => i % 5 === col);
            const loop = colThumbs.length ? [...colThumbs, ...colThumbs] : [];
            return (
              <div
                key={col}
                className="flex-1 flex flex-col gap-2 will-change-transform"
                style={{ animation: `${col % 2 === 1 ? 'reelDown' : 'reelUp'} ${46 + col * 6}s linear infinite` }}
              >
                {loop.map((t, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={t} alt="" loading="lazy" className="w-full rounded-xl object-cover shadow-lg" />
                ))}
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes reelUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
          @keyframes reelDown { from { transform: translateY(-50%); } to { transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
