export const metadata = { title: 'Privacy Policy — HookedAI' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-extrabold text-3xl uppercase mb-2">Privacy Policy</h1>
      <p className="text-[#888] text-sm mb-10">Last updated: June 10, 2026</p>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">1. What we collect</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          We do not collect personal data or require registration. When you upload a video, the file is processed locally in your browser — we extract a few frames (screenshots) from the first 3 seconds and send only those images to our AI for analysis. The video file itself is never uploaded to our servers. We store a single flag in your browser&apos;s localStorage to track whether you have used your free analysis.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">2. How we use your data</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          The extracted video frames are sent to the Anthropic API (Claude AI) solely to generate a hook analysis and recommendations. We do not store, log, or share these frames after the analysis is returned. We do not sell any data to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">3. localStorage</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          We store one key in your browser&apos;s localStorage (<code className="bg-[#f5f5f5] px-1 rounded text-xs">hooked_free_used</code>) to remember that you have used your free analysis. This data never leaves your device. You can clear it anytime by clearing your browser storage.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">4. Hook Library</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          The Hook Library contains publicly available Instagram Reels data (captions, view counts, usernames) collected from public accounts. We do not store private information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-base mb-2">5. Contact</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          Questions? Email us at{' '}
          <a href="mailto:anagashtay@gmail.com" className="underline hover:text-black transition-colors">
            anagashtay@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
