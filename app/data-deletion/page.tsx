export default function DataDeletionPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-bold text-3xl mb-2">Data Deletion</h1>
      <p className="text-[#888] text-sm mb-10">How to delete your data from Hooked AI</p>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">Request data deletion</h2>
        <p className="text-[#444] text-sm leading-relaxed mb-4">
          To delete all your personal data and Instagram information from Hooked AI, send an email to:
        </p>
        <a
          href="mailto:anagashtay@gmail.com?subject=Delete my data"
          className="inline-block bg-black text-white text-sm font-bold px-6 py-3 rounded-full hover:opacity-80 transition-opacity"
        >
          anagashtay@gmail.com
        </a>
        <p className="text-[#888] text-xs mt-4">
          Use subject line: "Delete my data". We will process your request within 7 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-bold text-lg mb-2">What gets deleted</h2>
        <ul className="text-[#444] text-sm leading-relaxed list-disc list-inside space-y-1">
          <li>Your Instagram access token</li>
          <li>Your Reels analytics data</li>
          <li>Your account information</li>
        </ul>
      </section>
    </div>
  );
}
