'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGES, isRTL, type LangCode } from '@/lib/translations';

interface LangCtx { lang: LangCode; setLang: (l: LangCode) => void; }
const Ctx = createContext<LangCtx>({ lang: 'ru', setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('hooked_lang') as LangCode;
    if (saved && LANGUAGES.find(l => l.code === saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem('hooked_lang', l);
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() { return useContext(Ctx); }
