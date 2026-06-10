'use client';
import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, type LangCode } from '@/lib/translations';
import { useLang } from './LanguageProvider';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#888] hover:text-black transition-colors px-2 py-1"
      >
        <span>{current.flag}</span>
        <span className="font-bold">{current.label}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as LangCode); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-[#fafafa] transition-colors text-left ${lang === l.code ? 'font-bold text-black bg-[#f5f5f5]' : 'text-[#555]'}`}
            >
              <span className="text-sm">{l.flag}</span>
              <span>{l.name}</span>
              {lang === l.code && <span className="ml-auto text-[#e8002d] text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
