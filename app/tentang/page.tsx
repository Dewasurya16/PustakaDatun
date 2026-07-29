import Image from 'next/image';
import Link from 'next/link';
import { MASTER_CATEGORY_NAMES } from '../../lib/categories';
import { supabase } from '../../lib/supabase';
import AIAssistant from '../AIAssistant';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  const { count } = await supabase
    .from('books')
    .select('id', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-white text-[#10234A]">
      <PublicNavbar active="about" />
      <main>
        <section className="bg-[#F7F9FC] px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1967D2]">Tentang Kami</span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Pusat pengetahuan untuk mendukung tugas Datun
              </h1>
              <p className="mt-6 text-sm leading-7 text-slate-500">
                Pustaka Datun merupakan pusat referensi internal Jaksa Agung
                Muda Bidang Perdata dan Tata Usaha Negara yang membantu pegawai
                memperoleh literatur secara tertata, cepat, dan aman.
              </p>
            </div>
            <div className="relative min-h-[390px] overflow-hidden rounded-[2rem_7rem_2rem_7rem] bg-[#DDE8F5]">
              <Image src="/images/kejaksaan agung.png" alt="Kantor Kejaksaan Agung" fill priority className="object-cover" />
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {[
              ['Visi', 'Menjadi pusat literatur hukum internal yang tepercaya, modern, dan mudah diakses.'],
              ['Misi', 'Mengelola pengetahuan serta mendukung pembelajaran dan pelaksanaan tugas pegawai.'],
              ['Komitmen', 'Menjaga kerahasiaan dokumen dan memastikan akses hanya untuk pengguna berwenang.'],
            ].map(([title, description], index) => (
              <article key={title} className="rounded-2xl border border-slate-100 p-7 shadow-[0_14px_38px_rgba(15,35,74,0.07)]">
                <p className="text-3xl font-extrabold text-blue-100">0{index + 1}</p>
                <h2 className="mt-4 text-lg font-extrabold">{title}</h2>
                <p className="mt-3 text-xs leading-6 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#10234A] px-5 py-16 text-white sm:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div><p className="text-3xl font-extrabold text-[#F59E0B]">{count || 0}+</p><p className="mt-2 text-[10px] text-slate-300">Koleksi</p></div>
            <div><p className="text-3xl font-extrabold text-[#F59E0B]">{MASTER_CATEGORY_NAMES.length}</p><p className="mt-2 text-[10px] text-slate-300">Kategori</p></div>
            <div><p className="text-3xl font-extrabold text-[#F59E0B]">24/7</p><p className="mt-2 text-[10px] text-slate-300">Katalog tersedia</p></div>
            <div><p className="text-3xl font-extrabold text-[#F59E0B]">100%</p><p className="mt-2 text-[10px] text-slate-300">Akses terlindungi</p></div>
          </div>
        </section>

        <section className="px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-extrabold">Ingin mengetahui cara menggunakan Pustaka?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
            Pelajari fitur yang tersedia atau lihat jawaban atas pertanyaan umum.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/layanan" className="rounded-lg bg-[#1967D2] px-6 py-3 text-[11px] font-bold text-white">Lihat Layanan</Link>
            <Link href="/faq" className="rounded-lg border border-blue-200 px-6 py-3 text-[11px] font-bold text-[#1967D2]">Buka F.A.Q</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
      <AIAssistant />
    </div>
  );
}
