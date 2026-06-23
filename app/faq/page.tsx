import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import ProfileMenu from '../ProfileMenu';
import AIAssistant from '../AIAssistant';

export const dynamic = 'force-dynamic';

export default async function FAQPage() {
  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || '';
  const userRole  = session === 'admin' ? 'admin' : 'user';
  const isLoggedIn = !!session;

  const faqs = [
    {
      q: "Apa itu Pustaka Datun Kejaksaan Agung?",
      a: "Pustaka Datun adalah platform perpustakaan digital resmi milik Kejaksaan Agung Republik Indonesia yang menyediakan referensi, literatur, serta arsip khusus yang berkaitan dengan bidang Perdata dan Tata Usaha Negara (Datun)."
    },
    {
      q: "Siapa saja yang dapat mengakses layanan Pustaka Datun?",
      a: "Layanan ini dikhususkan bagi Pegawai Kejaksaan RI, khususnya Jaksa Pengacara Negara (JPN) untuk menunjang kebutuhan riset dan penanganan perkara. Masyarakat umum dapat mengakses katalog secara terbatas dan diwajibkan mengisi Buku Tamu apabila datang secara fisik ke perpustakaan."
    },
    {
      q: "Bagaimana cara meminjam buku atau literatur?",
      a: "Untuk peminjaman, pengguna harus masuk (login) menggunakan akun pegawai. Setelah itu, cari buku yang dibutuhkan di Katalog, klik tombol 'Pinjam', lalu ambil buku fisik di perpustakaan dengan menunjukkan kode peminjaman."
    },
    {
      q: "Apakah layanan Pustaka Datun dipungut biaya?",
      a: "Tidak. Seluruh layanan literatur dan akses platform Pustaka Datun sepenuhnya gratis sebagai bentuk fasilitas negara untuk peningkatan kualitas SDM."
    },
    {
      q: "Berapa lama batas waktu peminjaman buku?",
      a: "Batas waktu standar peminjaman buku adalah 7 hari kerja. Anda dapat mengajukan perpanjangan peminjaman melalui sistem jika buku tersebut belum dipesan oleh pegawai lain."
    },
    {
      q: "Apakah Pustaka Datun menyediakan versi E-Book / PDF?",
      a: "Ya. Beberapa literatur resmi, regulasi, dan materi paparan Jamdatun tersedia dalam format PDF yang dapat langsung dibaca melalui sistem tanpa harus meminjam buku fisik."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      
      {/* ── TOP HEADER (Dark) ── */}
      <header className="bg-[#0B1221] text-white">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="text-[#F59E0B] font-black text-2xl tracking-tighter italic">Pustaka</span>
               <span className="text-white font-black text-2xl tracking-tighter">Datun</span>
               <Image src="/logo-kejaksaan.png" alt="Logo Kejaksaan" width={40} height={40} className="ml-2" />
             </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
             <Link href="/" className="hover:text-white">Beranda</Link>
             <Link href="/katalog" className="hover:text-white">Katalog Buku</Link>
             <Link href="/buku-tamu" className="hover:text-white">Buku Tamu</Link>
             <Link href="/faq" className="text-white">F.A.Q</Link>
          </nav>
          
          <div>
            {isLoggedIn ? (
              <ProfileMenu email={userEmail} role={userRole} />
            ) : (
              <Link href="/login" className="bg-white text-slate-900 px-5 py-2 rounded font-bold text-sm hover:bg-gray-200">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="bg-[#132B4A] py-16 border-y-4 border-[#F59E0B] shadow-lg relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-blue-200 rounded text-xs font-bold uppercase tracking-widest mb-4">
            Pusat Bantuan
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Frequently Asked <span className="text-[#F59E0B]">Questions</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Temukan jawaban atas berbagai pertanyaan umum terkait layanan, prosedur peminjaman, dan sistem digital Pustaka Datun.
          </p>
        </div>
      </section>

      {/* ── FAQ CONTENT ── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-[#F59E0B]/40 transition-colors">
              <h3 className="text-lg font-bold text-[#0B1221] mb-3 flex items-start gap-3">
                <span className="text-[#F59E0B] font-black shrink-0">Q.</span>
                {faq.q}
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px] flex items-start gap-3">
                <span className="text-gray-300 font-black shrink-0">A.</span>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#FFFBEB] border border-[#FCD34D] p-6 rounded-xl text-center shadow-sm">
          <p className="text-[#B45309] font-bold text-lg mb-2">Masih memiliki pertanyaan?</p>
          <p className="text-[#92400E] text-sm mb-5">
            Silakan tinggalkan pesan melalui fitur Buku Tamu atau hubungi administrator perpustakaan.
          </p>
          <Link href="/buku-tamu" className="inline-block bg-[#D97706] text-white font-bold px-6 py-2.5 rounded shadow hover:bg-[#B45309] transition-colors text-sm">
            Tanya via Buku Tamu
          </Link>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1A253F] pt-12 pb-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 text-white mb-10">
          <div>
            <h4 className="text-[#F59E0B] font-black tracking-widest mb-4 text-sm">Pustaka Datun</h4>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              Inovasi pelayanan digital di bidang literatur hukum dan referensi perundang-undangan oleh Kejaksaan Agung Republik Indonesia.
            </p>
          </div>
          <div className="md:text-right">
             <h4 className="text-[#F59E0B] font-black tracking-widest mb-4 text-sm">Tautan Cepat</h4>
             <ul className="space-y-2 text-sm text-gray-300 flex flex-col md:items-end">
                <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                <li><Link href="/katalog" className="hover:text-white">Katalog Buku</Link></li>
                <li><Link href="/login" className="hover:text-white">Akses Petugas</Link></li>
             </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-500 font-semibold">
          {new Date().getFullYear()} © Pustaka Datun Kejaksaan Agung Republik Indonesia. All rights reserved.
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
}
