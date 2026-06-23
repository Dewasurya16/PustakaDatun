import { supabase } from '../../lib/supabase';
import BorrowModal from './BorrowModal';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import CategoryFilter from './CategoryFilter';
import MyHistory from './History';
import AIAssistant from '../AIAssistant';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileMenu from '../ProfileMenu';
import BacaPDFModal from '../dashboard/BacaPDFModal';
import ScanBukuModal from '../dashboard/ScanBukuModal';
import QRCodeModal from '../dashboard/QRCodeModal';
import Image from 'next/image';
import PaginationControls from './components/PaginationControls';
import DueDateBanner from './DueDateBanner';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KatalogPage(props: any) {
  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || 'Pegawai';
  const userRole  = session === 'admin' ? 'admin' : 'user';

  if (!session) redirect('/login');

  const searchParams = await props.searchParams;
  const query      = searchParams?.q   || '';
  const filterCat  = searchParams?.cat || '';
  const sortParam  = searchParams?.sort || 'terbaru';
  
  const ITEMS_PER_PAGE = 12; 
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let supabaseQuery = supabase.from('books').select('*', { count: 'exact' });
  
  if (query)     supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
  if (filterCat) supabaseQuery = supabaseQuery.ilike('category', filterCat);

  if (sortParam === 'abjad') {
    supabaseQuery = supabaseQuery.order('title', { ascending: true }).order('id', { ascending: true });
  } else if (sortParam === 'stok') {
    supabaseQuery = supabaseQuery.order('stock', { ascending: false }).order('id', { ascending: true });
  } else {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false }).order('id', { ascending: true });
  }

  supabaseQuery = supabaseQuery.range(from, to);

  const { data: books, count } = await supabaseQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  const { data: catData } = await supabase.from('books').select('category');
  const uniqueCategories = Array.from(
    new Set(catData?.map(b => b.category).filter(Boolean))
  ) as string[];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();

  return (
    <div className="min-h-screen bg-[#0B1221] font-sans pb-40 text-gray-200">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#0B1221] border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="text-[#F59E0B] font-black text-2xl tracking-tighter italic">Pustaka</span>
               <span className="text-white font-black text-2xl tracking-tighter">Datun</span>
               <Image src="/logo-kejaksaan.png" alt="Logo Kejaksaan" width={40} height={40} className="ml-2" />
             </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
             <Link href="/" className="hover:text-white">Beranda</Link>
             <Link href="/katalog" className="text-white">Katalog Buku</Link>
             <Link href="/buku-tamu" className="hover:text-white">Buku Tamu</Link>
             <Link href="/faq" className="hover:text-white">F.A.Q</Link>
          </nav>
          
          <ProfileMenu email={userEmail} role={userRole} />
        </div>
      </header>

      <div className="mt-4 px-4 max-w-7xl mx-auto">
        <DueDateBanner userEmail={userEmail} />
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* ── MAIN CONTENT (Left) ── */}
        <div className="flex-1">
          <h1 className="text-3xl font-black text-white mb-6">Katalog Referensi Literatur</h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#16213E] p-4 rounded-xl border border-white/5 mb-6 shadow-sm">
             <div className="flex items-center gap-2">
               <span className="text-xs text-gray-400">Menampilkan</span>
               <span className="text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded">{count || 0} hasil</span>
               {filterCat && <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-0.5 rounded uppercase">{filterCat}</span>}
             </div>
             
             <div className="flex items-center gap-3 w-full sm:w-auto">
               <Suspense fallback={<div className="h-10 w-32 bg-white/5 rounded animate-pulse" />}>
                 <SortDropdown />
               </Suspense>
               <ScanBukuModal isLoggedIn={true} userEmail={userEmail} />
             </div>
          </div>

          {/* ── BOOK GRID ── */}
          {books && books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {books.map((book) => {
                  const isNew   = new Date(book.created_at).getTime() > sevenDaysAgo;
                  const isHabis = book.stock === 0;

                  return (
                    <div
                      key={book.id}
                      className={`group relative rounded-[1.5rem] border ${isHabis ? 'border-red-900/50 opacity-75' : 'border-white/10 hover:border-[#F59E0B]/50'} overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]`}
                    >
                      {/* Glass background */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#16213E]/80 to-[#0B1221]/90 backdrop-blur-xl -z-10" />
                      
                      {/* Accent Top Gradient */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="p-5 flex flex-col flex-grow z-10">
                        {/* Tags */}
                        <div className="flex items-start justify-between mb-4">
                          <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-[#F59E0B]/20 flex items-center gap-1.5">
                            <span className="text-xs">📚</span> {book.category || 'Umum'}
                          </span>
                          {isNew && <span className="text-[9px] bg-blue-500 text-white uppercase tracking-widest px-2 py-1 rounded-md font-black shadow-lg shadow-blue-500/20">Baru</span>}
                        </div>

                        {/* Title & Author */}
                        <Link href={`/buku/${book.id}`}>
                          <h3 className="font-black text-white text-[16px] mb-1.5 group-hover:text-[#F59E0B] transition-colors line-clamp-2 leading-tight">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-[11px] text-gray-400 font-semibold truncate mb-4 flex items-center gap-1.5">
                          <span className="text-gray-500">✍️</span> {book.author || 'Tim Kejaksaan'}
                        </p>

                        {/* Synopsis */}
                        <div className="bg-white/5 group-hover:bg-white/[0.07] transition-colors p-3.5 rounded-xl mb-5 flex-grow border border-white/5">
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-medium">
                            {book.ringkasan || `Literatur mengenai ${book.title}. Dapat dipinjam untuk referensi internal.`}
                          </p>
                        </div>

                        {/* Info Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-300 font-bold mb-5 px-1">
                           <span className="flex items-center gap-2">
                             <span className="relative flex h-2.5 w-2.5">
                               {!isHabis && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                               <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isHabis ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                             </span>
                             {isHabis ? <span className="text-red-400">Habis</span> : <span className="text-emerald-400">{book.stock} Tersedia</span>}
                           </span>
                           {book.rak && <span className="text-gray-500 text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md">Rak {book.rak}</span>}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2.5 mt-auto">
                           <Link href={`/buku/${book.id}`} className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                             Detail
                           </Link>
                           <BorrowModal book={book} userEmail={userEmail} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <PaginationControls currentPage={currentPage} totalPages={totalPages} />
              </div>
            </>
          ) : (
            <div className="py-20 bg-[#16213E] rounded-xl border border-white/5 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-white mb-2">Buku Tidak Ditemukan</h3>
              <p className="text-sm text-gray-400">Coba gunakan kata kunci lain atau pilih kategori berbeda.</p>
            </div>
          )}

          {/* ── HISTORY SECTION ── */}
          <div className="mt-16 bg-[#16213E] rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white">Riwayat Peminjaman</h2>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-1">
                  Kelola peminjaman aktif & ulasan Anda
                </p>
              </div>
              <Link 
                href="/profil" 
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase transition-colors"
              >
                Lihat di Profil
              </Link>
            </div>
            <MyHistory userEmail={userEmail} />
          </div>

        </div>

        {/* ── SIDEBAR (Right) ── */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
           
           <div className="bg-[#16213E] p-5 rounded-xl border border-white/5 shadow-lg">
             <h3 className="text-[11px] font-black text-[#F59E0B] tracking-[0.15em] mb-4 uppercase">Cari Pustaka</h3>
             <Suspense fallback={<div className="h-12 bg-white/5 rounded animate-pulse" />}>
               <SearchBar />
             </Suspense>
           </div>

           <div className="bg-[#16213E] p-5 rounded-xl border border-white/5 shadow-lg">
             <h3 className="text-[11px] font-black text-[#F59E0B] tracking-[0.15em] mb-4 uppercase">Kategori Literatur</h3>
             <Suspense fallback={<div className="h-64 bg-white/5 rounded animate-pulse" />}>
               <CategoryFilter categories={uniqueCategories} />
             </Suspense>
           </div>

        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="mt-20 border-t border-white/10 bg-[#0B1221] py-8 text-center text-xs text-gray-500 font-semibold">
          {new Date().getFullYear()} © Pustaka Datun Kejaksaan Agung Republik Indonesia. All rights reserved.
      </footer>

      <AIAssistant />
    </div>
  );
}