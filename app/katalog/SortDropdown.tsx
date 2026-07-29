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
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#d7e5f2] bg-white px-4 pr-10 text-[12px] font-semibold text-[#17233c] outline-none transition-all hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
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
