'use client';
import { useEffect, useState, type ReactNode } from 'react';
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

const RAINBOW = 'linear-gradient(90deg,#ff0040,#ff8a00,#ffd500,#22c55e,#3b82f6,#8b5cf6)';

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function socialUrl(platform: 'instagram' | 'tiktok' | 'x', v: string): string {
  const val = v.trim();
  if (/^https?:\/\//i.test(val)) return val;
  const handle = val.replace(/^@/, '');
  if (platform === 'instagram') return `https://instagram.com/${handle}`;
  if (platform === 'tiktok') return `https://tiktok.com/@${handle}`;
  return `https://x.com/${handle}`;
}

export default function ProfilePage() {
  const { lang } = useLang();
  const { user, loading, signOut } = useAuth();
  const isSignedIn = !!user;
  const isLoaded = !loading;
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'You';

  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [pro, setPro] = useState(false);

  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('sky');
  const [bio, setBio] = useState('');
  const [ig, setIg] = useState('');
  const [tt, setTt] = useState('');
  const [xx, setXx] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const m = (user.user_metadata ?? {}) as Record<string, string>;
    setAvatar(m.avatar_url || '');
    setBanner(m.banner && BANNERS[m.banner] ? m.banner : 'sky');
    setBio(m.bio || '');
    setIg(m.instagram || '');
    setTt(m.tiktok || '');
    setXx(m.x || '');
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
      await supabaseBrowser().auth.updateUser({ data: { avatar_url: avatar, banner, bio, instagram: ig, tiktok: tt, x: xx } });
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
  const expPct = Math.min(100, 12 + analysesCount * 8);

  const socials: { key: 'instagram' | 'tiktok' | 'x'; val: string; icon: ReactNode }[] = [
    { key: 'instagram', val: ig, icon: <InstagramIcon /> },
    { key: 'tiktok', val: tt, icon: <TikTokIcon /> },
    { key: 'x', val: xx, icon: <XIcon /> },
  ];

  const profileCard = (
    <div className="rounded-3xl border border-black/[0.08] overflow-hidden shadow-[0_10px_50px_-18px_rgba(0,0,0,0.25)] bg-white">
      {/* banner */}
      <div className="relative h-32" style={{ background: BANNERS[banner] }}>
        <button
          onClick={() => setEditing(e => !e)}
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-white text-black text-[13px] font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/90 transition-colors shadow-sm"
        >
          {tr('profile', 'editProfile', lang)} <Pencil size={13} />
        </button>
      </div>

      <div className="px-6 pb-6">
        {/* avatar + exp bar on one line */}
        <div className="flex items-end justify-between -mt-11 mb-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="relative z-10 w-[92px] h-[92px] rounded-full object-cover bg-white border-4 border-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)]" />
          ) : (
            <span className="relative z-10 w-[92px] h-[92px] rounded-full bg-[#e8002d] text-white text-3xl font-bold flex items-center justify-center border-4 border-white shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)]">{initial}</span>
          )}
          <div className="pb-1.5 w-32">
            <p className="text-[11px] text-[#999] mb-1 text-right">exp.</p>
            <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${expPct}%`, background: RAINBOW }} />
            </div>
          </div>
        </div>

        {/* name + premium */}
        <div className="flex items-center gap-2">
          <h1 className="font-display font-extrabold text-2xl tracking-tight truncate">{displayName}</h1>
          {pro && (
            <span title="Pro" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff9500] shrink-0 shadow-sm">
              <Crown size={13} className="text-white" fill="white" />
            </span>
          )}
        </div>

        <p className="text-sm text-[#666] mt-1.5 leading-relaxed">{bio || user?.email}</p>

        {/* stats — 3 cols with dividers */}
        <div className="flex items-stretch border-y border-black/[0.07] my-5">
          {[
            { v: analysesCount, l: tr('profile', 'statAnalyses', lang) },
            { v: avg ?? '—', l: tr('profile', 'statAvg', lang) },
            { v: best ?? '—', l: tr('profile', 'statBest', lang) },
          ].map((s, i) => (
            <div key={i} className={`flex-1 text-center py-4 ${i > 0 ? 'border-l border-black/[0.07]' : ''}`}>
              <p className="font-display font-extrabold text-xl leading-none">{s.v}</p>
              <p className="text-[11px] text-[#999] mt-1.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* socials */}
        <div className="grid grid-cols-3 gap-3">
          {socials.map(s => (
            s.val ? (
              <a key={s.key} href={socialUrl(s.key, s.val)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center h-11 rounded-2xl bg-[#f5f5f5] text-black hover:bg-[#ececec] transition-colors">
                {s.icon}
              </a>
            ) : (
              <div key={s.key} className="flex items-center justify-center h-11 rounded-2xl bg-[#fafafa] text-black/25">
                {s.icon}
              </div>
            )
          ))}
        </div>

        <button onClick={signOut} className="text-xs font-semibold text-[#999] hover:text-black transition-colors mt-5">
          {tr('auth', 'signOut', lang)}
        </button>
      </div>
    </div>
  );

  const editor = editing && (
    <div className="rounded-3xl border border-black/10 p-5 mt-6">
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

      <input value={bio} onChange={e => setBio(e.target.value)} maxLength={120}
        placeholder={tr('profile', 'bioPlaceholder', lang)}
        className="w-full border border-black/12 rounded-xl px-4 py-3 text-sm outline-none focus:border-black/40 mb-3" />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input value={ig} onChange={e => setIg(e.target.value)} placeholder="Instagram" className="border border-black/12 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/40" />
        <input value={tt} onChange={e => setTt(e.target.value)} placeholder="TikTok" className="border border-black/12 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/40" />
        <input value={xx} onChange={e => setXx(e.target.value)} placeholder="X" className="border border-black/12 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/40" />
      </div>

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
  );

  const historySection = (
    <>
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
    </>
  );

  if (!isSignedIn) {
    return (
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="bg-[#f5f5f5] rounded-2xl px-5 py-6 mb-8 text-center mt-6">
          <p className="text-sm text-[#666] mb-4 max-w-xs mx-auto">{tr('profile', 'signedOut', lang)}</p>
          <Link href="/login" className="inline-block bg-[#e8002d] text-white font-bold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity">
            {tr('nav', 'signIn', lang)}
          </Link>
        </div>
        {historySection}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="grid gap-8 lg:grid-cols-[370px_minmax(0,1fr)] lg:gap-10 lg:items-start">
        {/* LEFT — profile card + editor (sticky on desktop) */}
        <div className="lg:sticky lg:top-8 self-start">
          {profileCard}
          {editor}
        </div>

        {/* RIGHT — analyses history */}
        <div className="min-w-0">
          {historySection}
        </div>
      </div>
    </div>
  );
}
