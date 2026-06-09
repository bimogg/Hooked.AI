'use client';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-auth';
import ProAnalyzer from '@/components/ProAnalyzer';
import { Loader2, Mail, ArrowRight, KeyRound, LogOut } from 'lucide-react';

type Step = 'loading' | 'email' | 'otp' | 'username' | 'ready';

export default function ProPage() {
  const [step, setStep] = useState<Step>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [igUsername, setIgUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const supabase = createClient();

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const saved = session.user.user_metadata?.ig_username as string | undefined;
        if (saved) { setIgUsername(saved); setStep('ready'); }
        else setStep('username');
      } else {
        setStep('email');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
        const saved = session.user.user_metadata?.ig_username as string | undefined;
        if (saved) { setIgUsername(saved); setStep('ready'); }
        else setStep('username');
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendOtp = async () => {
    if (!email.trim()) return;
    setBusy(true); setError('');
    const { error: e } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setBusy(false);
    if (e) { setError('Не удалось отправить код. Проверь email.'); return; }
    setStep('otp');
  };

  const verifyOtp = async () => {
    if (!otp.trim()) return;
    setBusy(true); setError('');
    const { error: e } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setBusy(false);
    if (e) { setError('Неверный код. Попробуй ещё раз.'); return; }
    // onAuthStateChange handles the rest
  };

  const saveUsername = async () => {
    if (!igUsername.trim()) return;
    setBusy(true);
    await supabase.auth.updateUser({ data: { ig_username: igUsername.replace('@', '').trim() } });
    setIgUsername(igUsername.replace('@', '').trim());
    setBusy(false);
    setStep('ready');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); setIgUsername(''); setEmail(''); setOtp('');
    setStep('email');
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-[#e8002d]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro</span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
            AI Hook<br />Analyzer
          </h1>
        </div>
        {user && (
          <button onClick={logout} className="flex items-center gap-1.5 text-[11px] text-[#888] hover:text-red-600 transition-colors mt-2">
            <LogOut size={13} /> Выйти
          </button>
        )}
      </div>

      {step === 'email' && (
        <div className="max-w-sm">
          <p className="text-[#888] text-sm mb-6">Введи email — пришлём код для входа. Без паролей.</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center border border-black/20 rounded-full overflow-hidden focus-within:border-black transition-colors bg-white">
              <Mail size={15} className="ml-4 text-[#aaa] shrink-0" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !busy && sendOtp()}
                placeholder="твой@email.com"
                className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-600 pl-1">{error}</p>}
            <button
              onClick={sendOtp} disabled={busy || !email.trim()}
              className="bg-[#e8002d] text-white font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {busy ? 'Отправляем...' : 'Получить код →'}
            </button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="max-w-sm">
          <p className="text-[#888] text-sm mb-1">Код отправлен на <strong>{email}</strong></p>
          <p className="text-[11px] text-[#bbb] mb-6">Проверь папку Спам если не видишь</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center border border-black/20 rounded-full overflow-hidden focus-within:border-black transition-colors bg-white">
              <KeyRound size={15} className="ml-4 text-[#aaa] shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && !busy && verifyOtp()}
                placeholder="6-значный код"
                className="flex-1 px-3 py-3.5 text-sm outline-none bg-transparent tracking-widest"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-600 pl-1">{error}</p>}
            <button
              onClick={verifyOtp} disabled={busy || otp.length < 6}
              className="bg-[#e8002d] text-white font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {busy ? 'Проверяем...' : 'Войти →'}
            </button>
            <button onClick={() => setStep('email')} className="text-xs text-[#888] hover:text-black transition-colors text-center">
              ← Изменить email
            </button>
          </div>
        </div>
      )}

      {step === 'username' && (
        <div className="max-w-sm">
          <p className="text-[#888] text-sm mb-6">Последний шаг — укажи свой Instagram username для анализа.</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center border border-black/20 rounded-full overflow-hidden focus-within:border-black transition-colors bg-white">
              <span className="pl-5 text-[#aaa] text-sm select-none">@</span>
              <input
                type="text"
                value={igUsername}
                onChange={e => setIgUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !busy && saveUsername()}
                placeholder="твой_instagram"
                className="flex-1 px-2 py-3.5 text-sm outline-none bg-transparent"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-600 pl-1">{error}</p>}
            <button
              onClick={saveUsername} disabled={busy || !igUsername.trim()}
              className="bg-[#e8002d] text-white font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {busy ? 'Сохраняем...' : 'Анализировать →'}
            </button>
          </div>
        </div>
      )}

      {step === 'ready' && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-[#888]">
            Привет, <strong>{user?.email}</strong> · анализируем <strong>@{igUsername}</strong>
          </p>
          <ProAnalyzer username={igUsername} />
        </div>
      )}
    </div>
  );
}
