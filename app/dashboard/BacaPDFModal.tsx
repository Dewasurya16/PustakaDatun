'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

type BacaPDFModalProps = {
  url: string;
  compact?: boolean;
};

function formatPdfUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  if (originalUrl.includes('drive.google.com')) {
    return originalUrl.replace(/\/view.*|\/edit.*/, '/preview');
  }
  return originalUrl;
}

export default function BacaPDFModal({ url, compact = false }: BacaPDFModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cleanUrl = formatPdfUrl(url);

  if (!url) {
    return compact ? (
      <button
        disabled
        className="flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-slate-100 bg-slate-50 px-3 text-[10px] font-black uppercase leading-none text-slate-300"
      >
        Belum Ada PDF
      </button>
    ) : (
      <button
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-100 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400"
      >
        Belum Ada PDF
      </button>
    );
  }

  const buttonClassName = compact
    ? 'flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-3 text-center text-[10px] font-black uppercase leading-none text-blue-700 transition-all hover:bg-blue-100'
    : 'flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 py-3.5 text-[10px] font-black uppercase tracking-widest text-blue-700 shadow-sm transition-all hover:bg-blue-100';

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex h-screen w-screen flex-col overflow-hidden bg-[#0F172A]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-slate-900/80 px-6 py-4 text-white shadow-2xl backdrop-blur-md">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Digital Library</h3>
          <p className="text-[10px] font-bold uppercase text-slate-400">Mode Layar Penuh</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-full bg-rose-500 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-rose-600 active:scale-95"
        >
          Tutup
        </button>
      </div>
      <div className="relative flex-1 bg-slate-800">
        <iframe src={cleanUrl} className="h-full w-full border-none" title="E-Book Viewer" />
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonClassName}>
        Baca E-Book
      </button>
      {isOpen && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </>
  );
}
