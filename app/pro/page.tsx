import { cookies } from 'next/headers';
import Link from 'next/link';
import ProAnalyzer from '@/components/ProAnalyzer';
import { Lock, TrendingUp, Zap, Sparkles, LogOut } from 'lucide-react';

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
      <div className="mb-10 flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro</span>
          <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
            AI Hook<br />Analyzer
          </h1>
          <p className="text-[#888] text-sm mt-3 max-w-md">
            ИИ анализирует твои Reels и пишет готовый скрипт хука для каждого видео.
          </p>
        </div>
        {isConnected && (
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center gap-1.5 text-[11px] text-[#888] hover:text-red-600 transition-colors mt-2">
              <LogOut size={13} /> Выйти
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error === 'denied' && 'Авторизация отклонена. Попробуй снова.'}
          {error === 'token' && 'Ошибка обмена токена. Проверь App Secret в Vercel.'}
          {error === 'config' && 'Redirect URI не зарегистрирован в Meta.'}
          {!['denied','token','config'].includes(error) && 'Ошибка. Попробуй снова.'}
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
                Подключи Instagram
              </h2>
              <p className="text-[#888] text-sm mt-2">
                Войди через Instagram — тебя вернёт обратно сюда с готовым анализом.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              {[
                { icon: TrendingUp, text: 'Анализ твоих последних Reels' },
                { icon: Zap, text: 'ИИ пишет готовый скрипт хука для каждого видео' },
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
              Перейдёшь на instagram.com → авторизуешься → вернёшься сюда автоматически
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-2xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e8002d] to-[#ff6b35] flex items-center justify-center text-white text-xs font-bold">
              {igUsername?.[0]?.toUpperCase() ?? 'IG'}
            </div>
            <div>
              <p className="text-sm font-medium">@{igUsername}</p>
              <p className="text-[10px] text-[#888]">Подключён · Instagram</p>
            </div>
          </div>
          <ProAnalyzer username={igUsername ?? ''} />
        </div>
      )}
    </div>
  );
}
