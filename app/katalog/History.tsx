'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { createPortal } from 'react-dom';

// Normalise status ke uppercase untuk perbandingan (handle "Dipinjam" vs "DIPINJAM")
const normalizeStatus = (s: string) => (s || '').toUpperCase().trim();

export default function MyHistory({ userEmail }: { userEmail: string }) {
  const [loans,        setLoans]        = useState<any[]>([]);
  const [mounted,      setMounted]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [ratingModal,  setRatingModal]  = useState<any>(null);
  const [selectedStar, setSelectedStar] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const autoName = userEmail.split('@')[0].toLowerCase();

  const fetchMyLoans = useCallback(async () => {
    setLoading(true);
    try {
      /*
       * Strategi query terpadu — tangkap peminjaman dari DUA sumber:
       *  1. Katalog  → disimpan dengan user_email = userEmail
       *  2. Lexi AI  → disimpan dengan employee_name = nama asli pegawai
       *
       * Kita query dengan OR:
       *   user_email = userEmail               ← pinjam via katalog (ada kolom user_email)
       *   employee_name ilike %autoName%       ← pinjam via katalog lama / Lexi jika nama mirip email
       *   employee_name ilike %emailFull%      ← fallback full email
       */
      const { data, error } = await supabase
        .from('loans')
        .select('*, books(*)')
        .or(
          [
            `user_email.eq.${userEmail}`,
            `employee_name.ilike.%${autoName}%`,
            `employee_name.ilike.%${userEmail}%`,
          ].join(',')
        )
        .order('id', { ascending: false });

      if (error) throw error;

      // Deduplicate berdasarkan id (bisa muncul ganda karena OR)
      const unique = Array.from(
        new Map((data || []).map((l: any) => [l.id, l])).values()
      );

      setLoans(unique);
    } catch (err: any) {
      console.error('fetchMyLoans error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [userEmail, autoName]);

  useEffect(() => {
    setMounted(true);
    fetchMyLoans();
  }, [fetchMyLoans]);

  // ── KEMBALIKAN BUKU ────────────────────────────────────────────────────
  const executeReturn = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Ambil stok FRESH dari DB (hindari stale state)
      const { data: freshBook, error: fetchError } = await supabase
        .from('books')
        .select('stock')
        .eq('id', confirmModal.book_id)
        .single();

      if (fetchError) throw new Error('Gagal mengambil data stok buku terkini.');

      const { error: loanError } = await supabase
        .from('loans')
        .update({ status: 'DIKEMBALIKAN', return_date: new Date().toISOString() })
        .eq('id', confirmModal.id);

      if (loanError) throw new Error('Gagal mengubah status peminjaman.');

      const { error: stockError } = await supabase
        .from('books')
        .update({ stock: (freshBook?.stock || 0) + 1 })
        .eq('id', confirmModal.book_id);

      if (stockError) throw new Error('Gagal memperbarui stok buku.');

      setRatingModal({
        loanId:        confirmModal.id,
        bookId:        confirmModal.book_id,
        title:         confirmModal.books?.title,
        currentRating: confirmModal.books?.rating || 0,
        currentCount:  confirmModal.books?.rating_count || 0,
      });

      setConfirmModal(null);
      fetchMyLoans();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── SIMPAN ULASAN ──────────────────────────────────────────────────────
  const submitReview = async () => {
    if (isProcessing) return;
    // Guard: jangan izinkan ulasan jika status sudah SUDAH DIULAS
    if (normalizeStatus(ratingModal?.currentStatus) === 'SUDAH DIULAS') {
      alert('Anda sudah memberikan ulasan untuk buku ini.');
      setRatingModal(null);
      return;
    }
    setIsProcessing(true);
    try {
      const currentCount  = Number(ratingModal.currentCount)  || 0;
      const currentRating = Number(ratingModal.currentRating) || 0;
      const newCount  = currentCount + 1;
      const newRating = ((currentRating * currentCount) + selectedStar) / newCount;

      await supabase
        .from('books')
        .update({ rating: Number(newRating.toFixed(1)), rating_count: newCount })
        .eq('id', ratingModal.bookId);

      await supabase
        .from('loans')
        .update({ status: 'SUDAH DIULAS' })
        .eq('id', ratingModal.loanId);

      setRatingModal(null);
      fetchMyLoans();
    } catch (err: any) {
      alert('Gagal simpan ulasan: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── LOADING SKELETON ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="py-16 bg-white border border-dashed border-slate-200 rounded-3xl text-center mb-8">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Belum Ada Riwayat Pinjaman</p>
        <p className="text-[10px] text-slate-300 font-medium mt-2">
          Pinjam buku lewat katalog atau chat dengan Lexi AI
        </p>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <section className="mb-20">
      {/* Summary mini */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: 'Total',        count: loans.length,                                                             color: 'bg-slate-50 text-slate-600 border-slate-100' },
          { label: 'Aktif',        count: loans.filter(l => normalizeStatus(l.status) === 'DIPINJAM').length,       color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
          { label: 'Terlambat',    count: loans.filter(l => normalizeStatus(l.status) === 'DIPINJAM' && new Date(l.due_date) < new Date()).length, color: 'bg-rose-50 text-rose-600 border-rose-100' },
          { label: 'Via Lexi AI',  count: loans.filter(l => l.borrowed_via === 'AI_LEXI').length,                   color: 'bg-blue-50 text-blue-600 border-blue-100' },
        ].map((s) => (
          <div key={s.label} className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${s.color}`}>
            <span className="text-base font-black">{s.count}</span> {s.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loans.map((loan) => {
          const status      = normalizeStatus(loan.status);
          const isDipinjam  = status === 'DIPINJAM';
          const isDikembalikan = status === 'DIKEMBALIKAN';
          const isSelesai   = status === 'SUDAH DIULAS';
          const isLate      = isDipinjam && new Date(loan.due_date) < new Date();
          const isViaAI     = loan.borrowed_via === 'AI_LEXI';

          const accentColor = isDipinjam
            ? (isLate ? '#EF4444' : '#F59E0B')
            : isSelesai
            ? '#3B82F6'
            : '#10B981';

          const badgeCls = isDipinjam
            ? (isLate ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200')
            : isSelesai
            ? 'bg-blue-50 text-blue-600 border-blue-200'
            : 'bg-blue-50 text-blue-600 border-blue-200';

          const badgeLabel = isLate ? '⚠️ Terlambat' : loan.status;

          return (
            <div
              key={loan.id}
              className="relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden group"
            >
              {/* Garis aksen kiri */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: accentColor }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badgeCls}`}>
                    {badgeLabel}
                  </span>
                  {/* Badge sumber peminjaman */}
                  {isViaAI ? (
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                      🤖 Lexi AI
                    </span>
                  ) : loan.borrowed_via === 'KATALOG' ? (
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100">
                      📚 Katalog
                    </span>
                  ) : null}
                  <span className="text-[9px] text-slate-400 font-bold">
                    Tenggat: {new Date(loan.due_date).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1">
                  {loan.books?.title || 'Buku Tidak Tersedia'}
                </h4>

                {loan.books?.category && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                    {loan.books.category}
                  </p>
                )}

                {isLate && (
                  <p className="text-[9px] font-black text-rose-500 mt-1">
                    {Math.floor((Date.now() - new Date(loan.due_date).getTime()) / 86400000)} hari terlambat — segera kembalikan!
                  </p>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="flex-shrink-0">
                {isDipinjam ? (
                  <button
                    onClick={() => setConfirmModal(loan)}
                    className={`px-4 py-2.5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 ${
                      isLate ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#16213E] hover:bg-blue-800'
                    }`}
                  >
                    Kembalikan
                  </button>
                ) : isDikembalikan ? (
                  <button
                    onClick={() => {
                      setSelectedStar(5);
                      setRatingModal({
                        loanId:        loan.id,
                        bookId:        loan.book_id,
                        title:         loan.books?.title,
                        currentRating: loan.books?.rating       || 0,
                        currentCount:  loan.books?.rating_count || 0,
                        currentStatus: loan.status,
                      });
                    }}
                    className="px-4 py-2.5 bg-yellow-400 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 shadow-sm transition-all active:scale-95"
                  >
                    ⭐ Ulasan
                  </button>
                ) : (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 uppercase tracking-widest">
                    Selesai ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL KONFIRMASI KEMBALIKAN ─────────────────────────────────── */}
      {mounted && confirmModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">📚</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Kembalikan Buku?</h4>
            <p className="text-xs text-slate-500 font-medium mb-8 px-2 leading-relaxed">
              Pastikan buku{' '}
              <span className="font-bold text-[#16213E]">"{confirmModal.books?.title}"</span>{' '}
              sudah siap dikembalikan ke petugas.
            </p>
            <div className="flex gap-3">
              <button
                disabled={isProcessing}
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                disabled={isProcessing}
                onClick={executeReturn}
                className="flex-1 py-3.5 bg-[#16213E] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#123023] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Proses...
                  </>
                ) : 'Ya, Kembalikan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL RATING ────────────────────────────────────────────────── */}
      {mounted && ratingModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">⭐</div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Beri Penilaian</h4>
            <p className="text-[11px] text-slate-400 font-bold uppercase mb-8 line-clamp-2 px-4">
              "{ratingModal.title}"
            </p>

            <div className="flex justify-center gap-3 mb-10">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStar(s)}
                  className={`text-4xl transition-all duration-150 hover:scale-110 focus:outline-none ${
                    s <= selectedStar ? 'text-yellow-400 drop-shadow-md scale-110' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              disabled={isProcessing}
              onClick={submitReview}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Menyimpan...' : 'Simpan Ulasan'}
            </button>
            <button
              disabled={isProcessing}
              onClick={() => setRatingModal(null)}
              className="mt-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}