"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import GlobalActionLoading from "../components/GlobalActionLoading";

export default function ReturnButton({ loan }: { loan: any }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State khusus untuk mengendalikan Pop-up Custom kita sendiri
  const [bukaModalKonfirmasi, setBukaModalKonfirmasi] = useState(false);
  const [bukaModalSukses, setBukaModalSukses] = useState(false);

  // Wajib untuk menghindari error saat render Modal (Portal) di Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // FUNGSI UTAMA KETIKA TOMBOL "YA, TERIMA" DIKLIK
  const eksekusiPengembalian = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil stok buku lama langsung dari database
      const { data: bData, error: fError } = await supabase
        .from("books")
        .select("stock")
        .eq("id", loan.book_id)
        .single();
        
      if (fError) throw new Error("Gagal mengambil data stok buku.");

      // 2. Update status peminjaman jadi DIKEMBALIKAN
      const { error: lError } = await supabase
        .from("loans")
        .update({ status: "DIKEMBALIKAN", return_date: new Date().toISOString() })
        .eq("id", loan.id);
        
      if (lError) throw new Error("Gagal mengubah status peminjaman.");

      // 3. Tambahkan stok buku (+1)
      const { error: bError } = await supabase
        .from("books")
        .update({ stock: (bData?.stock || 0) + 1 })
        .eq("id", loan.book_id);
        
      if (bError) throw new Error("Gagal mengupdate stok buku.");

      // 4. Tutup modal konfirmasi, Buka modal Sukses Hijau
      setBukaModalKonfirmasi(false);
      setBukaModalSukses(true);
      
      // 5. Hilangkan modal sukses setelah 2 detik dan refresh tabel
      setTimeout(() => {
        setBukaModalSukses(false);
        router.refresh();
      }, 2000);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Terjadi Kesalahan Sistem");
      setBukaModalKonfirmasi(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Jangan tampilkan apa-apa sebelum komponen siap
  if (!mounted) return null;

  // Logika Status: Jika sudah dikembalikan/diulas, tampilkan label "Selesai" saja
  const statusAktif = loan.status?.toUpperCase() || "";
  if (statusAktif === "DIKEMBALIKAN" || statusAktif === "SUDAH DIULAS") {
    return (
      <div className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest italic text-center">
        Selesai
      </div>
    );
  }

  return (
    <>
      <GlobalActionLoading isVisible={isLoading} text="Memproses Pengembalian..." />
      {/* TOMBOL KEMBALIKAN DI TABEL */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Mencegah klik nyasar ke baris tabel
          setBukaModalKonfirmasi(true); // Langsung buka Custom Modal, BUKAN bawaan browser
        }}
        className="relative z-10 px-5 py-2.5 bg-[#16213E] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-800 active:scale-95 transition-all shadow-md"
      >
        Kembalikan
      </button>

      {/* ============================================================== */}
      {/* 1. CUSTOM MODAL KONFIRMASI (MUNCUL MENGAMBANG DI TENGAH LAYAR) */}
      {/* ============================================================== */}
      {bukaModalKonfirmasi && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">📚</div>
            
            <h4 className="text-lg font-black text-slate-800 mb-2">Terima Pengembalian?</h4>
            <p className="text-xs text-slate-500 font-medium mb-8 px-2 leading-relaxed">
              Pastikan buku <br/><span className="font-bold text-[#16213E]">"{loan.books?.title || 'Aset ini'}"</span><br/> sudah Anda terima dari <span className="font-bold text-slate-800">{loan.employee_name}</span>.
            </p>
            
            <div className="flex gap-3">
              <button 
                disabled={isLoading} 
                onClick={() => setBukaModalKonfirmasi(false)} 
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest"
              >
                Batal
              </button>
              <button 
                disabled={isLoading} 
                onClick={eksekusiPengembalian} 
                className="flex-1 py-3.5 bg-[#16213E] text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-[#123023] transition-all tracking-widest disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Memproses...</span>
                ) : (
                  "Ya, Terima"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* 2. CUSTOM MODAL SUKSES (MUNCUL OTOMATIS SETELAH KLIK YA) */}
      {/* ============================================================== */}
      {bukaModalSukses && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-[0_0_40px_rgba(16,185,129,0.4)]">✓</div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Berhasil!</h4>
            <p className="text-xs text-slate-500 font-medium">Buku telah dikembalikan dan stok berhasil diperbarui.</p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}