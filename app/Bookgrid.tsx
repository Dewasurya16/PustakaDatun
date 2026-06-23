'use client';

import { useState, useMemo } from 'react';
import QRCodeModal from './dashboard/QRCodeModal';
import BorrowModal from './katalog/BorrowModal';
import Link from 'next/link';

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
  ringkasan?: string;   // ← field baru
  rating?: number;
  rating_count?: number;
  created_at?: string;
};

// ── Warna aksen per kategori ──────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'hukum pidana':  '#16213E',
  'hukum perdata': '#1e40af',
  'tata negara':   '#92400e',
  'administrasi':  '#5b21b6',
  'perundangan':   '#9d174d',
  'umum':          '#374151',
};
function getCategoryColor(cat?: string) {
  const lower = (cat || '').toLowerCase();
  return CATEGORY_COLORS[lower] || 'var(--green-main)';
}

// ── Komponen bintang rating ───────────────────────────────────
function StarRating({ rating, count }: { rating?: number; count?: number }) {
  if (!rating || rating === 0) return null;
  const r = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= r ? 'text-yellow-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {count ? <span className="text-[9px] text-slate-400 font-bold ml-0.5">({count})</span> : null}
    </div>
  );
}

// ── Kartu buku ────────────────────────────────────────────────
function BookCard({ book, isLoggedIn, userEmail }: { book: Book; isLoggedIn: boolean; userEmail?: string }) {
  const [expanded, setExpanded] = useState(false);
  const color = getCategoryColor(book.category);
  const hasRingkasan = !!book.ringkasan;

  return (
    <div className="reveal group bg-white rounded-[1.25rem] border border-slate-200 p-1 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Gradient top strip */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}80, transparent)` }}
      />
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category + stock */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border"
            style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
          >
            {book.category || 'Umum'}
          </span>
          <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${
            book.stock > 0
              ? 'text-blue-700 bg-blue-50 border-blue-100'
              : 'text-red-500 bg-red-50 border-red-100'
          }`}>
            {book.stock > 0 ? `${book.stock} Stok` : 'Habis'}
          </span>
        </div>

        {/* Judul */}
        <div>
          <Link href={`/buku/${book.id}`} className="group-hover:underline decoration-[var(--green-main)] decoration-2 underline-offset-2">
            <h3 className="font-black text-slate-800 text-[14px] leading-snug line-clamp-2 group-hover:text-[var(--green-main)] transition-colors">
              {book.title}
            </h3>
          </Link>
          {book.author && (
            <p className="text-[10px] text-slate-400 font-semibold mt-1">oleh {book.author}</p>
          )}
        </div>

        {/* Rating */}
        <StarRating rating={book.rating} count={book.rating_count} />

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2">
          {book.rak && (
            <div className="bg-slate-50 rounded-xl px-2.5 py-2 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rak</p>
              <p className="text-[11px] font-black text-slate-700">📍 {book.rak}</p>
            </div>
          )}
          {book.nomor_buku && (
            <div className="bg-slate-50 rounded-xl px-2.5 py-2 border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">No. Buku</p>
              <p className="text-[11px] font-black text-slate-700">{book.nomor_buku}</p>
            </div>
          )}
        </div>

        {/* Ringkasan / Summary */}
        {hasRingkasan && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ringkasan</p>
            <p className={`text-[11px] text-slate-600 leading-relaxed font-medium ${expanded ? '' : 'line-clamp-3'}`}>
              {book.ringkasan}
            </p>
            {book.ringkasan && book.ringkasan.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1.5 hover:text-blue-800 transition-colors"
              >
                {expanded ? '▲ Ringkas' : '▼ Selengkapnya'}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-slate-50">
          <QRCodeModal book={book} isLoggedIn={isLoggedIn} userEmail={userEmail} />

          {isLoggedIn && userEmail ? (
            <BorrowModal book={book} userEmail={userEmail} />
          ) : book.pdf_url ? (
            <a
              href={book.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
            >
              📖 Baca E-Book
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama BookGrid ───────────────────────────────────
export default function BookGrid({
  books,
  isLoggedIn,
  userEmail = '',
}: {
  books: Book[];
  isLoggedIn: boolean;
  userEmail?: string;
}) {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [sort,     setSort]     = useState<'terbaru' | 'abjad' | 'stok'>('terbaru');
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 12;

  const categories = useMemo(
    () => [...new Set(books.map((b) => b.category).filter(Boolean))] as string[],
    [books]
  );

  const filtered = useMemo(() => {
    let list = books;

    // Filter kategori
    if (category) list = list.filter((b) => b.category === category);

    // Filter pencarian (judul, penulis, kategori, ringkasan)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.ringkasan || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'abjad') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'stok') list = [...list].sort((a, b) => b.stock - a.stock);

    return list;
  }, [books, category, search, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 text-base">🔍</span>
          <input
            type="text"
            placeholder="Cari judul, penulis, atau ringkasan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-medium text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Kategori */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); resetPage(); }}
          className="h-11 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-[11px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as any); resetPage(); }}
          className="h-11 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-[11px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer"
        >
          <option value="terbaru">✨ Terbaru</option>
          <option value="abjad">🔤 A–Z</option>
          <option value="stok">📚 Stok Terbanyak</option>
        </select>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {filtered.length} buku ditemukan
          {search && <span className="text-blue-600"> · "{search}"</span>}
        </p>
        {totalPages > 1 && (
          <p className="text-[11px] font-bold text-slate-400">
            Halaman {page} / {totalPages}
          </p>
        )}
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-4xl mb-4">📚</p>
          <p className="font-black text-slate-500 text-base">Buku tidak ditemukan</p>
          <p className="text-[12px] text-slate-400 font-medium mt-2">Coba kata kunci atau filter yang berbeda</p>
          <button
            onClick={() => { setSearch(''); setCategory(''); }}
            className="mt-5 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-9 rounded-xl text-[11px] font-black transition-colors ${
                  p === page
                    ? 'bg-[#16213E] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))
          }

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}