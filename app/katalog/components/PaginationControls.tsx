"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
};

/**
 * Build a compact page-number list: always shows first, last, and a
 * window of ±1 around the current page, with `null` for ellipsis gaps.
 */
function buildPageNumbers(
  current: number,
  total: number,
): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  if (windowStart > 2) pages.push(null);
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (windowEnd < total - 1) pages.push(null);

  pages.push(total);
  return pages;
}

/* ── Chevron icons ────────────────────────────────────── */

function ChevronLeft() {
  return (
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ── Component ────────────────────────────────────────── */

export default function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [searchParams]);

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  const baseBtnClass =
    'inline-flex items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-200';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Loading indicator */}
      {isNavigating && (
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 animate-pulse">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
          Memuat...
        </div>
      )}

      <nav
        className="flex items-center gap-1.5"
        aria-label="Pagination"
      >
        {/* Prev button */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            onClick={() => setIsNavigating(true)}
            className={`${baseBtnClass} h-9 w-9 border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50`}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft />
          </Link>
        ) : (
          <button
            disabled
            className={`${baseBtnClass} h-9 w-9 border border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed`}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === null ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-6 items-center justify-center text-[13px] text-neutral-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              onClick={() => setIsNavigating(true)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`${baseBtnClass} h-9 min-w-[2.25rem] px-2 ${
                page === currentPage
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {page}
            </Link>
          ),
        )}

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            onClick={() => setIsNavigating(true)}
            className={`${baseBtnClass} h-9 w-9 border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50`}
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight />
          </Link>
        ) : (
          <button
            disabled
            className={`${baseBtnClass} h-9 w-9 border border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed`}
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight />
          </button>
        )}
      </nav>

      {/* Page info */}
      <p className="text-[12px] font-medium text-neutral-400">
        Halaman {currentPage} dari {totalPages}
      </p>
    </div>
  );
}