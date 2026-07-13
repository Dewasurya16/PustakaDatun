'use client';

import { useState, useEffect, useCallback } from 'react';

type Loan = {
  id: number;
  employee_name: string;
  book_id: string;
  due_date: string;
  status: string;
  return_date?: string | null;
  borrowed_via?: string;
  created_at: string;
  books?: { title: string; rak?: string };
};

type Tab = 'semua' | 'DIPINJAM' | 'DIKEMBALIKAN' | 'ai_only';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  DIPINJAM:      { label: 'Dipinjam',      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',   dot: 'bg-yellow-400' },
  DIKEMBALIKAN:  { label: 'Dikembalikan',  color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  TERLAMBAT:     { label: 'Terlambat',     color: 'bg-rose-50 text-rose-700 border-rose-200',       dot: 'bg-rose-500' },
  'SUDAH DIULAS':{ label: 'Selesai',       color: 'bg-slate-50 text-slate-500 border-slate-200',    dot: 'bg-slate-400' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? {
    label: status, color: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wide ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-5 py-4">
          <div className="h-3.5 bg-slate-100 rounded-full animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function BookingAdminPage() {
  const [loans,     setLoans]     = useState<Loan[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<Tab>('semua');
  const [search,    setSearch]    = useState('');
  const [returning, setReturning] = useState<number | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/loans');
      const data = await res.json();
      if (Array.isArray(data)) setLoans(data);
    } catch (e) {
      console.error('Gagal memuat data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  // Tandai otomatis sebagai TERLAMBAT jika melewati due_date
  const enrichedLoans = loans.map((l) => {
    if (
      l.status === 'DIPINJAM' &&
      new Date(l.due_date) < new Date()
    ) {
      return { ...l, status: 'TERLAMBAT' };
    }
    return l;
  });

  // Filter
  const filtered = enrichedLoans.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.employee_name?.toLowerCase().includes(q) ||
      l.books?.title?.toLowerCase().includes(q);

    const matchTab =
      tab === 'semua'       ? true :
      tab === 'ai_only'     ? l.borrowed_via === 'AI_LEXI' :
      l.status?.toUpperCase() === tab;

    return matchSearch && matchTab;
  });

  // Stats
  const stats = {
    total:       enrichedLoans.length,
    dipinjam:    enrichedLoans.filter(l => l.status === 'DIPINJAM').length,
    terlambat:   enrichedLoans.filter(l => l.status === 'TERLAMBAT').length,
    dikembalikan:enrichedLoans.filter(l => l.status === 'DIKEMBALIKAN').length,
    viaAI:       enrichedLoans.filter(l => l.borrowed_via === 'AI_LEXI').length,
  };

  const handleReturn = async (loan: Loan) => {
    if (!confirm(`Konfirmasi: Terima pengembalian buku\n"${loan.books?.title}" dari ${loan.employee_name}?`)) return;
    setReturning(loan.id);
    try {
      await fetch(`/api/loans/${loan.id}/return`, { method: 'PATCH' });
      await fetchLoans();
    } catch (e) {
      alert('Gagal memproses pengembalian.');
    } finally {
      setReturning(null);
    }
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'semua',       label: 'Semua',        count: stats.total },
    { key: 'DIPINJAM',    label: 'Aktif',        count: stats.dipinjam + stats.terlambat },
    { key: 'DIKEMBALIKAN',label: 'Dikembalikan', count: stats.dikembalikan },
    { key: 'ai_only',     label: '🤖 Via Lexi',  count: stats.viaAI },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0f2318] via-[#16213E] to-[#2d6a4f] px-6 py-8 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">
                Pustaka Datun Kejaksaan Agung
              </p>
              <h1 className="text-3xl font-black text-white leading-tight">
                Manajemen Sirkulasi
              </h1>
              <p className="text-blue-200/70 text-sm font-medium mt-1">
                Kelola peminjaman buku — termasuk yang masuk lewat Lexi AI
              </p>
            </div>
            <button
              onClick={fetchLoans}
              className="self-start sm:self-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Refresh
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
            {[
              { label: 'Total Peminjaman', value: stats.total,        icon: '📚', accent: 'text-white' },
              { label: 'Sedang Dipinjam',  value: stats.dipinjam,     icon: '📖', accent: 'text-yellow-300' },
              { label: 'Terlambat',        value: stats.terlambat,    icon: '⚠️',  accent: 'text-rose-300' },
              { label: 'Via Lexi AI',      value: stats.viaAI,        icon: '🤖', accent: 'text-blue-300' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{s.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black ${s.accent}`}>{s.value}</span>
                  <span className="text-lg">{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KONTEN UTAMA ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Tab pills */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border transition-all ${
                  tab === t.key
                    ? 'bg-[#16213E] text-white border-[#16213E] shadow-md'
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] ${
                    tab === t.key ? 'bg-white/20' : 'bg-slate-200 text-slate-500'
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Cari nama / judul buku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16213E]/20 focus:border-[#16213E]/30 placeholder:text-slate-300 placeholder:font-medium transition-all"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Waktu Pinjam', 'Nama Pegawai', 'Judul Buku', 'Tenggat', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-slate-400 font-bold text-sm">Tidak ada data ditemukan</p>
                      <p className="text-slate-300 text-xs mt-1">Coba ubah filter atau kata pencarian</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLate  = item.status === 'TERLAMBAT';
                    const isDone  = ['DIKEMBALIKAN','SUDAH DIULAS'].includes(item.status?.toUpperCase());
                    const isViaAI = item.borrowed_via === 'AI_LEXI';

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${isLate ? 'bg-rose-50/30' : ''}`}
                      >
                        {/* Waktu */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-xs font-bold text-slate-700">
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(item.created_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </td>

                        {/* Nama */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-[#16213E] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                              {item.employee_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{item.employee_name}</p>
                              {isViaAI && (
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                  🤖 Lexi AI
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Buku */}
                        <td className="px-5 py-4 max-w-[200px]">
                          <p className="text-sm font-semibold text-slate-700 line-clamp-2 italic">
                            "{item.books?.title || '—'}"
                          </p>
                          {item.books?.rak && (
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">📍 Rak {item.books.rak}</p>
                          )}
                        </td>

                        {/* Tenggat */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className={`text-xs font-bold ${isLate ? 'text-rose-600' : 'text-slate-700'}`}>
                            {new Date(item.due_date).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                          </p>
                          {isLate && (
                            <p className="text-[10px] font-black text-rose-500 mt-0.5">
                              {Math.floor((Date.now() - new Date(item.due_date).getTime()) / 86400000)} hari terlambat
                            </p>
                          )}
                          {item.return_date && (
                            <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                              Kembali: {new Date(item.return_date).toLocaleDateString('id-ID', { day:'2-digit', month:'short' })}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-4">
                          {isDone ? (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Selesai</span>
                          ) : (
                            <button
                              onClick={() => handleReturn(item)}
                              disabled={returning === item.id}
                              className="px-3.5 py-2 bg-[#16213E] hover:bg-blue-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                            >
                              {returning === item.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                              ) : '✓'}
                              {returning === item.id ? 'Proses...' : 'Kembalikan'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Menampilkan {filtered.length} dari {enrichedLoans.length} data
              </p>
              {stats.terlambat > 0 && (
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
                  ⚠️ {stats.terlambat} peminjaman terlambat
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
