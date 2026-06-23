'use client';
import { useState, useEffect } from 'react';
import ReturnButton from './ReturnButton';

// ── Helpers ──────────────────────────────────────────────────────────
function loanBadge(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'DIPINJAM')     return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  if (s === 'TERLAMBAT')    return 'bg-rose-50 text-rose-700 border-rose-200';
  if (s === 'DIKEMBALIKAN') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'SUDAH DIULAS') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

function SourceBadge({ via }: { via?: string | null }) {
  if (via === 'AI_LEXI')
    return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">🤖 Lexi</span>;
  if (via === 'KATALOG')
    return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-slate-50 text-slate-500 border border-slate-100">📚 Katalog</span>;
  return null;
}

// ── Skeleton Row ──────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-slate-200 rounded-md" />
            <div className="h-2 w-16 bg-slate-100 rounded-md" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-3 w-36 bg-slate-200 rounded-md" /></td>
      <td className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 rounded-md" /></td>
      <td className="px-6 py-4"><div className="h-3 w-24 bg-slate-200 rounded-md" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 rounded-lg" /></td>
      <td className="px-6 py-4 text-right"><div className="h-8 w-24 bg-slate-200 rounded-xl ml-auto" /></td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="p-5 space-y-3 border-b border-slate-50 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-16 bg-slate-200 rounded-lg" />
      </div>
      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="h-3 w-28 bg-slate-100 rounded" />
        <div className="h-8 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

// ── Pagination UI ────────────────────────────────────────────────────
function PaginationBar({
  safePage, totalPages, totalItems, perPage,
  onPrev, onNext, onGo,
}: {
  safePage: number; totalPages: number; totalItems: number; perPage: number;
  onPrev: () => void; onNext: () => void; onGo: (p: number) => void;
}) {
  const from = (safePage - 1) * perPage + 1;
  const to   = Math.min(safePage * perPage, totalItems);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mt-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Peminjaman {from}–{to} dari {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={onPrev}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >← Sebelumnya</button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => totalPages <= 7 ? true : p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-slate-400 text-xs px-0.5">…</span>
                  )}
                  <button
                    onClick={() => onGo(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                      p === safePage ? 'bg-[#16213E] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >{p}</button>
                </span>
              ))}
          </div>

          <button
            disabled={safePage >= totalPages}
            onClick={onNext}
            className="px-4 py-2 bg-[#16213E] text-white rounded-xl text-xs font-bold hover:bg-[#123023] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >Selanjutnya →</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 15;

export default function SirkulasiTable({
  loans,
  totalAll,
  overdueCount,
}: {
  loans: any[];
  totalAll: number;
  overdueCount: number;
}) {
  const [page,         setPage]         = useState(1);
  const [isTransition, setIsTransition] = useState(false);
  const [search,       setSearch]       = useState('');

  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Enrich with _isLate
  const enriched = loans.map(l => ({
    ...l,
    _isLate: l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today,
  }));

  // Client-side search
  const filtered = search.trim()
    ? enriched.filter(l => {
        const q = search.toLowerCase();
        return (
          l.employee_name?.toLowerCase().includes(q) ||
          l.books?.title?.toLowerCase().includes(q) ||
          l.user_email?.toLowerCase().includes(q) ||
          l.employee_nip?.toLowerCase().includes(q)
        );
      })
    : enriched;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const changePage = (p: number) => {
    setIsTransition(true);
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsTransition(false), 350);
  };

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="space-y-4">

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama peminjam, judul buku, NIP..."
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#16213E] transition-all placeholder:text-slate-400 shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xl leading-none">×</button>
        )}
      </div>

      {/* Table card */}
      <div
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity duration-300"
        style={{ opacity: isTransition ? 0.4 : 1 }}
      >
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-50">
          {isTransition
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : pageSlice.length === 0
              ? <p className="p-10 text-center text-slate-400 text-sm font-bold">Tidak ada data untuk filter ini.</p>
              : pageSlice.map(loan => (
                  <div key={loan.id} className={`p-5 space-y-3 ${loan._isLate ? 'bg-rose-50/30' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-slate-800 text-sm">{loan.employee_name}</p>
                          <SourceBadge via={loan.borrowed_via} />
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{loan.books?.title}</p>
                        {loan.user_email && (
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">{loan.user_email}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest flex-shrink-0 ${loanBadge(loan._isLate ? 'TERLAMBAT' : loan.status)}`}>
                        {loan._isLate ? '⚠️ Telat' : loan.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold">
                          Tenggat:{' '}
                          <span className={`font-black ${loan._isLate ? 'text-rose-600' : 'text-slate-700'}`}>
                            {new Date(loan.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </p>
                        {loan._isLate && (
                          <p className="text-[9px] font-black text-rose-500 mt-0.5">
                            {Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000)} hari terlambat
                          </p>
                        )}
                      </div>
                      <ReturnButton loan={loan} />
                    </div>
                  </div>
                ))
          }
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Peminjam & Sumber', 'Aset Referensi', 'Tenggat', 'NIP', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isTransition
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : pageSlice.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400 font-bold text-sm">
                        Tidak ada data untuk filter ini.
                      </td>
                    </tr>
                  )
                  : pageSlice.map(loan => (
                    <tr key={loan.id} className={`hover:bg-slate-50/80 transition-colors ${loan._isLate ? 'bg-rose-50/20' : ''}`}>
                      {/* Peminjam */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-[#16213E] rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                            {loan.employee_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-none">{loan.employee_name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <SourceBadge via={loan.borrowed_via} />
                              {loan.user_email && (
                                <span className="text-[8px] text-slate-400 font-medium truncate max-w-[100px]">{loan.user_email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Buku */}
                      <td className="px-6 py-4 text-slate-600 max-w-[180px]">
                        <p className="font-medium truncate italic">"{loan.books?.title || '—'}"</p>
                        {loan.books?.rak && <p className="text-[9px] text-slate-400 mt-0.5">📍 Rak {loan.books.rak}</p>}
                      </td>
                      {/* Tenggat */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-black ${loan._isLate ? 'text-rose-600' : 'text-slate-600'}`}>
                          {loan._isLate && '⚠️ '}
                          {new Date(loan.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {loan._isLate && (
                          <p className="text-[9px] font-black text-rose-400 mt-0.5">
                            {Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000)}h terlambat
                          </p>
                        )}
                      </td>
                      {/* NIP */}
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">{loan.employee_nip || '—'}</td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase border tracking-widest ${loanBadge(loan._isLate ? 'TERLAMBAT' : loan.status)}`}>
                          {loan._isLate ? 'Terlambat' : loan.status}
                        </span>
                      </td>
                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        <ReturnButton loan={loan} />
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isTransition && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Menampilkan {filtered.length} dari {totalAll} data
            </p>
            {overdueCount > 0 && (
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                ⚠️ {overdueCount} terlambat
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationBar
          safePage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          perPage={ITEMS_PER_PAGE}
          onPrev={() => changePage(Math.max(1, safePage - 1))}
          onNext={() => changePage(Math.min(totalPages, safePage + 1))}
          onGo={changePage}
        />
      )}
    </div>
  );
}