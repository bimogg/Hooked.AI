export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-bold text-3xl mb-2">Privacy Policy</h1>
      <p className="text-[#888] text-sm mb-10">Last updated: June 8, 2026</p>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">1. What we collect</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          When you connect your Instagram account, we access your public profile, media list, and post insights (views, reach, engagement) through the Instagram Graph API. We do not collect passwords or private messages.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">2. How we use your data</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          Your Instagram data is used solely to provide analytics and hook recommendations within Hooked AI. We analyze your Reels performance to show you where viewers drop off and suggest improvements. We do not sell your data to third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">3. Data storage</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          Data is stored securely in Supabase. Your Instagram access token is stored encrypted and used only to fetch your analytics. You can delete your data at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">4. Data deletion</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          To delete all your data, email us at <a href="mailto:anagashtay@gmail.com" className="underline">anagashtay@gmail.com</a> with the subject "Delete my data". We will remove all your information within 7 days. You can also disconnect your Instagram account at any time from your dashboard.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">5. Instagram permissions</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          We request the following Instagram permissions: <strong>instagram_basic</strong> (to read your profile and media) and <strong>instagram_manage_insights</strong> (to access post performance data). We only request permissions necessary to provide our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">6. Contact</h2>
        <p className="text-[#444] text-sm leading-relaxed">
          Questions? Email us at <a href="mailto:anagashtay@gmail.com" className="underline">anagashtay@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
