'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import EditBookModal from './EditBookModal';
import DeleteBookButton from './DeleteBookButton';
import QRCodeModal from './QRCodeModal';

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
  bidang_bb?: string;
  ringkasan?: string;
  rating?: number;
  rating_count?: number;
  created_at?: string;
};

const ITEMS_PER_PAGE = 12;

// ── Skeleton Card ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded-md w-4/5" />
          <div className="h-3 bg-slate-100 rounded-md w-2/5" />
        </div>
        <div className="h-6 w-14 bg-slate-200 rounded-lg flex-shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
        <div className="h-5 w-14 bg-slate-100 rounded-full" />
      </div>
      <div className="h-8 w-full bg-slate-100 rounded-xl" />
      <div className="flex gap-2 pt-1 border-t border-slate-50">
        <div className="h-8 flex-1 bg-slate-200 rounded-xl" />
        <div className="h-8 flex-1 bg-slate-100 rounded-xl" />
        <div className="h-8 w-8 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Book Card ──────────────────────────────────────────────────
function BookCard({ book, index, page, perPage, userEmail = '' }: { book: Book; index: number; page: number; perPage: number; userEmail?: string }) {
  const globalNo = (page - 1) * perPage + index + 1;
  const stockOk  = book.stock > 0;

  return (
    <div className={`group relative bg-white rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col
      ${stockOk ? 'border-slate-100 hover:border-blue-200/70' : 'border-red-100/60 bg-red-50/10'}`}>

      {/* Header strip */}
      <div className={`h-1 w-full ${stockOk ? 'bg-gradient-to-r from-blue-400 to-[#16213E]' : 'bg-gradient-to-r from-red-300 to-red-400'}`} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Top row: nomor + stok */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[9px] font-black text-slate-300 tabular-nums mt-0.5">#{globalNo}</span>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border flex-shrink-0 ${
            stockOk ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {book.stock} pcs
          </span>
        </div>

        {/* Judul */}
        <div className="flex-1">
          <h3 className="text-[12px] font-black text-slate-800 leading-snug line-clamp-2 group-hover:text-[#16213E] transition-colors">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{book.author}</p>
          )}
          {book.nomor_buku && (
            <p className="text-[9px] text-slate-300 font-bold mt-0.5">ISBN: {book.nomor_buku}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {book.category && (
            <span className="text-[8px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {book.category}
            </span>
          )}
          {book.rak && (
            <span className="text-[8px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
              📍 {book.rak}
            </span>
          )}
          {book.pdf_url ? (
            <span className="text-[8px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
              📄 E-Book
            </span>
          ) : (
            <span className="text-[8px] font-black text-yellow-600 bg-yellow-50 border border-yellow-100 px-2 py-0.5 rounded-full uppercase">
              ⚠ No PDF
            </span>
          )}
        </div>

        {/* Ringkasan */}
        {book.ringkasan && (
          <p className="text-[9px] text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
            {book.ringkasan}
          </p>
        )}

        {/* Rating */}
        {(book.rating_count ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-[9px] font-black text-slate-600">{Number(book.rating).toFixed(1)}</span>
            <span className="text-[9px] text-slate-400">({book.rating_count})</span>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 pb-4 pt-0">
        <div className="border-t border-slate-100 pt-3 flex items-center gap-1.5">
          <div className="flex-1">
            <QRCodeModal book={book} isLoggedIn={true} userEmail={userEmail} />
          </div>
          <EditBookModal book={book} />
          <DeleteBookButton bookId={book.id} bookTitle={book.title} />
        </div>
      </div>
    </div>
  );
}

export default function AdminBooksTable({ books, userEmail = '' }: { books: Book[]; userEmail?: string }) {
  const [search,       setSearch]      = useState('');
  const [catFilter,    setCatFilter]   = useState('');
  const [page,         setPage]        = useState(1);
  const [sortKey,      setSortKey]     = useState<'title' | 'stock' | 'created_at'>('created_at');
  const [sortDir,      setSortDir]     = useState<'asc' | 'desc'>('desc');
  const [isTransition, setIsTransition] = useState(false);
  const firstRender = useRef(true);

  const categories = useMemo(
    () => Array.from(new Set(books.map(b => b.category).filter(Boolean))) as string[],
    [books]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return books
      .filter(b => {
        if (catFilter && b.category !== catFilter) return false;
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          (b.author?.toLowerCase().includes(q) ?? false) ||
          (b.category?.toLowerCase().includes(q) ?? false) ||
          (b.nomor_buku?.toLowerCase().includes(q) ?? false) ||
          (b.publisher?.toLowerCase().includes(q) ?? false) ||
          (b.ringkasan?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        let valA: any = a[sortKey] ?? '';
        let valB: any = b[sortKey] ?? '';
        if (sortKey === 'stock') { valA = Number(valA); valB = Number(valB); }
        else { valA = String(valA).toLowerCase(); valB = String(valB).toLowerCase(); }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [books, search, catFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const triggerTransition = () => {
    setIsTransition(true);
    setTimeout(() => setIsTransition(false), 300);
  };

  const changePage = (p: number) => {
    triggerTransition();
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSort = (key: typeof sortKey) => {
    triggerTransition();
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    triggerTransition();
    setPage(1);
  }, [search, catFilter]);

  // Stat summary
  const totalStock = books.reduce((s, b) => s + (b.stock || 0), 0);
  const outOfStock = books.filter(b => b.stock === 0).length;
  const withPDF    = books.filter(b => b.pdf_url).length;

  return (
    <div className="space-y-4">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Judul', value: books.length, icon: '📚', color: 'bg-slate-50 border-slate-100' },
          { label: 'Total Stok',  value: totalStock,  icon: '📦', color: 'bg-blue-50 border-blue-100' },
          { label: 'Stok Habis', value: outOfStock,   icon: '⚠️',  color: 'bg-red-50 border-red-100'     },
          { label: 'Ada E-Book', value: withPDF,      icon: '📄', color: 'bg-blue-50 border-blue-100'   },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-xl px-4 py-3 flex items-center gap-3`}>
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-lg font-black text-slate-800 leading-none">{s.value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari judul, penulis, klasifikasi, ISBN, ringkasan..."
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#16213E] transition-all placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xl leading-none">×
            </button>
          )}
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setCatFilter(''); setPage(1); }}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                !catFilter ? 'bg-[#16213E] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCatFilter(cat); setPage(1); }}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  catFilter === cat ? 'bg-[#16213E] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort buttons */}
          <div className="ml-auto flex items-center gap-1.5">
            {([
              { key: 'created_at', label: 'Terbaru' },
              { key: 'title',      label: 'A–Z'     },
              { key: 'stock',      label: 'Stok'    },
            ] as const).map(s => (
              <button
                key={s.key}
                onClick={() => toggleSort(s.key)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  sortKey === s.key
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}{sortKey === s.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Menampilkan {filtered.length} dari {books.length} buku
            {catFilter && <span className="text-[#16213E]"> · {catFilter}</span>}
          </p>
          {totalPages > 1 && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hal {safePage}/{totalPages}
            </p>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-sm font-black text-slate-400">Tidak ada buku yang cocok</p>
          <p className="text-[10px] text-slate-300 font-medium mt-1">Coba kata kunci atau filter lain</p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-300"
          style={{ opacity: isTransition ? 0.3 : 1 }}
        >
          {isTransition
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)
            : pageSlice.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
                page={safePage}
                perPage={ITEMS_PER_PAGE}
                userEmail={userEmail}
              />
            ))
          }
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Buku {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={safePage <= 1}
                onClick={() => changePage(Math.max(1, safePage - 1))}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >← Prev</button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => totalPages <= 7 ? true : p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-slate-400 text-xs px-0.5">…</span>
                      )}
                      <button
                        onClick={() => changePage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          p === safePage ? 'bg-[#16213E] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >{p}</button>
                    </span>
                  ))}
              </div>

              <button
                disabled={safePage >= totalPages}
                onClick={() => changePage(Math.min(totalPages, safePage + 1))}
                className="px-4 py-2 bg-[#16213E] text-white rounded-xl text-xs font-bold hover:bg-[#123023] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >Next →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}