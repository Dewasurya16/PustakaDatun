'use client';

import { useState, useMemo } from 'react';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import DeleteBookButton from './DeleteBookButton';
import BacaPDFModal from './BacaPDFModal';
import QRCodeModal from './QRCodeModal';
import ExportKatalogBuku from './ExportKatalogBuku';
import ImportBukuModal from './ImportBukuModal';

/* ── Cover palette (12 warna) ─────────────────────────────────────────── */
const COVERS = [
  ['#16213E', '#52B788'], ['#1D3557', '#457B9D'], ['#6B2D8B', '#C9A0DC'],
  ['#7B2D00', '#D4956A'], ['#2D4739', '#74C69D'], ['#0A3D62', '#60A3D9'],
  ['#4A1942', '#C9579C'], ['#1A3A1A', '#76B947'], ['#5C3317', '#C4813B'],
  ['#1B3A5C', '#5899D8'], ['#3B1F2B', '#C06D8A'], ['#1C3D2E', '#4CA37A'],
];
function coverFor(i: number) { return COVERS[Math.abs(i) % COVERS.length]; }

function stokLabel(stock: number): 'Tersedia' | 'Terbatas' | 'Habis' {
  if (stock > 3) return 'Tersedia';
  if (stock > 0) return 'Terbatas';
  return 'Habis';
}

const PER_PAGE = 12;

interface KatalogProps { books: any[]; totalBooks?: number; userEmail?: string; }

export default function KatalogBukuAdmin({ books, totalBooks, userEmail = '' }: KatalogProps) {
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [stokFilter, setStokFilter] = useState('');
  const [view,       setView]       = useState<'grid' | 'list'>('grid');
  const [page,       setPage]       = useState(1);

  const categories = useMemo(() => {
    const set = new Set(books.map(b => b.category).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [books]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return books.filter(b => {
      const mq = !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q);
      const mc = !catFilter  || b.category === catFilter;
      const ms = !stokFilter || stokLabel(b.stock) === stokFilter;
      return mq && mc && ms;
    });
  }, [books, search, catFilter, stokFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const slice      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const cTersedia = filtered.filter(b => stokLabel(b.stock) === 'Tersedia').length;
  const cTerbatas = filtered.filter(b => stokLabel(b.stock) === 'Terbatas').length;
  const cHabis    = filtered.filter(b => stokLabel(b.stock) === 'Habis').length;

  function resetPage() { setPage(1); }

  function stokBadgeCls(label: string, dark = false) {
    if (label === 'Tersedia') return dark
      ? 'bg-blue-500/20 text-blue-100 border-blue-400/30'
      : 'bg-blue-50 text-blue-700 border-blue-200';
    if (label === 'Terbatas') return dark
      ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return dark
      ? 'bg-rose-500/20 text-rose-100 border-rose-400/30'
      : 'bg-rose-50 text-rose-600 border-rose-200';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div
        className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center
                   justify-between gap-3"
        style={{ background: 'linear-gradient(135deg,#16213E,#2D6A4F)' }}
      >
        <div>
          <h2 className="text-white font-black text-base flex items-center gap-2">
            📚 Database Katalog Buku
          </h2>
          <p className="text-white/60 text-[11px] mt-0.5">
            {totalBooks ?? books.length} judul terdaftar · Kelola stok, rak, dan cetak QR Code
          </p>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-2 flex-wrap">
          <ImportBukuModal />
          <ExportKatalogBuku books={filtered} />
          <AddBookModal />
        </div>
      </div>

      {/* ── TOOLBAR ────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row flex-wrap gap-2
                      items-stretch sm:items-center border-b border-slate-100 bg-white">
        {/* Search — full width on mobile */}
        <div className="relative w-full sm:flex-1 sm:min-w-[160px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base select-none">⌕</span>
          <input
            type="text"
            placeholder="Cari judul, penulis…"
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl
                       bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white
                       transition-colors"
          />
        </div>

        {/* Filters + toggle row */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); resetPage(); }}
            className="flex-1 sm:flex-none px-3 py-2.5 text-xs border border-slate-200 rounded-xl
                       bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer
                       text-slate-700 min-w-[120px]"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={stokFilter}
            onChange={e => { setStokFilter(e.target.value); resetPage(); }}
            className="flex-1 sm:flex-none px-3 py-2.5 text-xs border border-slate-200 rounded-xl
                       bg-slate-50 focus:outline-none focus:border-blue-400 cursor-pointer
                       text-slate-700 min-w-[110px]"
          >
            <option value="">Semua Stok</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Terbatas">Terbatas</option>
            <option value="Habis">Habis</option>
          </select>

          {/* View toggle */}
          <div className="flex gap-0.5 bg-slate-100 rounded-xl p-0.5 border border-slate-200 flex-shrink-0">
            <button
              onClick={() => setView('grid')}
              title="Tampilan Grid"
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all ${
                view === 'grid'
                  ? 'bg-[#16213E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >⊞</button>
            <button
              onClick={() => setView('list')}
              title="Tampilan List"
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all ${
                view === 'list'
                  ? 'bg-[#16213E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >☰</button>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-2.5 flex flex-wrap gap-3 sm:gap-5 bg-slate-50/70
                      border-b border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          Tersedia: <strong className="text-slate-700 ml-1">{cTersedia}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          Terbatas: <strong className="text-slate-700 ml-1">{cTerbatas}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
          Habis: <strong className="text-slate-700 ml-1">{cHabis}</strong>
        </span>
        <span className="ml-auto">
          Tampil: <strong className="text-slate-700 ml-1">{filtered.length}</strong> buku
        </span>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          GRID VIEW
      ════════════════════════════════════════════════════════════════ */}
      {view === 'grid' ? (
        <div className="p-3 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                        lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {slice.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400 text-sm">
              Tidak ada buku yang cocok dengan pencarian.
            </div>
          ) : slice.map((book) => {
            const ri = books.findIndex(b => b.id === book.id);
            const [bg, ac] = coverFor(ri);
            const stok = stokLabel(book.stock);
            return (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-slate-200 overflow-visible
                           hover:border-blue-300 hover:-translate-y-1 hover:shadow-lg
                           transition-all duration-200 cursor-default group flex flex-col"
              >
                {/* Cover */}
                <div className="h-[110px] sm:h-[120px] relative flex items-end p-2 rounded-t-xl overflow-hidden flex-shrink-0"
                     style={{ background: bg }}>
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 opacity-50"
                       style={{ background: ac }} />
                  <span className="text-white/90 text-[10px] leading-snug font-medium relative z-10"
                        style={{ textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>
                    {book.title?.split(' ').slice(0, 3).join(' ')}
                  </span>
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5
                                   rounded-full border ${stokBadgeCls(stok, true)}`}>
                    {stok}
                  </span>
                </div>

                {/* Body */}
                <div className="p-2 sm:p-2.5 flex flex-col gap-1 flex-1">
                  <p className="font-black text-slate-800 text-xs leading-snug line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {book.author || '—'}
                  </p>
                  <span className="inline-block text-[9px] bg-blue-50 text-blue-700
                                   px-2 py-0.5 rounded-full font-bold border border-blue-100 self-start">
                    {book.category}
                  </span>

                  {/* Meta + actions */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                      📍 {book.rak || 'TBA'}
                    </span>
                    {/* Mobile: selalu tampil; Desktop: muncul saat hover */}
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <QRCodeModal book={book} isLoggedIn={true} userEmail={userEmail} />
                      <EditBookModal book={book} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      ) : (
      /* ════════════════════════════════════════════════════════════════
          LIST VIEW
      ════════════════════════════════════════════════════════════════ */
        <div className="p-3 sm:p-5 flex flex-col gap-2">
          {slice.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Tidak ada buku yang cocok dengan pencarian.
            </div>
          ) : slice.map((book) => {
            const ri  = books.findIndex(b => b.id === book.id);
            const [bg] = coverFor(ri);
            const stok = stokLabel(book.stock);
            return (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-slate-200 group
                           hover:border-blue-300 transition-colors cursor-default"
              >
                {/* Main row */}
                <div className="flex items-center gap-3 px-3 sm:px-4 py-3">
                  <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ background: bg }} />

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{book.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {book.author || '—'}
                    </p>
                  </div>

                  {/* Right side info */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:inline text-[9px] bg-blue-50 text-blue-700
                                     px-2 py-0.5 rounded-full font-bold border border-blue-100">
                      {book.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border
                                     ${stokBadgeCls(stok)}`}>
                      {stok}
                    </span>
                    <span className="hidden md:inline text-[10px] text-slate-400 whitespace-nowrap">
                      📍 {book.rak || 'TBA'}
                    </span>
                  </div>
                </div>

                {/* Action row — selalu tampil di mobile, muncul saat hover di desktop */}
                <div className="flex gap-1.5 flex-wrap px-3 sm:px-4 pb-3 pt-1
                               border-t border-slate-100
                               sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                  <BacaPDFModal url={book.pdf_url} compact />
                  <QRCodeModal book={book} isLoggedIn={true} userEmail={userEmail} />
                  <EditBookModal book={book} />
                  <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row items-center
                        justify-between gap-2 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-400 order-2 sm:order-1">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}
          </span>
          <div className="flex gap-1 order-1 sm:order-2 flex-wrap justify-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-500
                         text-sm flex items-center justify-center hover:border-blue-300
                         disabled:opacity-30 transition-colors"
            >‹</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              const inRange = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
              const isDots  = (p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2);
              if (!inRange && !isDots) return null;
              if (isDots && !inRange) return (
                <span key={`dots-${p}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">…</span>
              );
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center
                             transition-colors ${
                    p === page
                      ? 'bg-[#16213E] border-[#16213E] text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300'
                  }`}
                >{p}</button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-500
                         text-sm flex items-center justify-center hover:border-blue-300
                         disabled:opacity-30 transition-colors"
            >›</button>
          </div>
        </div>
      )}
    </div>
  );
}