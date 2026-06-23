'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import ExportBukuTamu from './ExportBukuTamu';
import GlobalActionLoading from '../../components/GlobalActionLoading';

type BukuTamuEntry = {
  id: string;
  nama: string;
  bidang?: string | null;
  asal_instansi?: string | null;
  keperluan: string;
  pesan?: string | null;
  isi_buku?: string | null;       
  ttd_data?: string | null;
  status: string;
  created_at: string;
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getBidang(e: BukuTamuEntry) {
  return e.bidang || e.asal_instansi || '—';
}

// ── Kartu entri ───────────────────────────────────────────────
function EntryCard({
  entry,
  no,
  onDeleted,
  onStatusChanged,
}: {
  entry: BukuTamuEntry;
  no: number;
  onDeleted: (id: string) => void;
  onStatusChanged: (id: string, status: string) => void;
}) {
  const router = useRouter();
  const [loading,   setLoading]   = useState(false);
  const [showDel,   setShowDel]   = useState(false);
  const [showTtd,   setShowTtd]   = useState(false);
  const [errMsg,    setErrMsg]    = useState('');

  const runUpdate = useCallback(async (newStatus: string) => {
    setLoading(true);
    setErrMsg('');
    const { error } = await supabase
      .from('buku_tamu')
      .update({ status: newStatus })
      .eq('id', entry.id);

    if (error) {
      setErrMsg(`Gagal: ${error.message}`);
      setLoading(false);
      return false;
    }
    onStatusChanged(entry.id, newStatus);
    router.refresh();
    setLoading(false);
    return true;
  }, [entry.id, onStatusChanged, router]);

  const handleApprove = () => runUpdate('approved');
  const handleReject  = () => runUpdate('rejected');

  const handleDelete = async () => {
    setLoading(true);
    setErrMsg('');
    const { error } = await supabase
      .from('buku_tamu')
      .delete()
      .eq('id', entry.id);

    if (error) {
      setErrMsg(`Gagal menghapus: ${error.message}`);
      setLoading(false);
      setShowDel(false);
      return;
    }
    onDeleted(entry.id);
    router.refresh();
    setShowDel(false);
    setLoading(false);
  };

  const statusConfig: Record<string, { cls: string; label: string }> = {
    approved: { cls: 'bg-blue-50 text-blue-700 border-blue-200',   label: '✓ Disetujui' },
    pending:  { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',          label: '⏳ Pending'   },
    rejected: { cls: 'bg-red-50 text-red-600 border-red-200',                label: '✕ Ditolak'    },
  };
  const cfg = statusConfig[entry.status] ?? {
    cls: 'bg-slate-50 text-slate-500 border-slate-200',
    label: entry.status,
  };

  return (
    <>
      <GlobalActionLoading isVisible={loading} text="Memproses Aksi..." />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute top-3 left-3 w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
          <span className="text-[9px] font-black text-slate-500 tabular-nums">
            {String(no).padStart(3, '0')}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>

        <div className="h-4" />

        <div>
          <p className="font-black text-slate-800 text-sm leading-snug line-clamp-1">{entry.nama}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5" suppressHydrationWarning>
            {formatTanggal(entry.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wider">
            {getBidang(entry)}
          </span>
          <span className="px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-black text-blue-700 uppercase tracking-wider">
            {entry.keperluan}
          </span>
        </div>

        {/* 👇 BAGIAN PESAN & ISI BUKU YANG SUDAH DIGABUNG DAN LANGSUNG TAMPIL 👇 */}
        {(entry.pesan || entry.isi_buku) && (
          <div className="mt-1 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-3.5 space-y-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            
            {entry.pesan && (
              <div className="relative pl-7">
                <div className="absolute left-0 top-0.5 w-5 h-5 bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-full flex items-center justify-center text-[10px] shadow-sm">
                  💬
                </div>
                <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed whitespace-pre-wrap">
                  &ldquo;{entry.pesan}&rdquo;
                </p>
              </div>
            )}
            
            {/* Garis pemisah halus jika pengunjung mengisi pesan DAN isi buku */}
            {entry.pesan && entry.isi_buku && (
               <div className="ml-7 h-px bg-slate-100/80 rounded-full"></div>
            )}

            {entry.isi_buku && (
              <div className="relative pl-7">
                <div className="absolute left-0 top-0.5 w-5 h-5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full flex items-center justify-center text-[10px] shadow-sm">
                  ✍️
                </div>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">
                  {entry.isi_buku}
                </p>
              </div>
            )}
            
          </div>
        )}
        {/* 👆 AKHIR BAGIAN PESAN & ISI BUKU 👆 */}

        {entry.ttd_data && (
          <button onClick={() => setShowTtd(true)} className="self-start group/ttd">
            <img
              src={entry.ttd_data}
              alt="TTD"
              className="h-9 max-w-[100px] object-contain border border-slate-200 rounded-lg bg-white hover:border-[#16213E] transition-colors"
            />
            <p className="text-[8px] font-bold text-blue-600 mt-0.5 opacity-0 group-hover/ttd:opacity-100 transition-opacity">
              Perbesar ↗
            </p>
          </button>
        )}

        {errMsg && (
          <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errMsg}
          </p>
        )}

        <div className="flex gap-1.5 mt-auto pt-2 border-t border-slate-50">
          {entry.status !== 'approved' && (
            <button
              disabled={loading}
              onClick={handleApprove}
              className="flex-1 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? '...' : 'ACC'}
            </button>
          )}
          {entry.status !== 'rejected' && (
            <button
              disabled={loading}
              onClick={handleReject}
              className="flex-1 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? '...' : 'Tolak'}
            </button>
          )}
          <button
            disabled={loading}
            onClick={() => setShowDel(true)}
            className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
            title="Hapus"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {showTtd && entry.ttd_data && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowTtd(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Tanda Tangan — {entry.nama}
            </p>
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50">
              <img src={entry.ttd_data} alt="TTD" className="w-full object-contain max-h-36" />
            </div>
            <button
              onClick={() => setShowTtd(false)}
              className="mt-5 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-colors tracking-widest"
            >
              Tutup
            </button>
          </div>
        </div>,
        document.body
      )}

      {showDel && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">🗑️</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Hapus Entri?</h4>
            <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">
              Entri dari{' '}
              <span className="font-bold text-slate-800">&ldquo;{entry.nama}&rdquo;</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => setShowDel(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-red-700 transition-all tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span
                    style={{
                      display: 'inline-block', width: 12, height: 12,
                      border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
                      borderRadius: '50%', animation: 'spin .65s linear infinite',
                    }}
                  />
                ) : null}
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const ITEMS_PER_PAGE = 12;

export default function BukuTamuAdminTable({ entries: initialEntries }: { entries: BukuTamuEntry[] }) {
  const [isMounted, setIsMounted] = useState(false); 
  const [entries, setEntries] = useState<BukuTamuEntry[]>(initialEntries || []);
  const [filter,   setFilter]  = useState<'semua' | 'approved' | 'pending' | 'rejected'>('semua');
  const [search,   setSearch]  = useState('');
  const [page,     setPage]    = useState(1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setEntries(initialEntries || []);
  }, [initialEntries]); 

  const handleDeleted = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleStatusChanged = useCallback((id: string, status: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const filtered = entries
    .filter((e) => filter === 'semua' || e.status === filter)
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.nama.toLowerCase().includes(q) ||
        e.keperluan.toLowerCase().includes(q) ||
        getBidang(e).toLowerCase().includes(q) ||
        (e.pesan?.toLowerCase().includes(q) ?? false) ||
        (e.isi_buku?.toLowerCase().includes(q) ?? false)
      );
    });

  const setFilterAndReset = (f: typeof filter) => { setFilter(f); setPage(1); };
  const setSearchAndReset = (s: string)          => { setSearch(s);  setPage(1); };

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage    = Math.min(page, totalPages);
  const pageSlice   = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const counts = {
    semua:    entries.length,
    pending:  entries.filter((e) => e.status === 'pending').length,
    approved: entries.filter((e) => e.status === 'approved').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
  };

  const tabs = [
    { key: 'semua'    as const, label: 'Semua',     color: 'bg-slate-800 text-white' },
    { key: 'pending'  as const, label: 'Pending',   color: 'bg-yellow-500 text-white' },
    { key: 'approved' as const, label: 'Disetujui', color: 'bg-blue-600 text-white' },
    { key: 'rejected' as const, label: 'Ditolak',    color: 'bg-red-500 text-white'   },
  ];

  if (!isMounted) {
    return (
      <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
        <p className="font-bold text-sm">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800">Data Kunjungan Buku Tamu</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {filtered.length} dari {entries.length} entri
                {totalPages > 1 && ` · Hal ${safePage}/${totalPages}`}
              </p>
            </div>
            <ExportBukuTamu entries={filter === 'semua' ? entries : filtered} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterAndReset(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t.key
                    ? t.color + ' shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  filter === t.key ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearchAndReset(e.target.value)}
              placeholder="Cari nama, keperluan, bidang, atau isi buku tamu..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#16213E] focus:border-[#16213E] transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearchAndReset('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {pageSlice.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
          <p className="text-3xl mb-3">📖</p>
          <p className="font-bold text-sm">Tidak ada entri di kategori ini</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pageSlice.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                no={(safePage - 1) * ITEMS_PER_PAGE + i + 1}
                onDeleted={handleDeleted}
                onStatusChanged={handleStatusChanged}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} entri
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={safePage <= 1 ? true : undefined}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Sebelumnya
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 5) return true;
                        return p === 1 || p === totalPages || Math.abs(p - safePage) <= 1;
                      })
                      .map((p, idx, arr) => (
                        <React.Fragment key={`page-wrapper-${p}`}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-1 py-2 text-slate-400 text-xs">…</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                              p === safePage
                                ? 'bg-[#16213E] text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    disabled={safePage >= totalPages ? true : undefined}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 bg-[#16213E] text-white rounded-xl text-xs font-bold hover:bg-[#123023] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-3 bg-white rounded-2xl border border-slate-100">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">
              Total {entries.length} entri · {counts.approved} disetujui · {counts.pending} pending · {counts.rejected} ditolak
            </p>
          </div>
        </>
      )}
    </div>
  );
}