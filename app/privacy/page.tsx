export const metadata = { title: 'Privacy Policy — HookedAI' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-extrabold text-3xl uppercase mb-2">Privacy Policy</h1>
      <p className="text-[#888] text-sm mb-10">Last updated: June 10, 2026</p>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">1. What we collect</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          We do not collect personal data or require registration. When you upload a video, it stays in your browser — we extract a few frames from it and send only those images to our AI for analysis. The video file itself never leaves your device. No accounts, no tracking, no cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">2. How we use your data</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          The extracted frames are sent to our AI solely to generate hook analysis and recommendations. We do not store, log, or share these frames after the analysis is returned. We do not sell any data to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">3. Browser storage</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          We store a small flag in your browser&apos;s localStorage to remember your free analysis and language preference. This data never leaves your device. Clear it anytime through your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">4. Hook Library</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          The Hook Library contains publicly available Instagram Reels data — captions, view counts, and usernames — from public accounts. We do not store private information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">5. Contact</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          Questions?{' '}
          <a href="mailto:anagashtay@gmail.com" className="underline hover:text-black transition-colors">
            anagashtay@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
