import Image from 'next/image';
import Link from 'next/link';
import { getAuthenticatedProfile } from '../lib/auth';
import { MASTER_CATEGORY_NAMES } from '../lib/categories';
import { supabase } from '../lib/supabase';
import AIAssistant from './AIAssistant';
import PublicFooter from './components/PublicFooter';
import PublicNavbar from './components/PublicNavbar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SERVICE_CARDS = [
  {
    icon: '🔎',
    title: 'Pencarian Mudah',
    description: 'Temukan koleksi hukum melalui judul, penulis, dan kategori.',
  },
  {
    icon: '📖',
    title: 'Koleksi Digital',
    description: 'Akses dokumen internal secara aman menggunakan akun resmi.',
  },
  {
    icon: '✓',
    title: 'Peminjaman Praktis',
    description: 'Catat peminjaman buku fisik langsung dari katalog digital.',
  },
];

export default async function PublicKatalogPage() {
  const profile = await getAuthenticatedProfile();
  const { data: books } = await supabase
    .from('books')
    .select('id, title, author, category, stock, created_at')
    .order('created_at', { ascending: false });

  const latestBooks = books?.slice(0, 4) || [];
  const catalogHref = profile ? '/katalog' : '/login?redirect=/katalog';

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#10234A]">
      <PublicNavbar active="home" />

      <main>
        <section className="relative overflow-hidden bg-[#F8FAFD]">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />

          <div className="relative mx-auto grid min-h-[570px] max-w-[1180px] items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1967D2]">
                Perpustakaan Digital Internal
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-[-0.035em] text-[#10234A] sm:text-5xl lg:text-[50px]">
                Referensi hukum
                <span className="block text-[#F59E0B]">dalam satu tempat.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm font-medium leading-6 text-slate-500">
                Pustaka Datun membantu pegawai menemukan literatur, dokumen
                penunjang, dan koleksi hukum secara cepat, teratur, dan aman.
              </p>

              <form
                action="/katalog"
                className="mt-7 flex max-w-lg items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(15,35,74,0.08)]"
              >
                <label htmlFor="home-search" className="sr-only">Cari koleksi</label>
                <span className="pl-3 text-slate-400" aria-hidden>⌕</span>
                <input
                  id="home-search"
                  name="q"
                  placeholder="Cari judul atau penulis..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button className="rounded-lg bg-[#1967D2] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1256b4]">
                  Cari
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-semibold text-slate-500">
                <span><strong className="text-[#10234A]">{books?.length || 0}+</strong> koleksi</span>
                <span className="h-4 w-px bg-slate-200" />
                <span><strong className="text-[#10234A]">{MASTER_CATEGORY_NAMES.length}</strong> kategori</span>
                <span className="h-4 w-px bg-slate-200" />
                <span className="flex items-center gap-1.5"><span className="text-emerald-500">●</span> Akses terlindungi</span>
              </div>
            </div>

            <div className="relative mx-auto h-[400px] w-full max-w-[570px] sm:h-[450px]">
              <div className="absolute right-0 top-2 h-[66%] w-[70%] overflow-hidden rounded-[7rem_2rem_7rem_2rem] bg-[#DCE9F8] shadow-[0_22px_52px_rgba(15,35,74,0.12)]">
                <Image
                  src="/images/kejaksaan agung.png"
                  alt="Gedung Kejaksaan Agung"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-1 left-[11%] h-[52%] w-[48%] overflow-hidden rounded-[2rem_5rem_2rem_5rem] border-[7px] border-white bg-slate-100 shadow-[0_20px_45px_rgba(15,35,74,0.14)]">
                <Image
                  src="/images/Jaksa Agung.png"
                  alt="Jaksa Agung Republik Indonesia"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
              <div className="absolute bottom-[5%] right-[1%] w-[43%] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_16px_36px_rgba(15,35,74,0.13)] backdrop-blur">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#1967D2]">Akses Internal</p>
                <p className="mt-1.5 text-xs font-extrabold leading-5 text-[#10234A]">
                  Dokumen hanya tersedia bagi pengguna terverifikasi.
                </p>
              </div>
              <div className="absolute left-[4%] top-[22%] rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(15,35,74,0.11)]">
                <p className="text-[10px] font-bold text-[#1967D2]">✓ Katalog terintegrasi</p>
              </div>
            </div>
          </div>
        </section>

        <section id="layanan" className="relative z-10 -mt-8 px-5 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {SERVICE_CARDS.map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-[0_18px_45px_rgba(15,35,74,0.09)] transition-transform hover:-translate-y-1"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                  {service.icon}
                </div>
                <h2 className="mt-4 text-sm font-extrabold">{service.title}</h2>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">{service.description}</p>
                <Link href="/layanan" className="mt-4 inline-flex text-[10px] font-bold text-[#1967D2]">
                  Pelajari layanan <span className="ml-1">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1967D2]">Koleksi Terbaru</span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Baru ditambahkan</h2>
              </div>
              <Link href={catalogHref} className="text-[11px] font-bold text-[#1967D2]">Lihat seluruh koleksi →</Link>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {latestBooks.map((book, index) => (
                <Link
                  href={profile ? `/buku/${book.id}` : `/login?redirect=/buku/${book.id}`}
                  key={book.id}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_34px_rgba(15,35,74,0.07)] transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`flex h-32 items-center justify-center text-4xl ${
                    index % 2 === 0
                      ? 'bg-gradient-to-br from-[#17396f] to-[#1967D2]'
                      : 'bg-gradient-to-br from-[#0f766e] to-[#164e63]'
                  }`}>
                    📚
                  </div>
                  <div className="p-5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#1967D2]">
                      {book.category || 'Koleksi Umum'}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-[#10234A] group-hover:text-[#1967D2]">
                      {book.title}
                    </h3>
                    <p className="mt-3 truncate text-[10px] text-slate-400">{book.author || 'Tim Kejaksaan'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 overflow-hidden rounded-3xl bg-[#10234A] px-7 py-10 text-white sm:flex-row sm:px-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">Mulai sekarang</p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Temukan referensi yang Anda butuhkan.</h2>
              <p className="mt-2 text-xs text-slate-300">Masuk menggunakan akun yang telah disetujui administrator.</p>
            </div>
            <Link href={catalogHref} className="shrink-0 rounded-lg bg-[#F59E0B] px-7 py-3.5 text-[11px] font-bold text-white hover:bg-amber-600">
              Buka Pustaka
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />

      <AIAssistant />
    </div>
  );
}
