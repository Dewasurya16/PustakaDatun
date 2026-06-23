'use client';
import { useState, useEffect } from 'react';
import UserAction from './UserAction';

// ── Skeleton ──────────────────────────────────────────────────────────
function SkeletonDesktopRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
          <div className="h-3 w-36 bg-slate-200 rounded-md" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 rounded-lg" /></td>
      <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-200 rounded-lg" /></td>
      <td className="px-6 py-4"><div className="h-3 w-24 bg-slate-100 rounded-md" /></td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="h-7 w-16 bg-slate-200 rounded-lg" />
          <div className="w-7 h-7 bg-slate-100 rounded-lg" />
          <div className="w-7 h-7 bg-slate-100 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

function SkeletonMobileCard() {
  return (
    <div className="p-5 space-y-3 border-b border-slate-50 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-200 rounded-xl flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-32 bg-slate-200 rounded" />
          <div className="h-2 w-20 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-slate-200 rounded" />
          <div className="h-5 w-12 bg-slate-100 rounded" />
        </div>
        <div className="h-7 w-20 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

// ── Pagination Bar ────────────────────────────────────────────────────
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
    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Akun {from}–{to} dari {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <button disabled={safePage <= 1} onClick={onPrev}
            className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
            ← Sebelumnya
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => totalPages <= 7 ? true : p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-slate-400 text-xs px-0.5">…</span>
                  )}
                  <button onClick={() => onGo(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                      p === safePage ? 'bg-[#16213E] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}>
                    {p}
                  </button>
                </span>
              ))}
          </div>
          <button disabled={safePage >= totalPages} onClick={onNext}
            className="px-4 py-2 bg-[#16213E] text-white rounded-xl text-xs font-bold hover:bg-[#123023] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
            Selanjutnya →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 15;

export default function PegawaiTable({
  profiles,
  pendingUsers,
}: {
  profiles: any[];
  pendingUsers: number;
}) {
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [isTransition, setIsTransition] = useState(false);

  // Filter
  const filtered = search.trim()
    ? profiles.filter(p =>
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.role?.toLowerCase().includes(search.toLowerCase()) ||
        p.status?.toLowerCase().includes(search.toLowerCase())
      )
    : profiles;

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const changePage = (p: number) => {
    setIsTransition(true);
    setPage(p);
    setTimeout(() => setIsTransition(false), 300);
  };

  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-800">👥 Manajemen Akses Pegawai</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {profiles.length} akun terdaftar
              {pendingUsers > 0 && (
                <span className="text-rose-500 font-black"> · {pendingUsers} menunggu ACC</span>
              )}
              {totalPages > 1 && (
                <span className="text-slate-400"> · Hal {safePage}/{totalPages}</span>
              )}
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari email, role, status..."
              className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#16213E] transition-all placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div
        className="md:hidden divide-y divide-slate-50 transition-opacity duration-300"
        style={{ opacity: isTransition ? 0.3 : 1 }}
      >
        {isTransition
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonMobileCard key={i} />)
          : pageSlice.map(profile => (
            <div key={profile.id} className={`p-5 space-y-3 ${profile.status === 'pending' ? 'bg-yellow-50/30' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#16213E] text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">
                  {profile.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{profile.email}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                    Daftar: {new Date(profile.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <div className="flex gap-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                    profile.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>{profile.role || 'user'}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${
                    profile.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>{profile.status}</span>
                </div>
                <UserAction user={profile} />
              </div>
            </div>
          ))
        }
      </div>

      {/* Desktop table */}
      <div
        className="hidden md:block overflow-x-auto transition-opacity duration-300"
        style={{ opacity: isTransition ? 0.3 : 1 }}
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Pegawai', 'Role', 'Status', 'Tgl Daftar', 'Aksi'].map(h => (
                <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isTransition
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonDesktopRow key={i} />)
              : pageSlice.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-400 font-bold text-sm">
                      Tidak ada akun yang cocok
                    </td>
                  </tr>
                )
                : pageSlice.map(profile => (
                  <tr key={profile.id} className={`hover:bg-slate-50/80 transition-colors ${profile.status === 'pending' ? 'bg-yellow-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#16213E] text-white rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                          {profile.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{profile.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border tracking-widest ${
                        profile.role === 'admin' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>{profile.role || 'user'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded border tracking-widest ${
                        profile.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>{profile.status === 'pending' ? '⏳ Pending' : '✅ Aktif'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {new Date(profile.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserAction user={profile} />
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
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