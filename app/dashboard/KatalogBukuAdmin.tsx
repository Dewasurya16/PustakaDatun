'use client';

import { useMemo, useState } from 'react';
import AddBookModal from './AddBookModal';
import BacaPDFModal from './BacaPDFModal';
import DeleteBookButton from './DeleteBookButton';
import EditBookModal from './EditBookModal';
import ExportKatalogBuku from './ExportKatalogBuku';
import ImportBukuModal from './ImportBukuModal';
import QRCodeModal from './QRCodeModal';
import { MASTER_CATEGORY_NAMES } from '../../lib/categories';
import CatalogBookCard, {
  type CatalogBook,
} from '../components/CatalogBookCard';

type KatalogProps = {
  books: CatalogBook[];
  totalBooks?: number;
  userEmail?: string;
};

function stockBucket(stock: number) {
  if (stock <= 0) return 'Habis';
  if (stock <= 3) return 'Terbatas';
  return 'Tersedia';
}

/* ── Chevron icon ─────────────────────────────────────── */

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

export default function KatalogBukuAdmin({
  books,
  totalBooks,
  userEmail = '',
}: KatalogProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return books.filter((book) => {
      const matchesQuery =
        !q ||
        book.title?.toLowerCase().includes(q) ||
        book.author?.toLowerCase().includes(q) ||
        book.publisher?.toLowerCase().includes(q) ||
        book.nomor_buku?.toLowerCase().includes(q);
      const matchesCategory =
        !catFilter || book.category === catFilter;
      const matchesStock =
        !stockFilter ||
        stockBucket(book.stock || 0) === stockFilter;
      return matchesQuery && matchesCategory && matchesStock;
    });
  }, [books, search, catFilter, stockFilter]);

  const availableCount = filtered.filter(
    (book) => stockBucket(book.stock || 0) === 'Tersedia',
  ).length;
  const limitedCount = filtered.filter(
    (book) => stockBucket(book.stock || 0) === 'Terbatas',
  ).length;
  const emptyCount = filtered.filter(
    (book) => stockBucket(book.stock || 0) === 'Habis',
  ).length;

  const exportBooks = filtered.map((book) => ({
    ...book,
    author: book.author || undefined,
    publisher: book.publisher || undefined,
    category: book.category || undefined,
    nomor_buku: book.nomor_buku || undefined,
    rak: book.rak || undefined,
    pdf_url: book.pdf_url || undefined,
    ringkasan: book.ringkasan || undefined,
  }));

  return (
    <section className="min-w-0 overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
      {/* ── Filter bar ── */}
      <div className="border-b border-neutral-100 bg-white px-4 py-5 sm:px-6 xl:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_minmax(200px,0.78fr)_minmax(160px,0.58fr)]">
          {/* Search */}
          <div className="relative min-w-0">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, penulis, ISBN..."
              className="h-11 w-full min-w-0 rounded-lg border border-neutral-200 bg-neutral-50/60 pl-11 pr-4 text-[13px] font-medium text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5"
            />
          </div>

          {/* Category */}
          <div className="relative min-w-0">
            <select
              value={catFilter}
              onChange={(event) => setCatFilter(event.target.value)}
              className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 pr-10 text-[13px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5"
            >
              <option value="">Semua Kategori</option>
              {MASTER_CATEGORY_NAMES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDown />
            </span>
          </div>

          {/* Stock filter */}
          <div className="relative min-w-0">
            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(event.target.value)
              }
              className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 pr-10 text-[13px] font-medium text-neutral-800 outline-none transition-all focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5"
            >
              <option value="">Semua Stok</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Terbatas">Terbatas</option>
              <option value="Habis">Habis</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDown />
            </span>
          </div>
        </div>

        {/* ── Stats + actions ── */}
        <div className="mt-5 grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-center">
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-neutral-500">
            <span>
              <strong className="text-neutral-950">
                {totalBooks ?? books.length}
              </strong>{' '}
              total buku
            </span>
            <span>
              <strong className="text-neutral-950">
                {filtered.length}
              </strong>{' '}
              tampil
            </span>
            <span>
              <strong className="text-emerald-700">
                {availableCount}
              </strong>{' '}
              tersedia
            </span>
            <span>
              <strong className="text-amber-700">
                {limitedCount}
              </strong>{' '}
              terbatas
            </span>
            <span>
              <strong className="text-rose-700">{emptyCount}</strong>{' '}
              habis
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end xl:gap-2">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCatFilter('');
                setStockFilter('');
              }}
              className="h-10 w-full min-w-[120px] rounded-lg bg-[#27b8a7] px-4 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1ea393] hover:shadow-md xl:w-auto"
            >
              Reset Filter
            </button>
            <div className="min-w-0 xl:w-[180px]">
              <AddBookModal />
            </div>
            <div className="min-w-0 xl:w-auto">
              <ImportBukuModal />
            </div>
            <div className="min-w-0 xl:w-auto">
              <ExportKatalogBuku books={exportBooks} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Book grid ── */}
      <div className="px-4 py-8 sm:px-6 xl:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center">
            <p className="text-4xl">📚</p>
            <h3 className="mt-4 text-lg font-semibold text-neutral-950">
              Tidak ada buku yang cocok
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Coba kata kunci atau filter lain.
            </p>
          </div>
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((book, index) => (
              <CatalogBookCard
                key={book.id}
                book={book}
                index={index}
                isAdmin
                primaryAction={
                  <BacaPDFModal
                    url={book.pdf_url || ''}
                    compact
                  />
                }
                secondaryAction={
                  <QRCodeModal
                    book={book}
                    isLoggedIn={true}
                    userEmail={userEmail}
                    compact
                  />
                }
                adminActions={
                  <>
                    <EditBookModal book={book} compact />
                    <DeleteBookButton
                      bookId={book.id}
                      bookTitle={book.title}
                      compact
                    />
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
