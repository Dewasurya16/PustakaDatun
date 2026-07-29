import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ChangePasswordModal from './ChangePasswordModal';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '../../lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilPage() {
  const authenticatedProfile = await getAuthenticatedProfile();
  if (!authenticatedProfile) redirect('/login');
  const authenticatedSupabase = await createAuthenticatedClient();
  if (!authenticatedSupabase) redirect('/login');
  const session = authenticatedProfile.role;
  const userEmail = authenticatedProfile.email;

  const { data: profile } = await authenticatedSupabase
    .from('profiles')
    .select('*')
    .eq('email', userEmail)
    .single();

  const autoName = userEmail.split('@')[0];
  const { data: pegawai } = await authenticatedSupabase
    .from('Data Pegawai')
    .select('*')
    .ilike('Email', `%${autoName}%`)
    .limit(1)
    .single();

  const { data: loans } = await authenticatedSupabase
    .from('loans')
    .select('id, status, due_date, created_at, books(title, category)')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  const today        = new Date();
  const totalLoans   = loans?.length || 0;
  const activeLoans  = loans?.filter(l => l.status?.toUpperCase() === 'DIPINJAM').length || 0;
  const returnedLoans = loans?.filter(l => ['DIKEMBALIKAN', 'SUDAH DIULAS'].includes(l.status?.toUpperCase())).length || 0;
  const overdueLoans = loans?.filter(l => l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today).length || 0;
  const favoriteCategory = (() => {
    if (!loans || loans.length === 0) return '—';
    const catMap: Record<string, number> = {};
    loans.forEach(l => {
      const relatedBook = l.books as { category?: string } | null;
      const category = relatedBook?.category || 'Lainnya';
      catMap[category] = (catMap[category] || 0) + 1;
    });
    return Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  const displayName = pegawai?.Nama || autoName;
  const roleLabel   = session === 'admin' ? 'Administrator' : 'Pegawai';
  const initial     = displayName.charAt(0).toUpperCase();
  const returnRate  = totalLoans > 0 ? Math.round((returnedLoans / totalLoans) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans pb-16">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 glass-white border-b border-slate-200/50 shadow-[var(--shadow-sm)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image src="/images/logo-kejaksaan.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-slate-800 text-[14px] group-hover:text-[var(--green-main)] transition-colors">Profil Saya</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
          <Link
            href={session === 'admin' ? '/dashboard' : '/katalog'}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-[var(--green-main)] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-[var(--shadow-sm)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="hidden sm:inline">{session === 'admin' ? 'Dashboard' : 'Katalog'}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── WELCOME BANNER ── */}
        <div className="anim-up-1 relative overflow-hidden bg-gradient-to-r from-blue-900 via-[var(--green-main)] to-blue-800 rounded-2xl p-6 flex items-center gap-5 shadow-[var(--shadow-md)] border border-blue-700/30">
          <div className="anim-blob absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-[40px] pointer-events-none" />
          <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            👋
          </div>
          <div className="relative z-10">
            <h2 className="text-[11px] font-black text-blue-300 uppercase tracking-[0.2em]">Selamat Datang, {displayName}!</h2>
            <p className="text-[13px] text-blue-100/80 font-medium mt-1 leading-relaxed max-w-lg">
              Pantau riwayat peminjaman, status akun, dan keamanan kata sandi Anda di sini.
            </p>
          </div>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="anim-up-2 relative bg-gradient-to-br from-[#0f2e22] via-[#16213E] to-[#255940] rounded-[2rem] p-8 text-white shadow-[var(--shadow-green)] overflow-hidden border border-blue-700/20">
          {/* BG decor */}
          <div className="anim-blob absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="anim-blob-d absolute -bottom-10 -left-10 w-56 h-56 bg-yellow-400/8 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute top-6 right-8 opacity-[0.06] text-[8rem] leading-none font-black select-none">⚖</div>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-400/30 to-blue-900/40 border-2 border-white/20 rounded-[1.5rem] flex items-center justify-center shadow-[var(--shadow-lg)] backdrop-blur-md">
                <span className="text-5xl sm:text-6xl font-black text-white">{initial}</span>
              </div>
              {/* Pulse ring */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-400 border-2 border-[#16213E] rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-[pulseRing_2s_infinite]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                <span className="px-3 py-1.5 glass-dark text-blue-300 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                  {roleLabel}
                </span>
                {profile?.status === 'approved' && (
                  <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[9px] font-black uppercase tracking-widest rounded-full">
                    ✓ Terverifikasi
                  </span>
                )}
                {overdueLoans > 0 && (
                  <span className="px-3 py-1.5 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
                    ⚠ {overdueLoans} Terlambat
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight truncate drop-shadow-md">{displayName}</h1>
              <p className="text-white/60 text-[14px] font-medium mt-1 truncate">{userEmail}</p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {pegawai?.Jabatan && (
                  <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest bg-blue-900/50 px-3.5 py-2 rounded-xl border border-blue-500/20 shadow-sm">
                    💼 {pegawai.Jabatan}
                  </span>
                )}
                {pegawai?.['No HP'] && (
                  <span className="text-white/70 text-[10px] font-bold bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 shadow-sm">
                    📱 {pegawai['No HP']}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Total + actions */}
            <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto mt-6 sm:mt-0">
              <div className="glass-dark rounded-2xl px-8 py-5 text-center shadow-[var(--shadow-sm)]">
                <p className="font-display text-4xl font-black text-white tabular-nums leading-none">{totalLoans}</p>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mt-2">Total Pinjaman</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-8 py-4 text-center">
                <p className="font-display text-2xl font-black text-yellow-300 tabular-nums leading-none">{returnRate}%</p>
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1.5">Tingkat Kembali</p>
              </div>
              <ChangePasswordModal />
            </div>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Dipinjam',       value: activeLoans,       icon: '📖', cls: 'from-yellow-50 to-yellow-100/50 border-yellow-200/60 text-yellow-800',   valueCls: 'text-yellow-700' },
            { label: 'Dikembalikan',   value: returnedLoans,     icon: '✅', cls: 'from-blue-50 to-blue-100/50 border-blue-200/60 text-blue-800', valueCls: 'text-blue-700' },
            { label: 'Terlambat',      value: overdueLoans,      icon: '⚠️', cls: 'from-rose-50 to-rose-100/50 border-rose-200/60 text-rose-800',     valueCls: 'text-rose-700' },
            { label: 'Kategori Fav.', value: favoriteCategory,  icon: '🏷️', cls: 'from-blue-50 to-blue-100/50 border-blue-200/60 text-blue-800',     valueCls: 'text-blue-700', isText: true },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`reveal card-hover-sm bg-gradient-to-br ${s.cls} border rounded-[1.25rem] p-5 shadow-[var(--shadow-sm)]`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="text-3xl mb-3 block drop-shadow-sm">{s.icon}</span>
              <p className={`font-black font-display leading-none truncate ${s.isText ? 'text-[17px]' : 'text-3xl'} ${s.valueCls}`}>{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60 mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── DATA KEPEGAWAIAN ── */}
        {pegawai && (
          <div className="reveal bg-white rounded-2xl border border-slate-100 shadow-[var(--shadow-md)] overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--green-main)] via-blue-400 to-yellow-400" />
            <div className="px-7 py-5 border-b border-slate-50 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white mt-1">
              <div className="w-10 h-10 bg-[var(--green-main)] text-white rounded-xl flex items-center justify-center text-[18px] shadow-sm shrink-0">👤</div>
              <div>
                <h2 className="font-black text-slate-900 text-[15px]">Data Kepegawaian</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Informasi resmi dari database kepegawaian</p>
              </div>
            </div>
            <div className="p-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nama Lengkap', value: pegawai.Nama,           icon: '👤' },
                { label: 'Jabatan',      value: pegawai.Jabatan,        icon: '💼' },
                { label: 'Bidang',       value: pegawai.Bidang,         icon: '🏛️' },
                { label: 'No. HP',       value: pegawai['No HP'],       icon: '📱' },
                { label: 'Email',        value: pegawai.Email,          icon: '📧' },
                { label: 'Status Akun',  value: profile?.status === 'approved' ? '✅ Disetujui' : '⏳ Menunggu', icon: '🔐' },
              ].filter(item => item.value).map(item => (
                <div key={item.label} className="flex items-start gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-100 transition-all duration-300 group">
                  <span className="text-[18px] mt-1 flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-[14px] font-bold text-slate-800 truncate mt-1 group-hover:text-[var(--green-main)] transition-colors duration-200">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
