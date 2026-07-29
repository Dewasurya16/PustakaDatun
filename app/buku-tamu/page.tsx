import { supabase } from '../../lib/supabase';
import BukuTamuForm from './components/BukuTamuForm';
import Link from 'next/link';
import AIAssistant from '../AIAssistant';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BukuTamuPage() {
  const { count: totalCount } = await supabase
    .from('buku_tamu')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { data: featuredEntries } = await supabase
    .from('buku_tamu')
    .select('id, nama, bidang, asal_instansi, keperluan, pesan, created_at')
    .eq('status', 'approved')
    .eq('tampil_publik', true)
    .order('created_at', { ascending: false })
    .limit(3);

  const total    = totalCount ?? 0;
  const featured = featuredEntries || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      
      {/* ── TOP HEADER (Dark) ── */}
      <PublicNavbar active="guestbook" />

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-[#10234A] py-16">
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-blue-200 rounded text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-pulse" />
              Layanan Publik Terbuka
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Buku Tamu <span className="text-[#F59E0B]">Digital</span>
            </h1>
            <p className="text-blue-100 max-w-xl text-lg">
              Silakan catat kehadiran Anda sebagai bentuk transparansi dan evaluasi pelayanan Pustaka Datun Kejaksaan Agung.
            </p>
          </div>
          
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/10 border border-white/20 p-5 rounded-xl text-center backdrop-blur-md">
              <p className="text-3xl font-black text-white">{total}</p>
              <p className="text-[10px] text-blue-300 uppercase font-bold tracking-widest mt-1">Total Pengunjung</p>
            </div>
            <div className="bg-[#F59E0B]/20 border border-[#F59E0B]/50 p-5 rounded-xl text-center backdrop-blur-md">
              <p className="text-3xl font-black text-[#F59E0B]">✓</p>
              <p className="text-[10px] text-[#F59E0B] uppercase font-bold tracking-widest mt-1">Verifikasi Ketat</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        
        {/* Testimonial Section */}
        {featured.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-[#F59E0B]" />
              <h2 className="text-2xl font-black text-[#0B1221]">Kunjungan Terbaru</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((entry) => (
                <div key={entry.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm relative">
                  <div className="absolute top-4 right-4 text-[#F59E0B] text-4xl opacity-20 font-serif">“</div>
                  <p className="text-sm text-gray-600 italic mb-6 relative z-10 min-h-[60px]">
                    “{entry.pesan || 'Mengunjungi Pustaka Datun.'}”
                  </p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="w-10 h-10 bg-[#16213E] text-white flex items-center justify-center rounded font-bold">
                      {entry.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0B1221]">{entry.nama}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{entry.bidang || entry.asal_instansi}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-8 border-b border-gray-100 pb-6">
                <h3 className="text-2xl font-black text-[#0B1221] mb-2">Formulir Kunjungan</h3>
                <p className="text-sm text-gray-500">Mohon isi data diri Anda secara lengkap dan benar. Data yang dimasukkan akan divalidasi oleh sistem administrasi.</p>
              </div>
              <BukuTamuForm />
            </div>
          </div>

          {/* Right: Info Area */}
          <div className="space-y-6">
            <div className="bg-[#16213E] text-white p-6 rounded-xl border border-white/10 shadow-lg">
              <h4 className="text-[#F59E0B] font-black text-xs uppercase tracking-widest mb-6">Pusat Informasi</h4>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <span className="text-xl shrink-0 mt-0.5">📍</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Kantor</p>
                    <p className="text-sm font-semibold mt-1 text-gray-200">Jl. Sultan Hasanuddin No.1 Kebayoran Baru, Jakarta Selatan - Indonesia</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="text-xl shrink-0 mt-0.5">✉️</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-semibold mt-1 text-gray-200">pustakadatun@kejaksaan.go.id</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-xl shrink-0 mt-0.5">🕐</span>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jam Layanan</p>
                    <p className="text-sm font-semibold mt-1 text-gray-200">Senin–Jumat, 08.00–16.00 WIB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FCD34D] p-5 rounded-xl shadow-sm">
              <h4 className="text-[#B45309] font-black text-xs uppercase tracking-widest mb-2">Perhatian</h4>
              <p className="text-sm text-[#92400E] leading-relaxed">
                Seluruh data yang Anda masukkan dilindungi oleh sistem keamanan <strong>Kejaksaan Agung</strong>. Pengunjung wajib mematuhi seluruh protokol dan tata tertib yang berlaku di dalam Pustaka Datun.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="hidden">
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
      <PublicFooter />

      <AIAssistant />
    </div>
  );
}
