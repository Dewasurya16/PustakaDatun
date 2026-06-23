'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function BacaPDFModal({ url, compact = false }: { url: string; compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatUrl = (originalUrl: string) => {
    if (!originalUrl) return '';
    if (originalUrl.includes('drive.google.com')) {
      return originalUrl.replace(/\/view.*|\/edit.*/, '/preview');
    }
    return originalUrl;
  };

  const cleanUrl = formatUrl(url);

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-[#0F172A] flex flex-col w-screen h-screen overflow-hidden">
      <div className="bg-slate-900/80 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center border-b border-white/5 flex-shrink-0 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <span className="text-xl">📖</span>
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Digital Library</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Mode Layar Penuh</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Tutup ✕
        </button>
      </div>
      <div className="flex-1 w-full bg-slate-800 relative">
        <iframe src={cleanUrl} className="w-full h-full border-none" title="E-Book Viewer" />
      </div>
    </div>
  );

  if (!url) {
    return compact ? (
      <button disabled className="w-full flex items-center justify-center gap-1.5 bg-slate-50 text-slate-300 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 cursor-not-allowed">
        🔒 Belum Ada PDF
      </button>
    ) : (
      <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 cursor-not-allowed">
        <span>🔒</span> Belum Ada PDF
      </button>
    );
  }

  const buttonCls = compact
    ? "w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-blue-200 group"
    : "w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-blue-200 shadow-sm group";

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={buttonCls}>
        <span className="group-hover:scale-125 transition-transform">📖</span> Baca E-Book
      </button>
      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}