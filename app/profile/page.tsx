'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Pencil, Check } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { tr } from '@/lib/translations';

interface HistoryItem {
  id: number | string;
  date: string;
  name?: string;
  thumb?: string;
  hookScore?: number | null;
  videoTopic?: string | null;
  bestHook?: { script?: string; hookType?: string; tip?: string } | null;
}

function fromServer(r: Record<string, unknown>): HistoryItem {
  return {
    id: (r.id as string) ?? Math.random(),
    date: (r.created_at as string) ?? new Date().toISOString(),
    name: (r.name as string) ?? undefined,
    thumb: (r.thumb as string) ?? undefined,
    hookScore: (r.hook_score as number) ?? null,
    videoTopic: (r.video_topic as string) ?? null,
    bestHook: (r.best_hook as HistoryItem['bestHook']) ?? null,
  };
}

function scoreColor(s: number) {
  if (s >= 8) return '#16a34a';
  if (s >= 5) return '#e8a000';
  return '#e8002d';
}

// Cartoon avatars (DiceBear) — no asset hosting needed.
const AVATARS = [
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Milo',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Zoe',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Leo',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Mia',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Spark',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Nova',
  'https://api.dicebear.com/9.x/micah/svg?seed=Ray',
  'https://api.dicebear.com/9.x/micah/svg?seed=Luna',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Ivy',
  'https://api.dicebear.com/9.x/notionists/svg?seed=Max',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Robo',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Pixel',
];

// Background banners
const BANNERS: Record<string, string> = {
  sky: 'linear-gradient(135deg,#a8d8ff 0%,#e8f4ff 100%)',
  sunset: 'linear-gradient(135deg,#ff9a8b 0%,#ff6a88 50%,#ff99ac 100%)',
  mint: 'linear-gradient(135deg,#a8edea 0%,#c1f4d4 100%)',
  peach: 'linear-gradient(135deg,#ffd3a5 0%,#fd9d7e 100%)',
  grape: 'linear-gradient(135deg,#c2a8ff 0%,#e0c3fc 100%)',
  brand: 'linear-gradient(135deg,#e8002d 0%,#ff6a88 100%)',
  night: 'linear-gradient(135deg,#0a0a0a 0%,#3a0a14 100%)',
};
const BANNER_IDS = Object.keys(BANNERS);

export default function ProfilePage() {
  const { lang } = useLang();
  const { user, loading, signOut } = useAuth();
  const isSignedIn = !!user;
  const isLoaded = !loading;
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'You';

  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [pro, setPro] = useState(false);

  const [avatar, setAvatar] = useState<string>('');
  const [banner, setBanner] = useState<string>('sky');
  const [bio, setBio] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const m = (user.user_metadata ?? {}) as { avatar_url?: string; banner?: string; bio?: string };
    setAvatar(m.avatar_url || '');
    setBanner(m.banner && BANNERS[m.banner] ? m.banner : 'sky');
    setBio(m.bio || '');
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      fetch('/api/check-subscription').then(r => r.json()).then(d => setPro(!!d.pro)).catch(() => {});
      fetch('/api/history')
        .then(r => r.json())
        .then(d => setHistory((d.items ?? []).map(fromServer)))
        .catch(() => {
          try { const raw = localStorage.getItem('hooked_history'); setHistory(raw ? JSON.parse(raw) : []); } catch { setHistory([]); }
        });
    } else {
      try { const raw = localStorage.getItem('hooked_history'); setHistory(raw ? JSON.parse(raw) : []); } catch { setHistory([]); }
    }
  }, [isLoaded, isSignedIn]);

  const save = async () => {
    setSaving(true);
    try {
      await supabaseBrowser().auth.updateUser({ data: { avatar_url: avatar, banner, bio } });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const scores = (history ?? []).map(h => h.hookScore).filter((n): n is number => typeof n === 'number');
  const analysesCount = history?.length ?? 0;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const best = scores.length ? Math.max(...scores) : null;
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      {isSignedIn ? (
        <>
          {/* PROFILE CARD */}
          <div className="rounded-3xl border border-black/10 overflow-hidden shadow-[0_8px_40px_-16px_rgba(0,0,0,0.2)] mb-6">
            <div className="relative h-32" style={{ background: BANNERS[banner] }}>
              <button
                onClick={() => setEditing(e => !e)}
                className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur text-black text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
              >
                <Pencil size={12} /> {tr('profile', 'editProfile', lang)}
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="-mt-10 mb-3">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover bg-white ring-4 ring-white shadow-md" />
                ) : (
                  <span className="w-20 h-20 rounded-full bg-[#e8002d] text-white text-2xl font-bold flex items-center justify-center ring-4 ring-white shadow-md">{initial}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl truncate">{displayName}</h1>
                {pro && (
                  <span title="Pro" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff9500] shrink-0 shadow-sm">
                    <Crown size={13} className="text-white" fill="white" />
                  </span>
                )}
              </div>
              <p className="text-[#888] text-sm mt-0.5">{user?.email}</p>
              {bio && <p className="text-sm text-[#444] mt-3 leading-relaxed">{bio}</p>}

              <div className="grid grid-cols-3 gap-2 mt-6 mb-1">
                {[
                  { v: analysesCount, l: tr('profile', 'statAnalyses', lang) },
                  { v: avg ?? '—', l: tr('profile', 'statAvg', lang) },
                  { v: best ?? '—', l: tr('profile', 'statBest', lang) },
                ].map((s, i) => (
                  <div key={i} className="text-center rounded-2xl bg-[#f5f5f5] py-3">
                    <p className="font-display font-extrabold text-xl leading-none">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#999] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>

              <button onClick={signOut} className="text-xs font-semibold text-[#999] hover:text-black transition-colors mt-4">
                {tr('auth', 'signOut', lang)}
              </button>
            </div>
          </div>

          {/* EDITOR */}
          {editing && (
            <div className="rounded-3xl border border-black/10 p-5 mb-8">
              <p className="text-xs uppercase tracking-wider text-[#888] mb-3">{tr('profile', 'chooseAvatar', lang)}</p>
              <div className="grid grid-cols-6 gap-2.5 mb-6">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)}
                    className={`rounded-full overflow-hidden aspect-square bg-[#f5f5f5] transition-all ${avatar === a ? 'ring-2 ring-[#e8002d] ring-offset-2' : 'hover:opacity-80'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <p className="text-xs uppercase tracking-wider text-[#888] mb-3">{tr('profile', 'chooseBanner', lang)}</p>
              <div className="grid grid-cols-7 gap-2.5 mb-6">
                {BANNER_IDS.map(id => (
                  <button key={id} onClick={() => setBanner(id)}
                    className={`h-10 rounded-xl transition-all ${banner === id ? 'ring-2 ring-[#e8002d] ring-offset-2' : 'hover:opacity-80'}`}
                    style={{ background: BANNERS[id] }} />
                ))}
              </div>

              <input
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={120}
                placeholder={tr('profile', 'bioPlaceholder', lang)}
                className="w-full border border-black/12 rounded-xl px-4 py-3 text-sm outline-none focus:border-black/40 mb-4"
              />

              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 bg-[#e8002d] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:opacity-90 disabled:opacity-50">
                  <Check size={14} /> {saving ? '…' : tr('profile', 'save', lang)}
                </button>
                <button onClick={() => setEditing(false)} className="text-sm font-semibold text-[#888] hover:text-black px-4">
                  {tr('profile', 'cancel', lang)}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#f5f5f5] rounded-2xl px-5 py-6 mb-8 text-center mt-6">
          <p className="text-sm text-[#666] mb-4 max-w-xs mx-auto">{tr('profile', 'signedOut', lang)}</p>
          <Link href="/login" className="inline-block bg-[#e8002d] text-white font-bold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity">
            {tr('nav', 'signIn', lang)}
          </Link>
        </div>
      )}

      {/* HISTORY */}
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-4">{tr('profile', 'myAnalyses', lang)}</h2>

      {history === null ? null : history.length === 0 ? (
        <div className="border border-black/10 rounded-2xl p-10 text-center">
          <p className="text-sm text-[#888] mb-5">{tr('profile', 'empty', lang)}</p>
          <Link href="/pro" className="inline-block bg-[#e8002d] text-white font-bold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity">
            {tr('profile', 'emptyCta', lang)}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map(item => (
            <div key={item.id} className="flex gap-4 items-center border border-black/10 rounded-2xl p-3 hover:shadow-md transition-shadow">
              {item.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumb} alt="" className="w-16 h-20 object-cover rounded-lg bg-black/5 shrink-0" />
              ) : (
                <div className="w-16 h-20 rounded-lg bg-black/5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{item.videoTopic || item.name || '—'}</p>
                {item.bestHook?.hookType && (
                  <p className="text-[11px] text-[#e8002d] font-medium mt-0.5 truncate">{item.bestHook.hookType}</p>
                )}
                <p className="text-[11px] text-[#aaa] mt-1">{new Date(item.date).toLocaleDateString(lang)}</p>
              </div>
              {typeof item.hookScore === 'number' && (
                <div className="text-right shrink-0 pr-1">
                  <p className="font-display font-extrabold text-2xl leading-none" style={{ color: scoreColor(item.hookScore) }}>{item.hookScore}</p>
                  <p className="text-[9px] uppercase tracking-wider text-[#aaa]">{tr('profile', 'hookLabel', lang)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
