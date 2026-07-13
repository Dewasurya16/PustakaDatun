import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { isMasterCategoryName } from '../../lib/categories';
import AIAssistant from '../AIAssistant';
import ProfileMenu from '../ProfileMenu';
import CategoryFilter from './CategoryFilter';
import DueDateBanner from './DueDateBanner';
import MyHistory from './History';
import PaginationControls from './components/PaginationControls';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import CatalogBookCard, { type CatalogBook } from '../components/CatalogBookCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type KatalogSearchParams = {
  q?: string | string[];
  cat?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<KatalogSearchParams>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Pegawai';
  const userRole = session === 'admin' ? 'admin' : 'user';

  if (!session) redirect('/login');

  const params = await searchParams;
  const query = getSearchValue(params?.q).trim();
  const rawCat = getSearchValue(params?.cat);
  const filterCat = isMasterCategoryName(rawCat) ? rawCat : '';
  const sortParam = getSearchValue(params?.sort) || 'terbaru';

  const ITEMS_PER_PAGE = 12;
  const pageNumber = Number.parseInt(
    getSearchValue(params?.page) || '1',
    10,
  );
  const currentPage =
    Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let supabaseQuery = supabase
    .from('books')
    .select('*', { count: 'exact' });

  if (query)
    supabaseQuery = supabaseQuery.or(
      `title.ilike.%${query}%,author.ilike.%${query}%`,
    );
  if (filterCat) supabaseQuery = supabaseQuery.eq('category', filterCat);

  if (sortParam === 'abjad') {
    supabaseQuery = supabaseQuery
      .order('title', { ascending: true })
      .order('id', { ascending: true });
  } else if (sortParam === 'stok') {
    supabaseQuery = supabaseQuery
      .order('stock', { ascending: false })
      .order('id', { ascending: true });
  } else {
    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });
  }

  supabaseQuery = supabaseQuery.range(from, to);

  const { data: books, count } = await supabaseQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
  const catalogBooks = (books || []) as CatalogBook[];

  return (
    <div className="min-h-screen bg-[#eae9e6] text-neutral-950">
      <div className="mx-auto min-h-screen max-w-[1320px] overflow-hidden bg-white shadow-[0_28px_80px_rgba(15,23,42,0.10)] sm:my-6 sm:rounded-2xl">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative overflow-hidden bg-[#ecebea] px-5 pb-20 pt-6 sm:px-10 lg:px-16">
          {/* Background image */}
          <Image
            src="/images/kejaksaan agung.png"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-[0.07] grayscale"
          />

          {/* Decorative shapes */}
          <div className="absolute -left-14 bottom-4 h-28 w-64 rotate-[-14deg] border border-black/5 bg-white/60 shadow-[0_20px_50px_rgba(15,23,42,0.06)]" />
          <div className="absolute -right-8 bottom-8 h-32 w-72 rotate-[10deg] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.06)]" />

          {/* Navigation bar */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-kejaksaan.png"
                alt="Logo Kejaksaan"
                width={34}
                height={34}
                className="object-contain"
              />
              <div className="leading-tight">
                <p className="text-[13px] font-semibold">PustakaDatun</p>
                <p className="text-[11px] text-neutral-500">
                  Katalog Literatur
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden rounded-full border border-neutral-300 bg-white/70 px-4 py-2 text-[12px] font-semibold text-neutral-800 transition-colors hover:bg-white md:inline-flex"
              >
                Menu
              </Link>
              <Link
                href="/katalog"
                className="hidden rounded-full bg-neutral-950 px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-neutral-800 md:inline-flex"
              >
                Katalog
              </Link>
              <ProfileMenu email={userEmail} role={userRole} />
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 mx-auto max-w-2xl pb-4 pt-16 text-center sm:pt-20">
            <h1 className="text-3xl font-semibold tracking-normal text-neutral-950 sm:text-4xl">
              Pustaka Datun Kejaksaan Agung
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[13px] leading-6 text-neutral-600">
              Temukan buku Datun, materi paparan, peraturan, legal opinion,
              dan dokumen penunjang dalam satu katalog digital.
            </p>
            <Link
              href="#koleksi"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-[#27b8a7] px-6 text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(39,184,167,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#1ea393] hover:shadow-[0_14px_28px_rgba(39,184,167,0.30)]"
            >
              Lihat Katalog
            </Link>
          </div>
        </section>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main
          id="koleksi"
          className="relative bg-white px-5 pb-20 sm:px-10 lg:px-16"
        >
          {/* ── Filter bar ── */}
          <div className="relative z-20 mx-auto -mt-8 max-w-5xl rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.07)] sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
              <Suspense
                fallback={
                  <div className="h-11 animate-pulse rounded-lg bg-neutral-100" />
                }
              >
                <SearchBar />
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-11 animate-pulse rounded-lg bg-neutral-100" />
                }
              >
                <CategoryFilter />
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-11 animate-pulse rounded-lg bg-neutral-100" />
                }
              >
                <SortDropdown />
              </Suspense>
              <a
                href="#koleksi"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#27b8a7] px-6 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1ea393] hover:shadow-md"
              >
                Cari
              </a>
            </div>
          </div>

          {/* Due date banner */}
          <div className="mt-8">
            <DueDateBanner userEmail={userEmail} />
          </div>

          {/* ── Section heading ── */}
          <div className="mb-8 mt-14 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-neutral-950">
                Koleksi Terbaru
              </h2>
              <p className="mt-2 text-[13px] text-neutral-500">
                {count || 0} koleksi ditemukan
                {filterCat ? ` dalam kategori ${filterCat}` : ''}.
              </p>
            </div>
            <Link
              href="/katalog"
              className="hidden text-[12px] font-semibold text-neutral-700 transition-colors hover:text-neutral-950 hover:underline sm:inline-flex"
            >
              Tampilkan Semua
            </Link>
          </div>

          {/* ── Book grid ── */}
          {catalogBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {catalogBooks.map((book, index) => (
                  <CatalogBookCard
                    key={book.id}
                    book={book}
                    index={index}
                    primaryAction={
                      <Link
                        href={`/buku/${book.id}`}
                        className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-[11px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md"
                      >
                        Detail & Pinjam
                      </Link>
                    }
                    secondaryAction={
                      book.pdf_url ? (
                        <a
                          href={book.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[11px] font-bold text-neutral-800 transition-all hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-sm"
                        >
                          Unduh PDF
                        </a>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-[11px] font-bold text-neutral-300">
                          PDF
                        </span>
                      )
                    }
                  />
                ))}
              </div>

              <div className="mt-14">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center">
              <p className="text-4xl">📚</p>
              <h3 className="mt-4 text-lg font-semibold text-neutral-950">
                Buku tidak ditemukan
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Coba kata kunci lain atau pilih kategori berbeda.
              </p>
            </div>
          )}

          {/* ── Riwayat peminjaman ── */}
          <section className="mt-20 border-t border-neutral-100 pt-10">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-neutral-950">
                  Riwayat Peminjaman
                </h2>
                <p className="mt-2 text-[13px] text-neutral-500">
                  Kelola peminjaman aktif dan ulasan Anda.
                </p>
              </div>
              <Link
                href="/profil"
                className="text-[12px] font-semibold text-neutral-700 transition-colors hover:text-neutral-950 hover:underline"
              >
                Lihat di Profil
              </Link>
            </div>
            <MyHistory userEmail={userEmail} />
          </section>
        </main>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="bg-neutral-950 px-6 py-10 text-center text-[12px] text-white/50">
          {new Date().getFullYear()} Pustaka Datun Kejaksaan Agung
          Republik Indonesia. All rights reserved.
        </footer>
      </div>

      <AIAssistant />
    </div>
  );
}
