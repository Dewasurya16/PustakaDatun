import { supabase } from '../lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import AIAssistant from './AIAssistant';
import { MASTER_CATEGORY_NAMES } from '../lib/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORY_ICONS = {
  'Buku Datun': '📚',
  'Materi Paparan Jamdatun': '📊',
  'Peraturan': '⚖️',
  'Pengetahuan penunjang': '💡',
  'Berkas perkara lengkap': '📁',
  'LO kebijakan dan legislasi': '🏛️',
  'LO korporasi': '🏢',
  'LO litigasi': '⚔️',
  'LO pengadaan - pbj': '🛒',
  'LO perjanjian': '🤝',
  'Materi pelatihan': '🎓',
  'Perjanjian kerja sama': '📄',
  'Laporan perkembangan THL': '📈',
  'Materi Rakernas': '👥',
} satisfies Record<(typeof MASTER_CATEGORY_NAMES)[number], string>;

const categories = MASTER_CATEGORY_NAMES.map((name) => ({
  name,
  icon: CATEGORY_ICONS[name],
}));

const getCoverStyle = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('peraturan') || cat.includes('legislasi')) return { bg: 'from-blue-900 via-blue-800 to-indigo-950', icon: '⚖️', accent: '#93c5fd', stripe: '#1d4ed8' };
  if (cat.includes('litigasi') || cat.includes('perkara')) return { bg: 'from-rose-900 via-rose-800 to-red-950', icon: '⚔️', accent: '#fca5a5', stripe: '#be123c' };
  if (cat.includes('korporasi')) return { bg: 'from-yellow-800 via-yellow-700 to-yellow-950', icon: '🏢', accent: '#fcd34d', stripe: '#d97706' };
  if (cat.includes('perjanjian')) return { bg: 'from-teal-800 via-teal-700 to-cyan-950', icon: '🤝', accent: '#5eead4', stripe: '#0f766e' };
  return { bg: 'from-[#16213E] via-[#1F2E54] to-[#0B1221]', icon: '📚', accent: '#60A5FA', stripe: '#3B82F6' };
};

export default async function PublicKatalogPage() {
  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || '';
  const isLoggedIn = !!session;

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  const newBooks = books?.slice(0, 5) || [];
  const popularBooks = books?.slice(5, 10) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans overflow-x-hidden text-slate-800">
      
      {/* ── TOP HEADER (Dark) ── */}
      <header className="bg-[#0B1221] text-white">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="text-[#F59E0B] font-black text-2xl tracking-tighter italic">Pustaka</span>
               <span className="text-white font-black text-2xl tracking-tighter">Datun</span>
               <Image src="/logo-kejaksaan.png" alt="Logo Kejaksaan" width={40} height={40} className="ml-2" />
             </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
             <Link href="#" className="text-white">Beranda</Link>
             <Link href="/katalog" className="hover:text-white">Katalog Buku</Link>
             <Link href="/buku-tamu" className="hover:text-white">Buku Tamu</Link>
             <Link href="/faq" className="hover:text-white">F.A.Q</Link>
          </nav>
          
          <div>
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-white text-slate-900 px-5 py-2 rounded font-bold text-sm hover:bg-gray-200">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-white text-slate-900 px-5 py-2 rounded font-bold text-sm hover:bg-gray-200">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION (Light) ── */}
      <section className="relative bg-white border-b border-gray-200 overflow-hidden" style={{minHeight: '460px'}}>
        {/* Background Image with Transparency */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.18]"
          style={{ backgroundImage: "url('/images/kejaksaan agung.png')", backgroundSize: 'cover', backgroundPosition: 'center 5%', backgroundRepeat: 'no-repeat' }}
        />

        {/* Teks Kiri */}
        <div className="relative z-10 max-w-6xl mx-auto px-8 pt-14 pb-16">
          <div className="max-w-sm space-y-5">
             <h1 className="text-4xl md:text-5xl font-black text-[#1F2937] leading-[1.1]">
               Layanan<br/>
               <span className="text-[#F59E0B]">Pustaka Datun</span>
             </h1>
             <p className="text-[#4B5563] text-[15px] leading-relaxed">
               Kami siap memberikan referensi dan literatur terbaik bagi kebutuhan hukum Anda. Dilayani langsung oleh sistem digital secara profesional.<br/>
               <strong className="text-[#F59E0B] mt-2 inline-block">Kejaksaan Agung Republik Indonesia</strong>
             </p>
             <div>
               <Link href="/katalog" className="inline-block bg-[#F59E0B] text-white font-bold px-7 py-3 rounded hover:bg-[#D97706] transition-colors shadow-md">
                 Selengkapnya
               </Link>
             </div>
          </div>
        </div>
          
        {/* Foto Jaksa Agung — ditempel di kanan, rata bawah section */}
        <div className="absolute right-24 bottom-0 w-[280px] h-[360px] md:w-[360px] md:h-[430px] hidden md:block z-10">
           <Image 
             src="/images/Jaksa Agung.png" 
             alt="Jaksa Agung Republik Indonesia" 
             fill 
             className="object-contain object-bottom drop-shadow-[0_10px_20px_rgba(11,18,33,0.18)]"
             priority
           />
        </div>

      </section>

      {/* ── SEARCH BANNER (Dark Blue) ── */}
      <section className="bg-[#132B4A] py-8 border-y-4 border-[#F59E0B] relative z-20 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          <span className="text-white font-bold text-lg whitespace-nowrap">Masukkan kata kunci pencarian</span>
          <form action="/katalog" className="flex w-full sm:w-auto flex-1 shadow-inner rounded overflow-hidden">
            <input type="text" name="q" placeholder="Cari judul, pengarang, penerbit..." className="w-full px-5 py-4 bg-white outline-none text-slate-800 font-medium" />
            <button type="submit" className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-10 font-black tracking-wider transition-colors text-lg">
              CARI
            </button>
          </form>
        </div>
      </section>

      {/* ── KATEGORI BUKU ── */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl font-black text-slate-800 mb-10">Kategori Koleksi Buku</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const count = books?.filter(b => b.category === cat.name).length || 0;
            return (
              <Link href={`/katalog?cat=${encodeURIComponent(cat.name)}`} key={cat.name} className="bg-white border border-gray-200 p-5 rounded-xl flex items-center gap-4 hover:border-[#F59E0B] hover:shadow-lg transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-full border-2 border-[#F59E0B]/20 bg-[#F59E0B]/5 flex items-center justify-center text-xl text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white group-hover:border-[#F59E0B] transition-colors shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[12px] leading-tight text-gray-800 group-hover:text-[#F59E0B] transition-colors">{cat.name}</h3>
                  <p className="text-lg font-black text-slate-400 group-hover:text-slate-900 mt-0.5">{count}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── TERBARU & POPULER (OVERHAULED WITH CARDS) ── */}
      <section className="py-10 pb-20 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kolom Terbaru */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
              <h2 className="text-2xl font-black text-[#0B1221]">Terbaru Ditambahkan</h2>
            </div>
            <Link href="/katalog?sort=terbaru" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">
              Lihat Semua →
            </Link>
          </div>
          
          <div className="flex flex-col gap-6 relative z-10">
            {newBooks.map(book => {
              const cover = getCoverStyle(book.category);
              return (
                <Link href={`/buku/${book.id}`} key={book.id} className="group flex gap-5 items-center p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-lg shadow-md bg-gradient-to-br ${cover.bg} relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cover.stripe }} />
                    <span className="text-2xl sm:text-3xl drop-shadow-md relative z-10 group-hover:scale-110 transition-transform">{cover.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="text-[9px] font-black uppercase text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-0.5 rounded tracking-widest">{book.category || 'Umum'}</span>
                     <h3 className="font-bold text-slate-800 text-[15px] sm:text-base mt-2 mb-1 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">{book.title}</h3>
                     <p className="text-[11px] text-gray-500 font-medium truncate">{book.author || 'Tim Kejaksaan'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Kolom Paling Sering Dilihat */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <h2 className="text-2xl font-black text-[#0B1221]">Paling Sering Dilihat</h2>
            </div>
            <Link href="/katalog?sort=populer" className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">
              Lihat Semua →
            </Link>
          </div>
          
          <div className="flex flex-col gap-6 relative z-10">
            {popularBooks.map(book => {
              const cover = getCoverStyle(book.category);
              return (
                <Link href={`/buku/${book.id}`} key={book.id} className="group flex gap-5 items-center p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-lg shadow-md bg-gradient-to-br ${cover.bg} relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cover.stripe }} />
                    <span className="text-2xl sm:text-3xl drop-shadow-md relative z-10 group-hover:scale-110 transition-transform">{cover.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded tracking-widest">{book.category || 'Umum'}</span>
                     <h3 className="font-bold text-slate-800 text-[15px] sm:text-base mt-2 mb-1 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">{book.title}</h3>
                     <p className="text-[11px] text-gray-500 font-medium truncate">{book.author || 'Tim Kejaksaan'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-10">
        
        {/* Disclaimer */}
        <div className="bg-[#2D3748] py-8">
          <div className="max-w-6xl mx-auto px-4 flex gap-6 items-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#F59E0B] text-[#F59E0B] text-4xl flex items-center justify-center font-black shrink-0">!</div>
            <div>
              <h3 className="text-white text-xl font-bold mb-1">Disclaimer</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Semua data literatur yang diberikan pada platform ini bersifat informasi, dan <strong className="text-[#F59E0B]">TIDAK</strong> dapat digunakan sebagai alat bukti di depan persidangan. Silakan mengunjungi kantor <strong className="text-[#F59E0B]">Pustaka Datun Kejaksaan Agung</strong> jika Anda membutuhkan informasi lebih lanjut.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="bg-[#1A253F] py-12">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 text-white">
            
            <div>
              <h4 className="text-[#F59E0B] font-black tracking-widest mb-6">HUBUNGI KAMI</h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-sm shrink-0">✉️</div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                    <p className="text-sm font-semibold">pustakadatun@kejaksaan.go.id</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-sm shrink-0">📍</div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Alamat Kantor</p>
                    <p className="text-sm font-semibold leading-snug text-gray-300">
                      Jl. Sultan Hasanuddin No.1 Kebayoran Baru<br/>Jakarta Selatan - Indonesia
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">IKUTI KAMI</p>
                <div className="flex gap-2">
                  {['f', 't', 'ig'].map(ico => (
                    <div key={ico} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs hover:bg-white/10 cursor-pointer">
                      {ico}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[#F59E0B] font-black tracking-widest mb-6">MENU</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="#katalog" className="hover:text-white flex items-center gap-2"><span className="text-[#F59E0B]">•</span> Katalog Buku</Link></li>
                <li><Link href="/buku-tamu" className="hover:text-white flex items-center gap-2"><span className="text-[#F59E0B]">•</span> Buku Tamu</Link></li>
                <li><Link href="#" className="hover:text-white flex items-center gap-2"><span className="text-[#F59E0B]">•</span> Tentang Pustaka Datun</Link></li>
                <li><Link href="#" className="hover:text-white flex items-center gap-2"><span className="text-[#F59E0B]">•</span> Layanan Publik</Link></li>
              </ul>
            </div>

            <div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="text-[#F59E0B]">👥</span> Statistik Pengunjung
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'HARI INI', value: 12 },
                    { label: 'KEMARIN', value: 45 },
                    { label: 'MINGGU INI', value: 230 },
                    { label: 'BULAN INI', value: 1042 },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded p-3">
                      <p className="text-[9px] font-bold text-gray-400">{s.label}</p>
                      <p className="text-lg font-black">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-[#0B1221] py-4 text-center text-xs text-gray-500 font-semibold border-t border-white/5">
          {new Date().getFullYear()} © Pustaka Datun Kejaksaan Agung Republik Indonesia. All rights reserved.
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
}
