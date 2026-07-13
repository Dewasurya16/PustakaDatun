'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'terbaru';

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    const queryString = params.toString();
    router.push(
      queryString ? `${pathname}?${queryString}` : pathname,
      { scroll: false },
    );
  };

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={(event) => handleSort(event.target.value)}
        aria-label="Urutkan katalog"
        className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 pr-10 text-[13px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5"
      >
        <option value="terbaru">Terbaru</option>
        <option value="abjad">Abjad A–Z</option>
        <option value="stok">Stok Terbanyak</option>
      </select>

      {/* Chevron icon */}
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
