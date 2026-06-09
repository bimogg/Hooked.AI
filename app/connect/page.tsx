import { Lock, TrendingUp, Zap } from 'lucide-react';

export default function ConnectPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 bg-[#e8002d] rounded-2xl flex items-center justify-center mx-auto mb-8">
        <span className="text-white font-black text-xl tracking-tight">IG</span>
      </div>
      <h1 className="font-display font-extrabold text-3xl uppercase mb-4">
        Connect Instagram
      </h1>
      <p className="text-[#888] text-sm leading-relaxed mb-10 max-w-sm mx-auto">
        Link your Business or Creator account. We'll read your retention graph and tell you exactly where viewers drop — and what hook to add.
      </p>
      <div className="grid grid-cols-1 gap-3 mb-10 text-left">
        {[
          { icon: TrendingUp, text: 'See your retention graph second by second' },
          { icon: Zap, text: 'AI detects your exact drop points' },
          { icon: Lock, text: 'Read-only access — we never post for you' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 bg-[#f5f5f5] rounded-xl px-4 py-3">
            <Icon size={16} className="text-[#e8002d] shrink-0" />
            <span className="text-sm">{text}</span>
          </div>
        ))}
      </div>
      <a href="/api/auth/instagram"
        className="inline-block bg-[#e8002d] text-white font-bold text-sm px-10 py-4 rounded-full hover:opacity-90 transition-opacity">
        Connect with Instagram →
      </a>
      <p className="text-[#888] text-xs mt-4">
        Requires Business or Creator account. <a href="/" className="underline">Back to library</a>
      </p>
    </div>
  );
}
