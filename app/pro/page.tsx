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
          Ошибка входа. Попробуй снова.
        </div>
      )}

      {!isConnected ? (
        <div className="border border-black/10 rounded-2xl p-8 bg-[#fafafa]">
          <div className="flex flex-col items-center text-center gap-6 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-syne)] font-bold text-xl uppercase">
                Подключи аккаунт
              </h2>
              <p className="text-[#888] text-sm mt-2">
                Войди → тебя вернёт обратно сюда → ИИ сразу анализирует твои Reels.
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
              className="w-full text-white font-bold text-sm py-4 rounded-full hover:opacity-90 transition-opacity text-center"
              style={{ background: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)' }}
            >
              Войти через Instagram →
            </Link>
          </div>
        </div>
      ) : (
        <ProConnected name={fbName} />
      )}
    </div>
  );
}
