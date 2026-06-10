import VideoAnalyzer from '@/components/VideoAnalyzer';

export const metadata = { title: 'HookedAI Pro — AI Hook Analyzer' };

export default function ProPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e8002d] font-bold">Pro</span>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl uppercase leading-none mt-2">
          AI Hook<br />Analyzer
        </h1>
        <p className="text-[#888] text-sm mt-3 max-w-md">
          Загрузи Reel — ИИ скажет почему зрители уходят в первые секунды и покажет реальные видео с хуками которые работают. Скопируй и сними так же.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-[#888]">1 видео бесплатно · без регистрации</span>
        </div>
      </div>
      <VideoAnalyzer />
    </div>
  );
}
