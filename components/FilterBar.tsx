'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function FilterBar({ niches, active }: { niches: string[]; active: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function select(niche: string) {
    const params = niche === 'all' ? '' : `?niche=${niche}`;
    router.push(`${pathname}${params}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {niches.map((n) => (
        <button
          key={n}
          onClick={() => select(n)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
            active === n
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-[#f5f5f5] text-[#888] hover:bg-[#e8e8e8] hover:text-[#0a0a0a]'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
