"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import BorrowModal from "../katalog/BorrowModal";
import type { CatalogBook } from "../components/CatalogBookCard";

export default function QRCodeModal({ book, isLoggedIn = false, userEmail = '', compact = false }: { book: CatalogBook, isLoggedIn?: boolean, userEmail?: string, compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://e-perpus.kejaksaan.go.id';
  const qrData = `${appUrl}/buku/${book?.id}`;
  const qrSize = 400;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=0f2a1c&qzone=2&format=png`;

  // ── Download QR ──────────────────────────────────────────────
  const handleDownloadQR = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = (book?.title || 'buku')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 40);
      a.download = `QR_${safeTitle}_${book?.id?.substring(0, 8) ?? 'unknown'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      alert('Gagal mengunduh QR Code. Pastikan koneksi internet tersedia.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Download QR sebagai kartu (canvas) ──────────────────────
  const handleDownloadCard = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const cardW = 480;
      const cardH = 640;
      canvas.width = cardW;
      canvas.height = cardH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#0B1221';
      ctx.fillRect(0, 0, cardW, cardH);

      // Header strip
      ctx.fillStyle = '#16213E';
      ctx.fillRect(0, 0, cardW, 100);

      // Title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PERPUSTAKAAN DIGITAL', cardW / 2, 30);
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText('KEJAKSAAN AGUNG REPUBLIK INDONESIA', cardW / 2, 48);

      // Book title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      const title = book?.title || 'Judul Buku';
      // Word wrap
      const words = title.split(' ');
      let line = '';
      let lineY = 76;
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > cardW - 60) {
          ctx.fillText(line, cardW / 2, lineY);
          line = word;
          lineY += 18;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, cardW / 2, lineY);

      // QR code area (white bg)
      const qrMargin = 60;
      const qrAreaSize = cardW - qrMargin * 2;
      const qrAreaX = qrMargin;
      const qrAreaY = 120;
      ctx.fillStyle = '#ffffff';
      const radius = 16;
      ctx.beginPath();
      ctx.moveTo(qrAreaX + radius, qrAreaY);
      ctx.lineTo(qrAreaX + qrAreaSize - radius, qrAreaY);
      ctx.arcTo(qrAreaX + qrAreaSize, qrAreaY, qrAreaX + qrAreaSize, qrAreaY + radius, radius);
      ctx.lineTo(qrAreaX + qrAreaSize, qrAreaY + qrAreaSize - radius);
      ctx.arcTo(qrAreaX + qrAreaSize, qrAreaY + qrAreaSize, qrAreaX + qrAreaSize - radius, qrAreaY + qrAreaSize, radius);
      ctx.lineTo(qrAreaX + radius, qrAreaY + qrAreaSize);
      ctx.arcTo(qrAreaX, qrAreaY + qrAreaSize, qrAreaX, qrAreaY + qrAreaSize - radius, radius);
      ctx.lineTo(qrAreaX, qrAreaY + radius);
      ctx.arcTo(qrAreaX, qrAreaY, qrAreaX + radius, qrAreaY, radius);
      ctx.closePath();
      ctx.fill();

      // Load & draw QR image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const padding = 20;
          ctx.drawImage(img, qrAreaX + padding, qrAreaY + padding, qrAreaSize - padding * 2, qrAreaSize - padding * 2);
          resolve();
        };
        img.onerror = reject;
        img.src = qrUrl;
      });

      // Book info
      const infoY = qrAreaY + qrAreaSize + 20;
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PENULIS', cardW / 2, infoY);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(book?.author || '—', cardW / 2, infoY + 16);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 9px Arial';
      ctx.fillText('RAK', cardW / 2 - 80, infoY + 40);
      ctx.fillText('STOK', cardW / 2 + 80, infoY + 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Arial';
      ctx.fillText(book?.rak || '—', cardW / 2 - 80, infoY + 57);
      ctx.fillText(`${book?.stock ?? 0} pcs`, cardW / 2 + 80, infoY + 57);

      // Divider
      ctx.strokeStyle = '#ffffff20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(qrMargin, infoY + 70);
      ctx.lineTo(cardW - qrMargin, infoY + 70);
      ctx.stroke();

      // ID
      ctx.fillStyle = '#ffffff60';
      ctx.font = '9px monospace';
      ctx.fillText(`ID: ${book?.id?.substring(0, 16) ?? ''}...`, cardW / 2, infoY + 84);
      ctx.font = 'bold 8px Arial';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText('Scan QR untuk detail & pinjam buku', cardW / 2, infoY + 98);

      // Export
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      const safeTitle = (book?.title || 'buku')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 40);
      a.download = `KartuQR_${safeTitle}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      // Fallback: download QR biasa
      handleDownloadQR();
    } finally {
      setDownloading(false);
    }
  };

  const modalContent = (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] w-full max-w-3xl flex flex-col-reverse md:flex-row overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* Tombol close */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-200/50 text-slate-600 rounded-full hover:bg-slate-200 transition-all font-bold z-10"
        >
          ✕
        </button>

        {/* Kiri: Info buku */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 mt-2 md:mt-0">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                {book?.category || 'Umum'}
              </span>
              {book?.rak && (
                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded border border-slate-100 text-[9px] font-black tracking-widest">
                  📍 Rak {book.rak}
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-2">
              {book?.title || 'Judul Tidak Tersedia'}
            </h3>
            {book?.author && (
              <p className="text-sm text-slate-500 font-medium mb-6">oleh {book.author}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Lokasi Rak</p>
                <p className="text-sm font-black text-slate-700">{book?.rak || 'Belum Diatur'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sisa Stok Fisik</p>
                <p className={`text-sm font-black ${(book?.stock ?? 0) > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                  {book?.stock ?? 0} Pcs
                </p>
              </div>
            </div>
          </div>

          {/* Tombol aksi */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={book?.pdf_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center py-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex justify-center items-center gap-2"
              onClick={(e) => {
                if (!book?.pdf_url) { e.preventDefault(); alert("E-Book belum tersedia."); }
              }}
            >
              <span className="text-sm">📖</span> Baca E-Book
            </a>

            {isLoggedIn && userEmail ? (
              <div className="flex-1">
                <BorrowModal book={book} userEmail={userEmail} />
              </div>
            ) : (
              <Link href="/login"
                className="flex-1 text-center py-4 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md flex justify-center items-center gap-2">
                <span className="text-sm">🔐</span> Login & Pinjam
              </Link>
            )}
          </div>
        </div>

        {/* Kanan: QR Code */}
        <div className="w-full md:w-72 bg-slate-50 p-6 md:p-8 flex flex-col items-center justify-center border-l border-slate-100 gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan QR Aset</p>

          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 w-44 h-44">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase truncate w-full text-center bg-white py-2 rounded-lg border border-slate-100">
            ID: {book?.id ? book.id.substring(0, 8) + '...' : 'XXXXXXXX'}
          </p>

          {/* ── Download buttons ── */}
          <div className="w-full space-y-2">
            {/* Download QR biasa */}
            <button
              onClick={handleDownloadQR}
              disabled={downloading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border ${
                downloaded
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              } disabled:opacity-60`}
            >
              {downloading ? (
                <span className="animate-pulse">Mengunduh...</span>
              ) : downloaded ? (
                <><span>✅</span> Berhasil Diunduh</>
              ) : (
                <><span>⬇️</span> Unduh QR Code</>
              )}
            </button>

            {/* Download kartu QR */}
            <button
              onClick={handleDownloadCard}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#16213E] text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-[#143628] disabled:opacity-60 shadow-md"
            >
              {downloading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                <><span>🎴</span> Unduh Kartu QR</>
              )}
            </button>
          </div>

          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center px-2">
            Gunakan kamera HP untuk scan
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className={compact
          ? "flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 text-center text-[10px] font-black uppercase leading-none text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          : "flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 border border-slate-200 shadow-sm transition-all active:scale-95 gap-2"
        }
      >
        {compact ? 'Detail & QR' : <><span className="text-sm">🔍</span> Detail & QR</>}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
