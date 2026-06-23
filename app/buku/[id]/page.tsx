import { supabase } from '../../../lib/supabase';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BorrowModal from '../../katalog/BorrowModal';
import ShareButton from './ShareButton';
import DownloadPdfButton from './DownloadPdfButton';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Warna cover per kategori ───────────────────────────────────
const getCoverStyle = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('pidana'))   return { bg: 'from-rose-900 via-rose-800 to-red-950', icon: '⚖️', accent: '#fca5a5' };
  if (cat.includes('perdata'))  return { bg: 'from-blue-900 via-blue-800 to-indigo-950', icon: '📜', accent: '#93c5fd' };
  if (cat.includes('tata'))     return { bg: 'from-violet-900 via-violet-800 to-purple-950', icon: '🏛️', accent: '#c4b5fd' };
  if (cat.includes('keuangan')) return { bg: 'from-yellow-800 via-yellow-700 to-yellow-950', icon: '💰', accent: '#fcd34d' };
  if (cat.includes('korupsi'))  return { bg: 'from-orange-800 via-orange-700 to-red-950', icon: '🔍', accent: '#fdba74' };
  if (cat.includes('ham'))      return { bg: 'from-teal-800 via-teal-700 to-cyan-950', icon: '🤝', accent: '#5eead4' };
  if (cat.includes('pajak'))    return { bg: 'from-green-800 via-green-700 to-blue-950', icon: '📊', accent: '#86efac' };
  return { bg: 'from-[#16213E] via-[#2D6A4F] to-[#0a1f18]', icon: '📚', accent: '#6ee7b7' };
};

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session   = cookieStore.get('session')?.value;
  const userEmail = cookieStore.get('user_email')?.value || '';
  const isLoggedIn = !!session;

  // Fetch buku
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) notFound();

  // Fetch buku terkait (kategori sama, bukan buku ini)
  const { data: related } = await supabase
    .from('books')
    .select('id, title, author, category, stock, rating')
    .eq('category', book.category)
    .neq('id', id)
    .limit(4);

  const cover = getCoverStyle(book.category);
  const ratingStars = Math.round(book.rating || 0);
  const isHabis = book.stock === 0;

  return (
    <div className="min-h-screen bg-[#F3F6F4] font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image src="/logo-kejaksaan.png" alt="Logo" fill className="object-contain rounded-full" />
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Link href="/" className="font-bold text-slate-400 hover:text-blue-600 transition-colors">Beranda</Link>
              <span className="text-slate-300">/</span>
              <Link href="/katalog" className="font-bold text-slate-400 hover:text-blue-600 transition-colors">Katalog</Link>
              <span className="text-slate-300">/</span>
              <span className="font-black text-slate-700 line-clamp-1">{book.title}</span>
            </div>
          </div>
          {isLoggedIn ? (
            <Link href="/katalog" className="px-4 py-2 bg-[#16213E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#143628] transition-all">
              ← Katalog
            </Link>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
              🔐 Login
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 space-y-8">

        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">

          {/* Cover */}
          <div className={`relative bg-gradient-to-br ${cover.bg} flex-shrink-0 w-full md:w-64 lg:w-72 h-56 md:h-auto flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative text-center px-6">
              <div className="text-7xl mb-4 drop-shadow-xl">{cover.icon}</div>
              <p className="text-white/90 text-xs font-black leading-tight line-clamp-4 drop-shadow-md">
                {book.title}
              </p>
            </div>
            {isHabis && (
              <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                <span className="bg-white text-slate-800 text-xs font-black uppercase px-4 py-2 rounded-full tracking-widest shadow-lg">
                  Stok Habis
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full">
              {book.stock} pcs
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              {book.category && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                  {book.category}
                </span>
              )}
              {book.rak && (
                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded border border-slate-100 text-[9px] font-bold">
                  📍 Rak {book.rak}
                </span>
              )}
              {book.nomor_buku && (
                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100 text-[9px] font-mono">
                  ISBN: {book.nomor_buku}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-2">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-sm text-slate-500 font-medium mb-1">oleh <span className="font-bold text-slate-700">{book.author}</span></p>
            )}
            {book.publisher && (
              <p className="text-[11px] text-slate-400 font-medium mb-4">Penerbit: {book.publisher}</p>
            )}

            {/* Rating */}
            {(book.rating_count || 0) > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= ratingStars ? '#F59E0B' : '#E2E8F0'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-black text-slate-700">{Number(book.rating).toFixed(1)}</span>
                <span className="text-[11px] text-slate-400">({book.rating_count} ulasan)</span>
              </div>
            )}

            {/* Ringkasan */}
            {book.ringkasan && (
              <div className="flex-1 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ringkasan</p>
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{book.ringkasan}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <div className="flex flex-1 gap-2">
                {book.pdf_url && (
                  <DownloadPdfButton
                    bookId={book.id}
                    bookTitle={book.title}
                    pdfUrl={book.pdf_url}
                  />
                )}

                <ShareButton title={book.title} />
              </div>
              {isLoggedIn && userEmail ? (
                <div className="flex-1">
                  <BorrowModal book={book} userEmail={userEmail} />
                </div>
              ) : (
                <Link
                  href={`/login?redirect=/buku/${id}`}
                  className="flex-1 text-center py-3.5 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  🔐 Login untuk Pinjam
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Buku Terkait */}
        {related && related.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-[#16213E] rounded-full" />
              <h2 className="font-black text-slate-800 text-base">Buku Terkait — {book.category}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(b => {
                const c = getCoverStyle(b.category || '');
                return (
                  <Link
                    key={b.id}
                    href={`/buku/${b.id}`}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className={`h-24 bg-gradient-to-br ${c.bg} flex items-center justify-center text-3xl`}>
                      {c.icon}
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-black text-slate-800 line-clamp-2 leading-snug mb-1">{b.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{b.author || '—'}</p>
                      <span className={`inline-block mt-2 text-[9px] font-black px-2 py-0.5 rounded-full ${b.stock > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-500'}`}>
                        {b.stock > 0 ? `${b.stock} Tersedia` : 'Habis'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center pb-8">
          <Link href="/katalog" className="inline-flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-[#16213E] transition-colors">
            ← Kembali ke Katalog
          </Link>
        </div>
      </main>
    </div>
  );
}