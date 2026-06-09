import { cookies } from 'next/headers';
import Link from 'next/link';
import ProAnalyzer from '@/components/ProAnalyzer';
import { Lock, TrendingUp, Zap, Sparkles } from 'lucide-react';

export const metadata = { title: 'HookedAI Pro — AI Hook Analyzer' };

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const igUsername = cookieStore.get('ig_username')?.value;
  const isConnected = !!cookieStore.get('ig_token')?.value;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro</span>
        <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
          AI Hook<br />Analyzer
        </h1>
        <p className="text-[#888] text-sm mt-4 max-w-md">
          ИИ анализирует твои Reels и говорит какой хук добавить в каждое видео — чтобы зрители смотрели до конца.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error === 'denied' && 'Авторизация отклонена. Попробуй снова.'}
          {error === 'token' && 'Ошибка получения токена. Проверь App Secret в Meta Developer.'}
          {error === 'server' && 'Серверная ошибка. Попробуй позже.'}
        </div>
      )}

      {!isConnected ? (
        <ConnectPrompt />
      ) : (
        <ProAnalyzer username={igUsername} />
      )}
    </div>
  );
}

function ConnectPrompt() {
  return (
    <div className="border border-black/10 rounded-2xl p-8 bg-[#fafafa]">
      <div className="flex flex-col items-center text-center gap-6 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e8002d] to-[#ff6b35] flex items-center justify-center">
          <Sparkles size={28} className="text-white" />
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl uppercase">
            Подключи Instagram
          </h2>
          <p className="text-[#888] text-sm mt-2">
            Нужен Business или Creator аккаунт. Мы читаем только данные — никогда не постим.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2">
          {[
            { icon: TrendingUp, text: 'Анализ твоих последних Reels' },
            { icon: Zap, text: 'ИИ пишет готовый скрипт хука под каждое видео' },
            { icon: Lock, text: 'Read-only — мы ничего не публикуем' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white border border-black/8 rounded-xl px-4 py-3 text-left">
              <Icon size={15} className="text-[#e8002d] shrink-0" />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>

        <Link
          href="/api/auth/instagram"
          className="w-full bg-[#e8002d] text-white font-bold text-sm py-4 rounded-full hover:opacity-90 transition-opacity text-center"
        >
          Войти через Instagram →
        </Link>

        <p className="text-[10px] text-[#bbb]">
          Перенаправит на instagram.com для авторизации
        </p>
      </div>
    </div>
  );
}
