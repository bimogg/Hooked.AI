'use client';
import { useLang } from '@/components/LanguageProvider';
import { tr } from '@/lib/translations';

export default function PrivacyPage() {
  const { lang } = useLang();
  const sections = [
    { t: 's1t', b: 's1b' },
    { t: 's2t', b: 's2b' },
    { t: 's3t', b: 's3b' },
    { t: 's4t', b: 's4b' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-extrabold text-3xl uppercase mb-2">{tr('privacy', 'title', lang)}</h1>
      <p className="text-[#888] text-sm mb-10">{tr('privacy', 'updated', lang)}</p>

      {sections.map(({ t, b }) => (
        <section className="mb-8" key={t}>
          <h2 className="font-bold text-base mb-2">{tr('privacy', t, lang)}</h2>
          <p className="text-[#444] text-sm leading-relaxed">{tr('privacy', b, lang)}</p>
        </section>
      ))}

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">{tr('privacy', 's5t', lang)}</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          {tr('privacy', 'contactQ', lang)}{' '}
          <a href="mailto:anagashtay@gmail.com" className="underline hover:text-black transition-colors">
            anagashtay@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
