import { notFound } from 'next/navigation';
import Link from 'next/link';
import BorrowModal from '../../katalog/BorrowModal';
import ShareButton from './ShareButton';
import DownloadPdfButton from './DownloadPdfButton';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '../../../lib/auth';
import { redirect } from 'next/navigation';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';
import AIAssistant from '../../AIAssistant';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Warna cover per kategori ───────────────────────────────────
const getCoverStyle = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('peraturan') || cat.includes('legislasi')) return { bg: 'from-blue-900 via-blue-800 to-indigo-950', icon: '⚖️', accent: '#93c5fd' };
  if (cat.includes('litigasi') || cat.includes('perkara')) return { bg: 'from-rose-900 via-rose-800 to-red-950', icon: '⚔️', accent: '#fca5a5' };
  if (cat.includes('korporasi')) return { bg: 'from-yellow-800 via-yellow-700 to-yellow-950', icon: '🏢', accent: '#fcd34d' };
  if (cat.includes('pengadaan')) return { bg: 'from-green-800 via-green-700 to-emerald-950', icon: '🛒', accent: '#86efac' };
  if (cat.includes('perjanjian') || cat.includes('kerja sama')) return { bg: 'from-teal-800 via-teal-700 to-cyan-950', icon: '🤝', accent: '#5eead4' };
  if (cat.includes('pelatihan') || cat.includes('paparan') || cat.includes('rakernas')) return { bg: 'from-violet-900 via-violet-800 to-purple-950', icon: '🎓', accent: '#c4b5fd' };
  if (cat.includes('thl')) return { bg: 'from-orange-800 via-orange-700 to-red-950', icon: '📈', accent: '#fdba74' };
  return { bg: 'from-[#16213E] via-[#2D6A4F] to-[#0a1f18]', icon: '📚', accent: '#6ee7b7' };
};

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await getAuthenticatedProfile();
  if (!profile) redirect(`/login?redirect=/buku/${encodeURIComponent(id)}`);
  const authenticatedSupabase = await createAuthenticatedClient();
  if (!authenticatedSupabase) {
    redirect(`/login?redirect=/buku/${encodeURIComponent(id)}`);
  }
  const userEmail = profile.email;

  // Fetch buku
  const { data: book, error } = await authenticatedSupabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !book) notFound();

  // Fetch buku terkait (kategori sama, bukan buku ini)
  const { data: related } = await authenticatedSupabase
    .from('books')
    .select('id, title, author, category, stock, rating')
    .eq('category', book.category)
    .neq('id', id)
    .limit(4);

  const cover = getCoverStyle(book.category);
  const ratingStars = Math.round(book.rating || 0);
  const isHabis = book.stock === 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f9fc_0%,#edf3f8_48%,#e7eef5_100%)] font-sans text-slate-900">

      <PublicNavbar active="catalog" />

      <main className="mx-auto max-w-[1120px] space-y-6 px-3 py-5 sm:px-6 sm:py-7 lg:py-9">
        <nav className="flex min-w-0 items-center gap-2 px-1 text-[10px] font-bold text-[#846f6a]" aria-label="Breadcrumb">
          <Link href="/katalog" className="transition hover:text-[#f97316]">Katalog</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-[#17233c]">{book.title}</span>
        </nav>

        {/* Hero Card */}
        <div className="grid gap-6 rounded-[26px] border border-white/80 bg-white p-4 shadow-[0_20px_55px_rgba(89,55,51,0.13)] sm:p-6 md:grid-cols-[240px_1fr] lg:gap-8 lg:p-7">

          {/* Cover */}
          <div className={`relative mx-auto flex h-[350px] w-full max-w-[240px] items-center justify-center overflow-hidden rounded-[6px_18px_18px_6px] bg-gradient-to-br p-6 shadow-[0_18px_36px_rgba(15,23,42,0.22)] md:mx-0 md:h-[380px] ${cover.bg}`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="absolute inset-y-0 left-0 w-[9%] border-r border-white/10 bg-black/15" />
            <div className="relative max-w-[190px] text-center">
              <div className="mb-5 text-6xl drop-shadow-xl">{cover.icon}</div>
              <p className="line-clamp-5 text-sm font-black leading-snug text-white/95 drop-shadow-md">
                {book.title}
              </p>
              <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
                {book.category || 'Pustaka Datun'}
              </p>
            </div>
            {isHabis && (
              <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                <span className="bg-white text-slate-800 text-xs font-black uppercase px-4 py-2 rounded-full tracking-widest shadow-lg">
                  Stok Habis
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] font-black text-white backdrop-blur-sm">
              {book.stock} pcs
            </div>
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-col md:py-1">
            <div className="mb-4 flex flex-wrap gap-2">
              {book.category && (
                <span className="rounded-full border border-orange-100 bg-[#fff3ec] px-3 py-1 text-[8px] font-black uppercase tracking-widest text-[#e86712]">
                  {book.category}
                </span>
              )}
              {book.rak && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[8px] font-bold text-slate-600">
                  📍 Rak {book.rak}
                </span>
              )}
              {book.nomor_buku && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[8px] font-mono text-slate-500">
                  ISBN: {book.nomor_buku}
                </span>
              )}
            </div>

            <h1 className="mb-2 max-w-3xl text-2xl font-black leading-[1.16] tracking-[-0.025em] text-[#17233c] sm:text-3xl">
              {book.title}
            </h1>
            {book.author && (
              <p className="mb-1 text-xs font-medium text-slate-500">oleh <span className="font-bold text-[#17233c]">{book.author}</span></p>
            )}
            {book.publisher && (
              <p className="mb-3 text-[10px] font-medium text-slate-400">Penerbit: {book.publisher}</p>
            )}

            {/* Rating */}
            {(book.rating_count || 0) > 0 && (
              <div className="mb-3 flex items-center gap-2">
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
              <div className="mb-4 mt-1 rounded-[18px] border border-[#eee2de] bg-[#fffaf8] p-4">
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#e86712]">Ringkasan</p>
                <p className="line-clamp-5 text-xs font-medium leading-6 text-slate-600">{book.ringkasan}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto grid gap-2.5 sm:grid-cols-[1fr_1.05fr]">
              <div className="flex flex-1 gap-2">
                {book.pdf_url && (
                  <DownloadPdfButton
                    bookId={book.id}
                  />
                )}

                <ShareButton title={book.title} />
              </div>
              {userEmail ? (
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
          <section className="rounded-[24px] border border-white/80 bg-white/75 p-4 shadow-[0_14px_40px_rgba(89,55,51,0.08)] backdrop-blur sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316]">Rak digital</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[#17233c]">Buku terkait</h2>
                <p className="mt-1 text-xs text-slate-400">{book.category}</p>
              </div>
              <Link href={`/katalog?cat=${encodeURIComponent(book.category || '')}`} className="hidden rounded-full border border-[#eaded9] px-4 py-2 text-[11px] font-bold text-slate-500 hover:border-orange-200 hover:text-[#f97316] sm:inline-flex">
                Lihat kategori →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {related.map(b => {
                const c = getCoverStyle(b.category || '');
                return (
                  <Link
                    key={b.id}
                    href={`/buku/${b.id}`}
                    className="group grid grid-cols-[88px_1fr] overflow-hidden rounded-[18px] border border-[#eee3df] bg-white shadow-[0_6px_18px_rgba(65,44,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-[0_12px_26px_rgba(65,44,42,0.1)] min-[480px]:flex min-[480px]:flex-col"
                  >
                    <div className={`relative flex min-h-[112px] items-center justify-center overflow-hidden bg-gradient-to-br text-3xl min-[480px]:h-24 min-[480px]:min-h-0 ${c.bg}`}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '26px 26px' }} />
                      {c.icon}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-3">
                      <p className="mb-1 line-clamp-2 min-h-9 text-[11px] font-black leading-[18px] text-[#17233c] transition group-hover:text-[#f97316]">{b.title}</p>
                      <p className="truncate text-[10px] font-medium text-slate-400">{b.author || '—'}</p>
                      <span className={`mt-auto inline-flex w-fit rounded-full px-2 py-0.5 text-[8px] font-black ${b.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                        {b.stock > 0 ? `${b.stock} Tersedia` : 'Habis'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="pb-4 text-center">
          <Link href="/katalog" className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#846f6a] transition hover:bg-white hover:text-[#f97316]">
            ← Kembali ke Katalog
          </Link>
        </div>
      </main>
      <PublicFooter />
      <AIAssistant />
    </div>
  );
}
