'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { useLang } from '@/components/LanguageProvider';
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

// normalize a server row (snake_case) into HistoryItem
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

export default function ProfilePage() {
  const { lang } = useLang();
  const { isSignedIn, isLoaded, user } = useUser();
  const [history, setHistory] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const local = () => {
      try {
        const raw = localStorage.getItem('hooked_history');
        setHistory(raw ? JSON.parse(raw) : []);
      } catch { setHistory([]); }
    };
    if (isSignedIn) {
      fetch('/api/history')
        .then(r => r.json())
        .then(d => setHistory((d.items ?? []).map(fromServer)))
        .catch(local);
    } else {
      local();
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display font-extrabold text-3xl md:text-4xl uppercase mb-6">{tr('profile', 'title', lang)}</h1>

      {/* account card */}
      {isSignedIn ? (
        <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-2xl px-5 py-4 mb-8">
          <UserButton />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{user?.fullName || user?.username || 'You'}</p>
            <p className="text-[#888] text-xs truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#f5f5f5] rounded-2xl px-5 py-6 mb-8 text-center">
          <p className="text-sm text-[#666] mb-4 max-w-xs mx-auto">{tr('profile', 'signedOut', lang)}</p>
          <SignInButton mode="modal" forceRedirectUrl="/profile" signUpForceRedirectUrl="/profile">
            <button className="bg-[#e8002d] text-white font-bold text-sm px-7 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer">
              {tr('nav', 'signIn', lang)}
            </button>
          </SignInButton>
        </div>
      )}

      {/* history */}
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
