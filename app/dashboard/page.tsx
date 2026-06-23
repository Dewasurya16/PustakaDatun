import { supabase } from '../../lib/supabase';
import ReturnButton from './ReturnButton';
import UserAction from './UserAction';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileMenu from '../ProfileMenu';
import Link from 'next/link';
import AIAssistant from '../AIAssistant';
import ExportLaporan from './ExportLaporan';
import ScanBukuModal from './ScanBukuModal';
import Bukutamuadmintable from '../buku-tamu/components/Bukutamuadmintable';
import KatalogBukuAdmin from './KatalogBukuAdmin'; 
import SirkulasiTable from './Sirkulasitable';
import PegawaiTable from './PegawaiTable';
import CetakPosterModal from './CetakPosterModal';
import CetakSuratPeringatan from './CetakSuratPeringatan';
import Image from 'next/image';
import DashboardCharts from './DashboardCharts';
import ExportPerPegawai from './ExportPerPegawai';
import PdfDownloadLog from './PdfDownloadLog';

// 👇 TAMBAHAN UNTUK MEMATIKAN CACHE NEXT.JS 👇
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Helper: warna badge status ─────────────────────────────────────────────
function loanBadge(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'DIPINJAM')     return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  if (s === 'TERLAMBAT')    return 'bg-rose-50 text-rose-700 border-rose-200';
  if (s === 'DIKEMBALIKAN') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'SUDAH DIULAS') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

// ── Helper: badge sumber peminjaman ────────────────────────────────────────
function SourceBadge({ via }: { via?: string | null }) {
  if (via === 'AI_LEXI') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
        🤖 Lexi
      </span>
    );
  }
  if (via === 'KATALOG') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-slate-50 text-slate-500 border border-slate-100">
        📚 Katalog
      </span>
    );
  }
  return null;
}

export default async function DashboardPage(props: any) {
  const searchParams = await props.searchParams;
  const activeTab    = searchParams?.tab         || 'overview';
  // Filter sirkulasi: 'semua' | 'DIPINJAM' | 'DIKEMBALIKAN' | 'ai_only'
  const sirkulasiFilter = searchParams?.filter   || 'semua';

  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Admin';

  if (session !== 'admin') redirect('/login');

  // ── Fetch semua data ───────────────────────────────────────────────────
  // FIX: ganti loan_date → created_at
  const { data: loans }    = await supabase
    .from('loans')
    .select('*, books(title, stock, category, rak)')
    .order('created_at', { ascending: false });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

    const { data: bukuTamu } = await supabase
    .from('buku_tamu')
    .select('*')
    .order('created_at', { ascending: false });

  // ── Statistik ──────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const totalBooks    = books?.length || 0;
  const activeLoans   = loans?.filter(l => l.status?.toUpperCase() === 'DIPINJAM').length || 0;
  const returnedLoans = loans?.filter(l => ['DIKEMBALIKAN','SUDAH DIULAS'].includes(l.status?.toUpperCase())).length || 0;
  const pendingUsers  = profiles?.filter(p => p.status === 'pending').length || 0;
  const overdueLoans  = loans?.filter(l => l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today) || [];
  const outOfStock    = books?.filter(b => b.stock <= 0) || [];
  const viaAILoans    = loans?.filter(l => l.borrowed_via === 'AI_LEXI') || [];

  const returnRate = loans && loans.length > 0
    ? Math.round((returnedLoans / loans.length) * 100) : 0;

  // Top readers & kategori
  const readerMap: Record<string, number> = {};
  loans?.forEach(l => { readerMap[l.employee_name] = (readerMap[l.employee_name] || 0) + 1; });
  const topReaders = Object.entries(readerMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const catMap: Record<string, number> = {};
  books?.forEach(b => { const c = b.category || 'Lainnya'; catMap[c] = (catMap[c] || 0) + 1; });
  const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ── Filter sirkulasi ───────────────────────────────────────────────────
  const filteredLoans = (loans || []).filter(l => {
    if (sirkulasiFilter === 'DIPINJAM')    return l.status?.toUpperCase() === 'DIPINJAM';
    if (sirkulasiFilter === 'DIKEMBALIKAN') return ['DIKEMBALIKAN','SUDAH DIULAS'].includes(l.status?.toUpperCase());
    if (sirkulasiFilter === 'ai_only')     return l.borrowed_via === 'AI_LEXI';
    return true; // semua
  });

  // Enrich: tambahkan status TERLAMBAT secara visual (tidak write ke DB)
  const enrichedLoans = filteredLoans.map(l => ({
    ...l,
    _isLate: l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today,
  }));

  // ── Nav items ──────────────────────────────────────────────────────────
  const navItems = [
    { tab: 'overview',  icon: '📊', label: 'Ringkasan',    badge: 0 },
    { tab: 'buku',      icon: '📚', label: 'Katalog Buku', badge: 0 },
    { tab: 'sirkulasi', icon: '🔄', label: 'Sirkulasi',    badge: overdueLoans.length },
    { tab: 'pegawai',   icon: '👥', label: 'Pegawai',      badge: pendingUsers },
    { tab: 'bukutamu',  icon: '📖', label: 'Buku Tamu',    badge: 0 },
    { tab: 'pdf_logs',  icon: '📥', label: 'Log E-Book',   badge: 0 },
  ];

  // ── Filter tabs untuk sirkulasi ────────────────────────────────────────
  const sirkulasiTabs = [
    { key: 'semua',        label: 'Semua',        count: loans?.length || 0 },
    { key: 'DIPINJAM',     label: 'Aktif',        count: activeLoans },
    { key: 'DIKEMBALIKAN', label: 'Dikembalikan', count: returnedLoans },
    { key: 'ai_only',      label: '🤖 Via Lexi',  count: viaAILoans.length },
  ];

  return (
    <div className="flex h-screen bg-[var(--background)] text-slate-800 font-sans overflow-hidden">

      {/* ══════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-slate-200/50 z-50 flex-shrink-0 shadow-[2px_0_20px_rgba(0,0,0,0.04)]">
        {/* Sidebar header */}
        <div className="h-20 flex items-center gap-4 px-6 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1221]/3 to-transparent pointer-events-none" />
          <div className="w-10 h-10 relative flex-shrink-0 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
            <Image
              src="/logo-kejaksaan.png"
              alt="Logo Kejaksaan"
              fill
              className="object-contain rounded-full"
            />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">E-Perpus</h1>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Administrator</p>
          </div>
        </div>

        {/* Accent line */}
        <div className="h-[2px] bg-gradient-to-r from-[#16213E] via-blue-400 to-transparent" />

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto styled-scrollbar">
          <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Panel Kontrol</p>
          {navItems.map(item => {
            const isActive = activeTab === item.tab;
            return (
              <Link
                key={item.tab}
                href={`?tab=${item.tab}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-[var(--green-main)] text-white shadow-[var(--shadow-md)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`text-base transition-all duration-200 ${
                  isActive ? 'scale-110' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Akses Cepat</p>
            <Link href="/katalog" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-blue-50 hover:text-blue-800 transition-all duration-200 group">
              <span className="text-base grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200">🌐</span>
              <span>Lihat Katalog</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100/50">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--green-main)] to-blue-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-md shadow-blue-900/20">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-800 truncate">{userEmail}</p>
              <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          AREA KANAN
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 z-40 flex-shrink-0">
          <div className="lg:hidden flex items-center gap-3">
           <div className="w-8 h-8 relative flex-shrink-0 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
              <Image 
                src="/logo-kejaksaan.png" 
                alt="Logo Kejaksaan" 
                fill
                className="object-contain rounded-full"
              />
            </div>
            <h1 className="text-sm font-black uppercase text-slate-800">Dasbor Admin</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-base font-black text-slate-800">
              {navItems.find(n => n.tab === activeTab)?.label || 'Dasbor'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ScanBukuModal isLoggedIn={true} userEmail={userEmail} />
            </div>
            <ProfileMenu email={userEmail} role={session} />
          </div>
        </header>

        {/* ── Main Content ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-10 scroll-smooth">
          <div className="max-w-[1300px] mx-auto">

            {/* ════════════════════════
                TAB: OVERVIEW
            ════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Hero Banner */}
                <div className="anim-up-1 bg-gradient-to-br from-[#0f2e22] via-[var(--green-main)] to-[#255940] rounded-2xl p-8 text-white shadow-[var(--shadow-md)] relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border border-[#3b7a5d]/30 mb-8">
                  <div className="anim-blob absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[60px] pointer-events-none" />
                  <div className="anim-blob-d absolute bottom-0 left-16 w-48 h-48 bg-yellow-400/8 rounded-full blur-[40px] pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
                  <div className="absolute top-6 right-6 opacity-[0.06] text-[7rem] leading-none pointer-events-none select-none font-black font-display">⚖</div>
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-4 border border-white/20 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[pulseRing_2s_infinite]" /> Panel Admin Aktif
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight mb-2">
                      Selamat Datang,<br />
                      <span className="shimmer-green">Administrator!</span>
                    </h2>
                    <p className="text-blue-100/80 text-[13px] font-medium">
                      Pantau aktivitas dan statistik perpustakaan secara real-time.
                    </p>
                  </div>
                  <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3">
                    <ExportLaporan dataBuku={books || []} dataPinjam={loans || []} />
                    <CetakPosterModal />
                  </div>
                </div>

                {/* Stat Cards - Clean SaaS style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: 'Total Koleksi',   value: totalBooks,       icon: '📚', sub: `${outOfStock.length} stok habis`, trend: 'Update' },
                    { label: 'Aktif Dipinjam',  value: activeLoans,      icon: '⏳', sub: `${overdueLoans.length} terlambat`, trend: overdueLoans.length > 0 ? 'Warning' : 'Aman' },
                    { label: 'Tingkat Kembali', value: `${returnRate}%`, icon: '✅', sub: `${returnedLoans} total`, trend: 'Stabil' },
                    { label: 'Perlu ACC',        value: pendingUsers,     icon: '👥', sub: 'akun baru', trend: pendingUsers > 0 ? 'Action' : 'Aman' },
                  ].map((stat, i) => (
                      <div
                        key={stat.label}
                        className="anim-up bg-white rounded-[1.25rem] border border-slate-200 p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-300"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="flex justify-between items-start mb-5">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-100 shadow-sm">
                            {stat.icon}
                          </div>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                            stat.trend === 'Warning' || stat.trend === 'Action' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            stat.trend === 'Stabil' || stat.trend === 'Aman' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {stat.trend}
                          </span>
                        </div>
                        <p className="text-[2rem] font-black text-slate-900 leading-none font-display mb-2">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
                        <div className="h-px w-full bg-slate-100 my-3" />
                        <p className="text-[11px] font-semibold text-slate-500">{stat.sub}</p>
                      </div>
                  ))}
                </div>

                {/* Card Lexi AI — full-width highlight */}
                <div className="bg-gradient-to-r from-blue-950 to-[var(--green-main)] rounded-2xl border border-blue-800/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Lexi AI — Asisten Perpustakaan</p>
                      <p className="text-xl font-black text-white mt-0.5">{viaAILoans.length} peminjaman via chatbot</p>
                      <p className="text-[11px] text-blue-200/60 font-medium mt-0.5">
                        {viaAILoans.filter(l => l.status?.toUpperCase() === 'DIPINJAM').length} masih aktif ·{' '}
                        {viaAILoans.filter(l => l.status?.toUpperCase() !== 'DIPINJAM').length} selesai
                      </p>
                    </div>
                  </div>
                  <Link
                    href="?tab=sirkulasi&filter=ai_only"
                    className="flex-shrink-0 bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    Lihat Semua →
                  </Link>
                </div>

                {/* Peringatan & Inventaris */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Terlambat */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                        <span className="w-8 h-8 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-base">🚨</span>
                        Terlambat Kembali
                      </h3>
                      {overdueLoans.length > 0 && (
                        <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
                          {overdueLoans.length} item
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                      {overdueLoans.length === 0 ? (
                        <div className="py-10 text-center text-sm font-bold text-blue-600 bg-blue-50 rounded-xl border border-blue-100 border-dashed">
                          ✅ Semua sirkulasi berjalan lancar
                        </div>
                      ) : overdueLoans.map(loan => {
                        const daysLate = Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000);
                        return (
                          <div key={loan.id} className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-xl gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-slate-800 text-sm truncate">{loan.employee_name}</p>
                                <SourceBadge via={loan.borrowed_via} />
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{loan.books?.title}</p>
                              <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider mt-1">
                                {daysLate} hari terlambat
                              </p>
                            </div>
                            <CetakSuratPeringatan loan={loan} daysLate={daysLate} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stok Habis */}
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                        <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-base">⚠️</span>
                        Stok Habis
                      </h3>
                      {outOfStock.length > 0 && (
                        <span className="text-[9px] font-black bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                          {outOfStock.length} buku
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                      {outOfStock.length === 0 ? (
                        <div className="py-10 text-center text-sm font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                          Inventaris terkendali
                        </div>
                      ) : outOfStock.map(book => (
                        <div key={book.id} className="flex items-center justify-between p-4 bg-yellow-50/40 border border-yellow-100 rounded-xl gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{book.title}</p>
                            <p className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider mt-1">{book.category}</p>
                          </div>
                          <span className="w-8 h-8 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">0</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Top Readers */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5 text-sm">
                      <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-base">🏆</span>
                      Pegawai Teraktif
                    </h3>
                    <div className="space-y-3">
                      {topReaders.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">Belum ada data.</p>
                      ) : topReaders.map(([name, count], i) => (
                        <div key={name} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-200 text-yellow-900 border border-yellow-300'
                            : i === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>{i + 1}</div>
                          <p className="flex-1 text-sm font-bold text-slate-700 truncate">{name}</p>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-black text-[#16213E]">{count}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">buku</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GRAFIK INTERAKTIF (Recharts) */}
                <DashboardCharts loans={loans || []} books={books || []} />
              </div>
            )}

            {/* ════════════════════════
                TAB: KATALOG BUKU
            ════════════════════════ */}
            {activeTab === 'buku' && (
              <KatalogBukuAdmin books={books || []} totalBooks={totalBooks} userEmail={userEmail} />
            )}

            {/* ════════════════════════
                TAB: SIRKULASI
            ════════════════════════ */}
            {activeTab === 'sirkulasi' && (
              <div className="space-y-4">

                {/* Header + Export */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-800">🔄 Log Sirkulasi Peminjaman</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {loans?.length || 0} total transaksi · {activeLoans} aktif · {overdueLoans.length} terlambat · {viaAILoans.length} via Lexi AI
                    </p>
                  </div>
                  <ExportLaporan dataBuku={books || []} dataPinjam={loans || []} />
                </div>

                {/* Stat Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Dipinjam',     value: activeLoans,          cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { label: 'Terlambat',    value: overdueLoans.length,  cls: 'bg-rose-50 border-rose-200 text-rose-700' },
                    { label: 'Dikembalikan', value: returnedLoans,        cls: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: '🤖 Via Lexi',  value: viaAILoans.length,    cls: 'bg-blue-900/5 border-blue-200 text-blue-800' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl border p-4 text-center ${s.cls}`}>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                  {sirkulasiTabs.map(t => (
                    <Link
                      key={t.key}
                      href={`?tab=sirkulasi&filter=${t.key}`}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border transition-all ${
                        sirkulasiFilter === t.key
                          ? 'bg-[#16213E] text-white border-[#16213E] shadow-md'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {t.label}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[9px] ${
                        sirkulasiFilter === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                      }`}>{t.count}</span>
                    </Link>
                  ))}
                </div>

                <SirkulasiTable
                  loans={enrichedLoans}
                  totalAll={loans?.length || 0}
                  overdueCount={overdueLoans.length}
                />

                {/* ── EXPORT PER PEGAWAI ── */}
                <ExportPerPegawai loans={loans || []} />
              </div>
            )}

            {/* ════════════════════════
                TAB: PEGAWAI
            ════════════════════════ */}
            {activeTab === 'pegawai' && (
              <PegawaiTable
                profiles={profiles || []}
                pendingUsers={pendingUsers}
              />
            )}
            {/* ════════════════════════
                TAB: BUKU TAMU
            ════════════════════════ */}
            {activeTab === 'bukutamu' && (
              <div className="animate-fade-in">
                {/* 👇 UBAH BAGIAN INI */}
                <Bukutamuadmintable entries={bukuTamu || []} />
              </div>
            )}

            {/* ════════════════════════
                TAB: LOG PDF
            ════════════════════════ */}
            {activeTab === 'pdf_logs' && (
              <div className="animate-fade-in">
                <PdfDownloadLog />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV MOBILE ──────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 flex justify-around items-end px-2 pt-3 pb-5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        {navItems.map(item => (
          <Link
            key={item.tab}
            href={`?tab=${item.tab}`}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all relative ${
              activeTab === item.tab ? 'text-[#16213E]' : 'text-slate-400'
            }`}
          >
            {activeTab === item.tab && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#16213E] rounded-full" />
            )}
            <span className={`text-xl ${activeTab === item.tab ? '' : 'grayscale opacity-50'}`}>{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      <AIAssistant />
    </div>
  );
}