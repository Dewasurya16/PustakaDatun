"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import GlobalActionLoading from "../components/GlobalActionLoading";

export default function DeleteBookButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const router = useRouter();
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) {
      alert("Gagal menghapus buku. Pastikan buku ini sedang tidak dipinjam.");
      setIsDeleting(false);
    } else {
      setShowConfirm(false);
      router.refresh();
    }
  };

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
        title="Hapus Buku"
      >
        {isDeleting ? "Menghapus..." : "Hapus"}
      </button>

      {/* Custom confirm modal */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">

            {/* Loading overlay */}
            <GlobalActionLoading isVisible={isDeleting} text="Menghapus Buku..." />

            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">🗑️</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Hapus Buku?</h4>
            <p className="text-xs text-slate-500 font-medium mb-8 px-2 leading-relaxed">
              Tindakan ini <span className="font-bold text-red-600">tidak dapat dibatalkan</span>. Buku{' '}
              <span className="font-bold text-slate-800">"{bookTitle}"</span> akan dihapus permanen dari sistem.
            </p>
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest"
              >
                Batal
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-red-700 transition-all tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .65s linear infinite' }} />
                ) : null}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}