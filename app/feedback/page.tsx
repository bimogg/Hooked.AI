'use client';
import { useEffect, useState } from 'react';
import { Star, Check, ShieldCheck } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';

const APPLE_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';

interface Review { id: string; message: string; rating: number | null; created_at: string }

export default function FeedbackPage() {
  const { lang } = useLang();
  const ru = lang === 'ru';
  const t = {
    title: ru ? 'Оставить отзыв' : 'Leave a review',
    sub: ru
      ? 'Полностью анонимно — мы не видим, кто это. Просто напиши честно, что думаешь 🙏'
      : "Completely anonymous — we can't see who you are. Just tell us honestly what you think 🙏",
    rate: ru ? 'Оценка (необязательно)' : 'Rating (optional)',
    placeholder: ru ? 'Что понравилось, что бесит, что добавить...' : 'What you liked, what annoys you, what to add...',
    send: ru ? 'Отправить анонимно' : 'Send anonymously',
    sending: ru ? 'Отправляю...' : 'Sending...',
    thanks: ru ? 'Спасибо! Отзыв отправлен 🙌' : 'Thank you! Review sent 🙌',
    thanksSub: ru ? 'Это правда помогает сделать продукт лучше.' : 'This genuinely helps make the product better.',
    another: ru ? 'Написать ещё' : 'Write another',
    reviewsTitle: ru ? 'Что говорят другие' : 'What others say',
    anon: ru ? 'Аноним' : 'Anonymous',
    errShort: ru ? 'Слишком коротко' : 'Too short',
    errFast: ru ? 'Подожди немного перед следующим' : 'Wait a bit before the next one',
    errGeneric: ru ? 'Что-то пошло не так' : 'Something went wrong',
  };

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/feedback').then(r => r.json()).then(d => setReviews(d.reviews ?? [])).catch(() => {});
  }, [sent]);

  const submit = async () => {
    setErr('');
    if (message.trim().length < 3) { setErr(t.errShort); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), rating: rating || undefined }),
      });
      if (res.status === 429) { setErr(t.errFast); return; }
      if (!res.ok) { setErr(t.errGeneric); return; }
      setSent(true); setMessage(''); setRating(0);
    } catch {
      setErr(t.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-5 py-12" style={{ fontFamily: APPLE_FONT }}>
      {sent ? (
        <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-[0_18px_60px_-24px_rgba(0,0,0,0.2)] p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#e8002d] flex items-center justify-center mx-auto mb-5">
            <Check size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">{t.thanks}</h1>
          <p className="text-[#666] text-sm mb-6">{t.thanksSub}</p>
          <button onClick={() => setSent(false)} className="text-sm font-semibold text-[#e8002d] hover:opacity-80">{t.another}</button>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t.title}</h1>
          <p className="inline-flex items-center gap-1.5 text-[13px] text-[#16a34a] font-medium mb-5">
            <ShieldCheck size={15} /> {t.sub}
          </p>

          <div className="rounded-[28px] border border-black/[0.06] bg-white shadow-[0_18px_60px_-24px_rgba(0,0,0,0.18)] p-6">
            <p className="text-xs uppercase tracking-wider text-[#888] mb-2">{t.rate}</p>
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} className="p-0.5">
                  <Star size={26} className={(hover || rating) >= n ? 'text-[#f5b301]' : 'text-black/15'} fill={(hover || rating) >= n ? '#f5b301' : 'none'} />
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder={t.placeholder}
              className="w-full border border-black/[0.1] rounded-2xl px-4 py-3 text-sm outline-none focus:border-black/40 resize-none mb-1"
            />
            <p className="text-[11px] text-[#aaa] text-right mb-3">{message.length}/1000</p>

            {err && <p className="text-xs text-red-500 mb-3">{err}</p>}

            <button
              onClick={submit}
              disabled={busy}
              className="w-full bg-[#e8002d] text-white font-bold text-sm py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? t.sending : t.send}
            </button>
          </div>
        </>
      )}

      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#888] mb-4">{t.reviewsTitle}</h2>
          <div className="flex flex-col gap-3">
            {reviews.map(r => (
              <div key={r.id} className="rounded-2xl border border-black/[0.06] bg-white p-4">
                {r.rating ? (
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={13} className={n <= r.rating! ? 'text-[#f5b301]' : 'text-black/15'} fill={n <= r.rating! ? '#f5b301' : 'none'} />
                    ))}
                  </div>
                ) : null}
                <p className="text-sm text-[#222] leading-relaxed">{r.message}</p>
                <p className="text-[11px] text-[#aaa] mt-2">— {t.anon}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
