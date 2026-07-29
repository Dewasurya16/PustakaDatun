'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  isMasterCategoryName,
  MASTER_CATEGORY_NAMES,
} from '../../lib/categories';

export default function CategoryFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCat = searchParams.get('cat') || '';
  const currentCat = isMasterCategoryName(rawCat) ? rawCat : '';

  const handleChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('cat', cat);
    } else {
      params.delete('cat');
    }
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
        value={currentCat}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Pilih kategori buku"
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[#d7e5f2] bg-white px-4 pr-10 text-[12px] font-semibold text-[#17233c] outline-none transition-all hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
      >
        <option value="">Semua Kategori</option>
        {MASTER_CATEGORY_NAMES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
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
