'use client';
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import GlobalActionLoading from "../components/GlobalActionLoading";

export default function BorrowModal({ book, userEmail }: { book: any; userEmail: string }) {
  const router = useRouter();
  const [isOpen,    setIsOpen]    = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  // Ambil nama asli pegawai dari tabel Data Pegawai berdasarkan email
  const [staffName, setStaffName] = useState('');
  const autoName = userEmail.split('@')[0];

  useEffect(() => {
    setMounted(true);

    const fetchStaffName = async () => {
      const { data } = await supabase
        .from('Data Pegawai')
        .select('Nama')
        .ilike('Email', `%${autoName}%`)
        .limit(1)
        .single();
      if (data?.Nama) {
        setStaffName(data.Nama);
      }
    };

    if (autoName) fetchStaffName();
  }, [autoName]);

  const displayName = staffName || autoName;

  const [formData, setFormData] = useState({
    nama_peminjam:   displayName,
    tanggal_pinjam:  new Date().toISOString().split('T')[0],
    tanggal_kembali: '',
    keperluan:       '',
  });

  // Sync nama setelah fetch selesai
  useEffect(() => {
    if (displayName) {
      setFormData(prev => ({ ...prev, nama_peminjam: displayName }));
    }
  }, [displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      // 1. Cek stok terkini
      const { data: currentBook, error: errCek } = await supabase
        .from('books')
        .select('stock')
        .eq('id', book.id)
        .single();

      if (errCek) throw new Error("Gagal mengecek stok buku.");
      if (currentBook.stock <= 0) {
        alert("Maaf, stok buku sudah habis dipinjam.");
        setIsLoading(false);
        return;
      }

      // 2. Kurangi stok
      const { error: errorUpdate } = await supabase
        .from('books')
        .update({ stock: currentBook.stock - 1 })
        .eq('id', book.id);

      if (errorUpdate) throw new Error("Gagal mengupdate stok database.");

      // ✅ 3. Insert ke tabel `loans` (BUKAN Katalog_Peminjaman)
      //    Field mapping:
      //      nama_peminjam  → employee_name
      //      tanggal_kembali → due_date
      //      tanggal_pinjam → disimpan di created_at (otomatis) / loan_date (jika ada)
      //      keperluan      → notes (jika kolom ada, jika tidak diabaikan)
      const { error: errorInsert } = await supabase
        .from('loans')
        .insert([{
          book_id:       book.id,
          user_email:    userEmail,
          employee_name: formData.nama_peminjam,
          due_date:      formData.tanggal_kembali,
          status:        'DIPINJAM',
          borrowed_via:  'KATALOG',
        }]);

      if (errorInsert) throw new Error("Gagal mencatat peminjaman: " + errorInsert.message);

      setIsSuccess(true);
      router.refresh();

    } catch (error: any) {
      console.error(error);
      alert("Error Sistem: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <GlobalActionLoading isVisible={isLoading} text="Memproses Peminjaman..." />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (book.stock > 0) setIsOpen(true);
        }}
        disabled={book.stock === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17233c] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_7px_18px_rgba(23,35,60,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#243659] hover:shadow-[0_10px_22px_rgba(23,35,60,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
      >
        {book.stock > 0 ? (
          <><span>🔖</span> Pinjam Buku</>
        ) : (
          <><span>❌</span> Habis</>
        )}
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_40px_rgba(16,185,129,0.4)] animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Berhasil Dipinjam!</h3>
                <p className="text-slate-500 text-[13px] mb-8 font-medium">
                  Buku <strong>{book.title}</strong> telah dicatat. Silakan ambil fisik buku di perpustakaan.
                </p>
                <button
                  onClick={() => { setIsOpen(false); setIsSuccess(false); router.refresh(); }}
                  className="w-full bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-[11px] py-4 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Tutup &amp; Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5 block">Form Peminjaman</span>
                      <h3 className="text-base font-black text-slate-800 leading-snug line-clamp-2">{book.title}</h3>
                    </div>
                    <button type="button" onClick={() => setIsOpen(false)}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 shrink-0">✕
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Peminjam</label>
                    <input
                      type="text" readOnly value={formData.nama_peminjam}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-600 px-4 py-3.5 rounded-xl text-sm font-bold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tgl Pinjam</label>
                      <input
                        type="date" required value={formData.tanggal_pinjam}
                        onChange={e => setFormData({ ...formData, tanggal_pinjam: e.target.value })}
                        className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tgl Kembali</label>
                      <input
                        type="date" required value={formData.tanggal_kembali}
                        onChange={e => setFormData({ ...formData, tanggal_kembali: e.target.value })}
                        min={formData.tanggal_pinjam}
                        className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Keperluan (Opsional)</label>
                    <textarea
                      rows={2} value={formData.keperluan}
                      onChange={e => setFormData({ ...formData, keperluan: e.target.value })}
                      placeholder="Misal: Referensi Sidang, Tugas, dll..."
                      className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all placeholder:text-slate-300 resize-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white mt-auto">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsOpen(false)}
                      className="w-1/3 bg-white text-slate-600 font-bold uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-slate-50 transition-all border border-slate-200">
                      Batal
                    </button>
                    <button type="submit" disabled={isLoading}
                      className="flex-1 bg-[#16213E] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#143628] transition-all disabled:opacity-50 py-4 flex items-center justify-center gap-2">
                      {isLoading ? "Memproses..." : "Konfirmasi & Pinjam"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
