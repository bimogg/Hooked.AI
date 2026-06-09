import { cookies } from 'next/headers';
import ProConnected from '@/components/ProConnected';
import Link from 'next/link';
import { Sparkles, Lock, TrendingUp, Zap } from 'lucide-react';

export const metadata = { title: 'HookedAI Pro — AI Hook Analyzer' };

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const fbName = cookieStore.get('fb_name')?.value;
  const isConnected = !!cookieStore.get('fb_token')?.value;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro</span>
        <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
          AI Hook<br />Analyzer
        </h1>
        <p className="text-[#888] text-sm mt-3 max-w-md">
          ИИ анализирует твои Reels и пишет готовый скрипт хука для каждого видео.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error === 'denied' ? 'Авторизация отклонена. Попробуй снова.' : 'Ошибка входа. Попробуй снова.'}
        </div>
      )}

      {!isConnected ? (
        <div className="border border-black/10 rounded-2xl p-8 bg-[#fafafa]">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8002d] to-[#ff6b35] flex items-center justify-center">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl uppercase">
                Войди на платформу
              </h2>
              <p className="text-[#888] text-sm mt-2">
                Авторизуйся → тебя вернёт обратно сюда → введёшь свой Instagram username → ИИ анализирует твои Reels.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              {[
                { icon: TrendingUp, text: 'Анализ твоих последних Reels' },
                { icon: Zap,        text: 'ИИ пишет скрипт хука для каждого видео' },
                { icon: Lock,       text: 'Безопасно — только чтение данных' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white border border-black/8 rounded-xl px-4 py-3 text-left">
                  <Icon size={15} className="text-[#e8002d] shrink-0" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
            <Link
              href="/api/auth/instagram"
              className="w-full bg-black text-white font-bold text-sm py-4 rounded-full hover:opacity-80 transition-opacity text-center flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Войти через Instagram
            </Link>
            <p className="text-[10px] text-[#bbb]">
              Авторизуешься → возвращаешься сюда автоматически
            </p>
          </div>
        </div>
      ) : (
        <ProConnected name={fbName} />
      )}
    </div>
  );
}
