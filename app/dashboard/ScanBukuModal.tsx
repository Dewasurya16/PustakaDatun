'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';

import { supabase } from '../../lib/supabase';
import BacaPDFModal from './BacaPDFModal';
import BorrowModal from '../katalog/BorrowModal';

export default function ScanBukuModal({
  isLoggedIn = false,
  userEmail = '',
}: {
  isLoggedIn?: boolean;
  userEmail?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedBook, setScannedBook] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [katalogBuku, setKatalogBuku] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchBukuMandiri = async () => {
      const { data } = await supabase.from('books').select('*');
      if (data) setKatalogBuku(data);
    };
    fetchBukuMandiri();
  }, []);

  useEffect(() => {
    let isComponentMounted = true;
    let scanner: Html5QrcodeScanner | null = null;
    let timer: NodeJS.Timeout;

    if (isOpen && !scannedBook) {
      timer = setTimeout(() => {
        if (!isComponentMounted) return;
        scanner = new Html5QrcodeScanner(
          'qr-reader-box',
          { qrbox: { width: 250, height: 250 }, fps: 10, rememberLastUsedCamera: true, supportedScanTypes: [0] },
          false
        );
        scanner.render(
          (result) => {
            const extractedId = result.split('/').pop() || result;
            const found = katalogBuku.find((b) => b.id === extractedId);
            if (found) {
              setScannedBook(found);
            } else {
              alert('Aset tidak ditemukan di database kami.');
            }
          },
          () => {}
        );
      }, 300);
    }

    return () => {
      isComponentMounted = false;
      if (timer) clearTimeout(timer);
      if (scanner) scanner.clear().catch(() => {});
    };
  }, [isOpen, scannedBook, katalogBuku]);

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>📷</span> Pemindai Pintar
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {scannedBook ? (
            <div className="text-center animate-in zoom-in duration-300">
              <span className="text-5xl block mb-3">📚</span>
              <p className="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Aset Ditemukan</p>
              <h4 className="text-lg font-black text-slate-800 leading-snug mb-6">{scannedBook.title}</h4>
              <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Rak</p>
                  <p className="font-bold text-sm text-slate-800">📍 {scannedBook.rak || 'TBA'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sisa Stok</p>
                  <p className={`font-bold text-sm ${scannedBook.stock > 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    {scannedBook.stock > 0 ? `${scannedBook.stock} Tersedia` : 'Habis'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <BacaPDFModal url={scannedBook.pdf_url} />

                {/* Pinjam langsung jika sudah login, jika belum arahkan ke login */}
                {isLoggedIn && userEmail ? (
                  <BorrowModal book={scannedBook} userEmail={userEmail} />
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center justify-center w-full bg-slate-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-black transition-all"
                  >
                    🔐 Login & Pinjam
                  </Link>
                )}

                <button
                  onClick={() => setScannedBook(null)}
                  className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  Pindai Buku Lain
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="[&_video]:w-full [&_video]:rounded-2xl [&_video]:object-cover [&_select]:w-full [&_select]:p-3 [&_select]:bg-slate-50 [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:mb-4 [&_select]:font-bold [&_select]:text-xs [&_select]:text-slate-700 [&_select]:outline-none [&_button]:w-full [&_button]:bg-[#16213E] [&_button]:text-white [&_button]:py-3.5 [&_button]:rounded-xl [&_button]:font-black [&_button]:text-[10px] [&_button]:uppercase [&_button]:tracking-widest [&_button]:mt-2 [&_a]:hidden w-full">
                <div id="qr-reader-box" className="w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 min-h-[250px]"></div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                <p className="text-center text-[10px] font-bold text-yellow-700 uppercase leading-relaxed">
                  💡 <span className="font-black text-yellow-800">Ganti Kamera?</span>
                  <br />
                  Klik <strong className="text-slate-800">"STOP SCANNING"</strong>, lalu pilih kamera dari menu.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setScannedBook(null);
        }}
        className="fixed bottom-6 left-6 z-[9998] flex items-center gap-3 pl-4 pr-5 h-14 bg-gradient-to-r from-[#16213E] to-blue-600 text-white rounded-2xl shadow-[0_8px_24px_rgba(27,67,50,0.5)] hover:shadow-[0_14px_32px_rgba(27,67,50,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 border border-blue-500/30 group"
        title="Pindai QR Aset"
      >
        <span className="text-xl leading-none group-hover:rotate-12 transition-transform duration-300">📷</span>
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-blue-300">Pindai</span>
          <span className="text-[11px] font-black uppercase tracking-wide">QR Aset</span>
        </div>
      </button>

      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}