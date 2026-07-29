'use client';

import { useState } from 'react';

interface Props {
  bookId: string;
}

export default function DownloadPdfButton({ bookId }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      setDone(true);
      window.open(`/api/books/${bookId}/ebook`, '_blank', 'noopener,noreferrer');
    } catch {
      alert('E-book belum dapat dibuka.');
    } finally {
      setLoading(false);
      setTimeout(() => setDone(false), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex-1 text-center py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
        done
          ? 'bg-emerald-500 text-white border border-emerald-400'
          : 'border border-orange-200 bg-[#fff3ec] text-[#e86712] hover:bg-[#f97316] hover:text-white'
      } ${loading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Membuka...
        </>
      ) : done ? (
        <>✓ Dibuka</>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Baca E-Book
        </>
      )}
    </button>
  );
}
