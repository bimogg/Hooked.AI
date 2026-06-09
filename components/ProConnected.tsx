'use client';
import { useState } from 'react';
import { LogOut, ArrowRight } from 'lucide-react';
import ProAnalyzer from '@/components/ProAnalyzer';

export default function ProConnected({ name }: { name?: string }) {
  const [igUsername, setIgUsername] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ig_username') ?? '';
    return '';
  });
  const [confirmed, setConfirmed] = useState(false);
  const [input, setInput] = useState('');

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  const confirm = () => {
    const u = input.replace('@', '').trim();
    if (!u) return;
    localStorage.setItem('ig_username', u);
    setIgUsername(u);
    setConfirmed(true);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Account bar */}
      <div className="flex items-center justify-between bg-[#f5f5f5] rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0866ff] flex items-center justify-center text-white text-xs font-bold">
            {name?.[0]?.toUpperCase() ?? 'F'}
          </div>
          <div>
            <p className="text-sm font-medium">{name ?? 'Пользователь'}</p>
            <p className="text-[10px] text-[#888]">Вошёл через Facebook</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-1 text-[11px] text-[#888] hover:text-red-600 transition-colors">
          <LogOut size={12} /> Выйти
        </button>
      </div>

      {/* Instagram username input (shown if not set) */}
      {!igUsername || !confirmed ? (
        <div className="border border-black/10 rounded-2xl p-6 bg-white">
          <p className="text-sm font-medium mb-1">Твой Instagram username</p>
          <p className="text-[11px] text-[#888] mb-4">Введи один раз — запомним для следующих визитов</p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-black/20 rounded-full overflow-hidden focus-within:border-black bg-white">
              <span className="pl-5 text-[#aaa] text-sm select-none">@</span>
              <input
                type="text"
                value={input || igUsername}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirm()}
                placeholder="твой_instagram"
                className="flex-1 px-2 py-3 text-sm outline-none bg-transparent"
                autoFocus
              />
            </div>
            <button onClick={confirm}
              disabled={!(input || igUsername).trim()}
              className="bg-[#e8002d] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1">
              <ArrowRight size={15} /> Анализировать
            </button>
          </div>
        </div>
      ) : (
        <ProAnalyzer username={igUsername} />
      )}
    </div>
  );
}
