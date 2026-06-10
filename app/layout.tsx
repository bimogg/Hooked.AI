import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'HookedAI — Stop The Drop',
  description: 'Instagram analytics for creators — find winning hooks free, decode why your Reels lose viewers with Pro.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#0a0a0a]">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
