import ProAnalyzer from '@/components/ProAnalyzer';

export const metadata = { title: 'HookedAI Pro — AI Hook Analyzer' };

export default function ProPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro Feature</span>
        <h1 className="font-[family-name:var(--font-syne)] font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
          AI Hook<br />Analyzer
        </h1>
        <p className="text-[#888] text-sm mt-4 max-w-md">
          Введи Instagram username — ИИ проанализирует твои последние reels и скажет какой хук вставить в каждое видео чтобы поднять просмотры.
        </p>
      </div>
      <ProAnalyzer />
    </div>
  );
}
