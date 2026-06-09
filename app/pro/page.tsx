import { cookies } from 'next/headers';
import ProAnalyzer from '@/components/ProAnalyzer';

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
          ИИ анализирует твои Reels и пишет готовый скрипт хука для каждого видео — чтобы зрители смотрели до конца.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Ошибка авторизации. Попробуй ещё раз.
        </div>
      )}

      <ProAnalyzer isConnected={isConnected} username={igUsername} />
    </div>
  );
}
