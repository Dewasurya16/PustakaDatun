"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PaginationControls({ 
  currentPage, 
  totalPages 
}: { 
  currentPage: number; 
  totalPages: number; 
}) {
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Otomatis matikan loading ketika URL berhasil berubah (data sudah di-load)
  useEffect(() => {
    setIsNavigating(false);
  }, [searchParams]);

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-4">
      
      {/* ── ANIMASI LOADING (Akan muncul saat tombol diklik) ── */}
      {isNavigating && (
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest animate-pulse">
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Mengambil Data Buku...
        </div>
      )}

      <div className="flex items-center justify-center gap-4 w-full">
        {/* Tombol Sebelumnya */}
        {currentPage > 1 ? (
          <Link
            href={getPageUrl(currentPage - 1)}
            onClick={() => setIsNavigating(true)}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-[#16213E] transition-all shadow-sm"
          >
            &larr; Sebelumnya
          </Link>
        ) : (
          <button disabled className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold opacity-60 cursor-not-allowed">
            &larr; Sebelumnya
          </button>
        )}

        {/* Info Halaman */}
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/50 px-4 py-2 rounded-lg">
          Hal <span className="text-[#16213E]">{currentPage}</span> / {totalPages}
        </div>

        {/* Tombol Selanjutnya */}
        {currentPage < totalPages ? (
          <Link
            href={getPageUrl(currentPage + 1)}
            onClick={() => setIsNavigating(true)}
            className="px-5 py-2.5 bg-[#16213E] border border-[#16213E] text-white rounded-xl text-xs font-bold hover:bg-[#123023] transition-all shadow-sm shadow-blue-900/20"
          >
            Selanjutnya &rarr;
          </Link>
        ) : (
          <button disabled className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold opacity-60 cursor-not-allowed">
            Selanjutnya &rarr;
          </button>
        )}
      </div>
    </div>
  );
}