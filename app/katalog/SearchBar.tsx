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
        className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50/60 pl-11 pr-10 text-[13px] font-medium text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5"
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
