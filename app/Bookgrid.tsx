'use client';

import { useState, useMemo } from 'react';
import QRCodeModal from './dashboard/QRCodeModal';
import BorrowModal from './katalog/BorrowModal';
import Link from 'next/link';
import { MASTER_CATEGORY_NAMES } from '../lib/categories';

// Field ringkasan diambil dari kolom `ringkasan` di tabel `books` Supabase.
// Pastikan kolom tersebut sudah ada: ALTER TABLE books ADD COLUMN ringkasan text;

type Book = {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  category?: string;
  nomor_buku?: string;
  stock: number;
  rak?: string;
  pdf_url?: string;
  ringkasan?: string;
  rating?: number;
  rating_count?: number;
  created_at?: string;
};

/* ── Category accent colors ───────────────────────────── */

function getCategoryColor(cat?: string) {
  const lower = (cat || '').toLowerCase();
  if (lower.includes('peraturan') || lower.includes('legislasi'))
    return '#1d4ed8';
  if (lower.includes('litigasi') || lower.includes('perkara'))
    return '#be123c';
  if (lower.includes('korporasi')) return '#d97706';
  if (lower.includes('pengadaan')) return '#15803d';
  if (lower.includes('perjanjian') || lower.includes('kerja sama'))
    return '#0f766e';
  if (
    lower.includes('pelatihan') ||
    lower.includes('paparan') ||
    lower.includes('rakernas')
  )
    return '#6d28d9';
  if (lower.includes('thl')) return '#b45309';
  return 'var(--green-main)';
}

/* ── Star rating ──────────────────────────────────────── */

function StarRating({
  rating,
  count,
}: {
  rating?: number;
  count?: number;
}) {
  if (!rating || rating === 0) return null;
  const r = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= r ? 'text-amber-400' : 'text-neutral-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count ? (
        <span className="ml-0.5 text-[10px] font-semibold text-neutral-400">
          ({count})
        </span>
      ) : null}
    </div>
  );
}

/* ── Book card ────────────────────────────────────────── */

function BookCard({
  book,
  isLoggedIn,
  userEmail,
}: {
  book: Book;
  isLoggedIn: boolean;
  userEmail?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = getCategoryColor(book.category);
  const hasRingkasan = !!book.ringkasan;
  const isOutOfStock = book.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:ring-1 hover:ring-neutral-200">
      {/* Gradient top strip */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}80, transparent)`,
        }}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Category + stock badges */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wider"
            style={{
              color,
              borderColor: `${color}25`,
              backgroundColor: `${color}08`,
              border: `1px solid ${color}20`,
            }}
          >
            {book.category || 'Umum'}
          </span>
          <span
            className={`rounded-md px-2 py-1 text-[10px] font-bold ${
              isOutOfStock
                ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/60'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
            }`}
          >
            {isOutOfStock ? 'Habis' : `${book.stock} Stok`}
          </span>
        </div>

        {/* Title */}
        <div>
          <Link
            href={`/buku/${book.id}`}
            className="group-hover:underline decoration-[var(--green-main)] decoration-2 underline-offset-2"
          >
            <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-[var(--green-main)]">
              {book.title}
            </h3>
          </Link>
          {book.author && (
            <p className="mt-1 text-[11px] font-medium text-neutral-400">
              oleh {book.author}
            </p>
          )}
        </div>

        {/* Rating */}
        <StarRating rating={book.rating} count={book.rating_count} />

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2">
          {book.rak && (
            <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 px-2.5 py-2">
              <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                Rak
              </p>
              <p className="text-[11px] font-bold text-neutral-700">
                📍 {book.rak}
              </p>
            </div>
          )}
          {book.nomor_buku && (
            <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 px-2.5 py-2">
              <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                No. Buku
              </p>
              <p className="text-[11px] font-bold text-neutral-700">
                {book.nomor_buku}
              </p>
            </div>
          )}
        </div>

        {/* Ringkasan / Summary */}
        {hasRingkasan && (
          <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
            <p className="mb-1.5 text-[8px] font-bold uppercase tracking-widest text-neutral-400">
              Ringkasan
            </p>
            <p
              className={`text-[11px] font-medium leading-relaxed text-neutral-600 ${
                isExpanded ? '' : 'line-clamp-3'
              }`}
            >
              {book.ringkasan}
            </p>
            {book.ringkasan && book.ringkasan.length > 120 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1.5 text-[10px] font-bold text-neutral-500 transition-colors hover:text-neutral-800"
              >
                {isExpanded ? '▲ Ringkas' : '▼ Selengkapnya'}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-auto flex flex-col gap-2 border-t border-neutral-50 pt-3">
          <QRCodeModal
            book={book}
            isLoggedIn={isLoggedIn}
            userEmail={userEmail}
          />

          {isLoggedIn && userEmail ? (
            <BorrowModal book={book} userEmail={userEmail} />
          ) : book.pdf_url ? (
            <a
              href={book.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-md"
            >
              📖 Baca E-Book
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Chevron icon for dropdowns ───────────────────────── */

function ChevronDown() {
  return (
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
      className="text-neutral-400"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ── Main BookGrid component ──────────────────────────── */

export default function BookGrid({
  books,
  isLoggedIn,
  userEmail = '',
}: {
  books: Book[];
  isLoggedIn: boolean;
  userEmail?: string;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'terbaru' | 'abjad' | 'stok'>(
    'terbaru',
  );
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let list = books;

    if (category)
      list = list.filter((b) => b.category === category);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author || '').toLowerCase().includes(q) ||
          (b.category || '').toLowerCase().includes(q) ||
          (b.ringkasan || '').toLowerCase().includes(q),
      );
    }

    if (sort === 'abjad')
      list = [...list].sort((a, b) =>
        a.title.localeCompare(b.title),
      );
    else if (sort === 'stok')
      list = [...list].sort((a, b) => b.stock - a.stock);

    return list;
  }, [books, category, search, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* ── Filter bar ── */}
      <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
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
            </span>
            <input
              type="text"
              placeholder="Cari judul, penulis, atau ringkasan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50/60 pl-10 pr-4 text-[13px] font-medium text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5"
            />
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                resetPage();
              }}
              className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 pr-10 text-[13px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 sm:w-auto sm:min-w-[180px]"
            >
              <option value="">Semua Kategori</option>
              {MASTER_CATEGORY_NAMES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDown />
            </span>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(
                  e.target.value as 'terbaru' | 'abjad' | 'stok',
                );
                resetPage();
              }}
              className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 pr-10 text-[13px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 sm:w-auto sm:min-w-[160px]"
            >
              <option value="terbaru">✨ Terbaru</option>
              <option value="abjad">🔤 A–Z</option>
              <option value="stok">📚 Stok Terbanyak</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDown />
            </span>
          </div>
        </div>
      </div>

      {/* ── Result count ── */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-neutral-400">
          {filtered.length} buku ditemukan
          {search && (
            <span className="text-neutral-600"> · &quot;{search}&quot;</span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-[12px] font-medium text-neutral-400">
            Halaman {page} / {totalPages}
          </p>
        )}
      </div>

      {/* ── Grid ── */}
      {paginated.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-20 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-4 text-base font-semibold text-neutral-600">
            Buku tidak ditemukan
          </p>
          <p className="mt-2 text-[12px] font-medium text-neutral-400">
            Coba kata kunci atau filter yang berbeda
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('');
            }}
            className="mt-5 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-[11px] font-bold text-neutral-700 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isLoggedIn={isLoggedIn}
              userEmail={userEmail}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
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
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2 text-[13px] font-semibold transition-all ${
                  p === page
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {p}
              </button>
            ))}

          <button
            onClick={() =>
              setPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={page === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Halaman selanjutnya"
          >
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
          </button>
        </div>
      )}
    </div>
  );
}
