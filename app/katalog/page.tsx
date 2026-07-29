import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '../../lib/auth';
import { isMasterCategoryName } from '../../lib/categories';
import AIAssistant from '../AIAssistant';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';
import type { CatalogBook } from '../components/CatalogBookCard';
import CategoryFilter from './CategoryFilter';
import DueDateBanner from './DueDateBanner';
import PaginationControls from './components/PaginationControls';
import LibraryCatalogCard, {
  BookCover,
} from './components/LibraryCatalogCard';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 12;

type KatalogSearchParams = {
  q?: string | string[];
  cat?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

type LibraryBook = CatalogBook & {
  rating?: number | null;
  rating_count?: number | null;
  created_at?: string | null;
};

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function sanitizeSearchQuery(value: string) {
  return value.replace(/[,().%]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<KatalogSearchParams>;
}) {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect('/login?redirect=/katalog');

  const supabase = await createAuthenticatedClient();
  if (!supabase) redirect('/login?redirect=/katalog');

  const params = await searchParams;
  const query = sanitizeSearchQuery(getSearchValue(params.q));
  const rawCategory = getSearchValue(params.cat);
  const category = isMasterCategoryName(rawCategory) ? rawCategory : '';
  const sort = getSearchValue(params.sort) || 'terbaru';
  const parsedPage = Number.parseInt(getSearchValue(params.page) || '1', 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let booksQuery = supabase.from('books').select('*', { count: 'exact' });
  if (query) {
    booksQuery = booksQuery.or(
      `title.ilike.%${query}%,author.ilike.%${query}%`,
    );
  }
  if (category) booksQuery = booksQuery.eq('category', category);

  if (sort === 'abjad') {
    booksQuery = booksQuery.order('title', { ascending: true });
  } else if (sort === 'stok') {
    booksQuery = booksQuery.order('stock', { ascending: false });
  } else {
    booksQuery = booksQuery.order('created_at', { ascending: false });
  }

  const { data, count, error } = await booksQuery
    .order('id', { ascending: true })
    .range(from, to);
  if (error) throw new Error('Katalog tidak dapat dimuat.');

  const books = (data || []) as LibraryBook[];
  const featuredBooks = books.slice(0, 4);
  const shelfBooks = books.slice(4);
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f9ff_0%,#e8f3ff_48%,#dcecff_100%)] text-[#17131f]">
      <PublicNavbar active="catalog" />

      <main className="px-3 py-6 sm:px-6 sm:py-9 lg:py-12">
        <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[26px] border border-white/90 bg-white shadow-[0_24px_65px_rgba(47,88,128,0.13)]">
          <section className="relative overflow-hidden border-b border-[#dce9f5] bg-[radial-gradient(circle_at_90%_10%,rgba(96,165,250,0.18),transparent_30%),linear-gradient(135deg,#f8fbff_0%,#edf6ff_100%)] px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="absolute -right-14 -top-20 h-44 w-44 rounded-full border-[28px] border-white/55" />
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2f80d1]" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#276fb6]">
                    Perpustakaan Digital
                  </p>
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#17233c] sm:text-[36px]">
                  Koleksi Pustaka Datun
                </h1>
                <p className="mt-2 max-w-xl text-[13px] leading-6 text-slate-500">
                  Temukan referensi hukum, dokumen penunjang, dan literatur
                  internal dalam satu katalog.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white/85 px-3.5 py-2.5 shadow-[0_8px_22px_rgba(47,88,128,0.08)] backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2f80d1]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-black leading-none text-[#17233c]">{count || 0}</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Koleksi tersedia</p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid gap-2.5 rounded-[18px] border border-[#d8e7f4] bg-white/90 p-2.5 shadow-[0_10px_28px_rgba(47,88,128,0.07)] sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.75fr]">
              <Suspense fallback={<div className="h-11 animate-pulse rounded-lg bg-white" />}>
                <SearchBar />
              </Suspense>
              <Suspense fallback={<div className="h-11 animate-pulse rounded-lg bg-white" />}>
                <CategoryFilter />
              </Suspense>
              <Suspense fallback={<div className="h-11 animate-pulse rounded-lg bg-white" />}>
                <SortDropdown />
              </Suspense>
            </div>
          </section>

          <section className="px-5 py-6 sm:px-8 sm:py-7 lg:px-10">
            <DueDateBanner />

            {books.length === 0 ? (
              <div className="mt-8 rounded-[24px] border border-dashed border-[#e8d7d2] bg-[#fffaf8] px-5 py-20 text-center">
                <p className="text-4xl">📚</p>
                <h2 className="mt-4 text-xl font-black text-[#17233c]">Buku tidak ditemukan</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Coba kata kunci atau kategori yang berbeda.
                </p>
                <Link href="/katalog" className="mt-5 inline-flex rounded-full bg-[#17233c] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#243659]">
                  Reset pencarian
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316]">
                      Pilihan katalog
                    </p>
                    <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#17233c]">Buku untuk Anda</h2>
                  </div>
                  <Link href="/layanan" className="hidden rounded-full border border-[#eaded9] px-4 py-2 text-[11px] font-bold text-slate-500 transition hover:border-orange-200 hover:text-[#f97316] sm:inline-flex">
                    Lihat kategori →
                  </Link>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {featuredBooks.map((book, index) => (
                    <LibraryCatalogCard key={book.id} book={book} index={index} />
                  ))}
                </div>

                {shelfBooks.length > 0 ? (
                  <div className="mt-14">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316]">
                          Rak digital
                        </p>
                        <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#17233c]">Koleksi lainnya</h2>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Halaman {currentPage}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 rounded-[24px] border border-[#f1e8e5] bg-[#fffaf8] p-3 sm:grid-cols-3 sm:gap-5 sm:p-5 lg:grid-cols-4 xl:grid-cols-5">
                      {shelfBooks.map((book, index) => (
                        <Link
                          key={book.id}
                          href={`/buku/${book.id}`}
                          className="group min-w-0 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(65,44,42,0.06)] ring-1 ring-[#f2e8e4] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(65,44,42,0.12)]"
                        >
                          <BookCover book={book} index={index + 4} />
                          <h3 className="mt-4 line-clamp-2 min-h-10 text-xs font-black leading-5 text-[#17233c] group-hover:text-[#f97316]">
                            {book.title}
                          </h3>
                          <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
                            {book.author || 'Pustaka Datun'}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold">
                            <span className="text-amber-500">
                              ★ {book.rating ? Number(book.rating).toFixed(1) : '—'}
                            </span>
                            <span className={book.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                              {book.stock > 0 ? `${book.stock} stok` : 'Habis'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-10">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                </div>
              </>
            )}
          </section>

        </div>
      </main>

      <PublicFooter />
      <AIAssistant />
    </div>
  );
}
