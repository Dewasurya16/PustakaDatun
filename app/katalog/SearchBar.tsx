'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const latestTerm = useRef(searchTerm);

  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== latestTerm.current) {
      setSearchTerm(urlQuery);
      latestTerm.current = urlQuery;
    }
  }, [searchParams]);

  useEffect(() => {
    latestTerm.current = searchTerm;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      const queryString = params.toString();
      router.replace(
        queryString ? `${pathname}?${queryString}` : pathname,
        { scroll: false },
      );
    }, 450);

    return () => clearTimeout(timer);
    // searchParams intentionally omitted to avoid replacing the URL on every navigation sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, pathname, router]);

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <input
        type="text"
        placeholder="Cari judul, penulis..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#d7e5f2] bg-white pl-11 pr-10 text-[12px] font-semibold text-[#17233c] outline-none transition-all placeholder:font-medium placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70"
      />

      {/* Clear button */}
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-300 transition-colors hover:text-neutral-600"
          aria-label="Hapus pencarian"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
