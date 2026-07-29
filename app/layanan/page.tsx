import Link from 'next/link';
import { getAuthenticatedProfile } from '../../lib/auth';
import { MASTER_CATEGORY_NAMES } from '../../lib/categories';
import { supabase } from '../../lib/supabase';
import AIAssistant from '../AIAssistant';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORY_ICONS = ['📚', '📊', '⚖️', '💡', '📁', '🏛️', '🏢', '🛡️', '🛒', '🤝', '🎓', '📄', '📈', '👥'];

const SERVICES = [
  ['🔎', 'Pencarian Koleksi', 'Cari berdasarkan judul, penulis, kategori, atau kata kunci.'],
  ['📖', 'Akses E-Book', 'Baca dokumen digital melalui jalur privat setelah login.'],
  ['🔖', 'Peminjaman Buku', 'Catat peminjaman dan pantau tenggat pengembalian.'],
  ['🧾', 'Riwayat Aktivitas', 'Lihat riwayat peminjaman dan status koleksi Anda.'],
  ['💬', 'Asisten Lexi', 'Dapatkan bantuan pencarian melalui asisten perpustakaan.'],
  ['🛡️', 'Akses Terlindungi', 'Dokumen rahasia hanya tersedia untuk akun terverifikasi.'],
];

export default async function ServicesPage() {
  const profile = await getAuthenticatedProfile();
  const { data: books } = await supabase.from('books').select('category');
  const catalogHref = profile ? '/katalog' : '/login?redirect=/katalog';

  return (
    <div className="min-h-screen bg-white text-[#10234A]">
      <PublicNavbar active="services" />
      <main>
        <section className="bg-[#F7F9FC] px-5 py-20 text-center sm:px-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1967D2]">
            Layanan Pustaka
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Layanan literatur dalam satu sistem yang aman
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
            Setiap fitur dirancang untuk memudahkan pencarian, akses, dan
            pengelolaan koleksi internal.
          </p>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(([icon, title, description]) => (
              <article key={title} className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_14px_38px_rgba(15,35,74,0.07)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl">{icon}</div>
                <h2 className="mt-5 text-base font-extrabold">{title}</h2>
                <p className="mt-2 text-xs leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#F7F9FC] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1967D2]">Digital Library</span>
              <h2 className="mt-3 text-3xl font-extrabold">Kategori koleksi</h2>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {MASTER_CATEGORY_NAMES.map((category, index) => (
                <Link
                  key={category}
                  href={profile ? `/katalog?cat=${encodeURIComponent(category)}` : catalogHref}
                  className="rounded-2xl border border-slate-100 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#1967D2] text-lg text-white">
                    {CATEGORY_ICONS[index]}
                  </div>
                  <h3 className="mt-4 min-h-9 text-[11px] font-extrabold leading-4">{category}</h3>
                  <p className="mt-2 text-[10px] text-slate-400">
                    {books?.filter((book) => book.category === category).length || 0} koleksi
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl bg-[#10234A] px-8 py-10 text-white sm:flex-row">
            <div>
              <h2 className="text-2xl font-extrabold">Siap menggunakan layanan?</h2>
              <p className="mt-2 text-xs text-slate-300">Masuk dengan akun yang telah disetujui administrator.</p>
            </div>
            <Link href={catalogHref} className="rounded-lg bg-[#F59E0B] px-7 py-3.5 text-[11px] font-bold">
              Buka Katalog
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
      <AIAssistant />
    </div>
  );
}
