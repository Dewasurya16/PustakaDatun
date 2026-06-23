'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import GlobalActionLoading from '../components/GlobalActionLoading';

export default function CetakPosterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedType, setSelectedType] = useState<'bukutamu' | 'katalog'>('bukutamu');

  useEffect(() => { setMounted(true); }, []);

  const handleGeneratePoster = async () => {
    setIsExporting(true);
    try {
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://e-perpus.kejaksaan.go.id';
      
      // Tentukan destinasi QR Code
      const targetUrl = selectedType === 'bukutamu' ? `${appUrl}/buku-tamu` : `${appUrl}/katalog`;
      const posterTitle = selectedType === 'bukutamu' ? 'BUKU TAMU DIGITAL' : 'E-KATALOG BUKU';
      const posterSubtitle = selectedType === 'bukutamu' ? 'Pindai untuk mengisi daftar hadir pengunjung' : 'Pindai untuk mencari dan meminjam buku';

      // 1. Fetch QR Code dari API
      const qrSize = 500;
      const qrUrlAPI = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(targetUrl)}&bgcolor=ffffff&color=1B4332&qzone=1&format=png`;
      const qrRes = await fetch(qrUrlAPI);
      const qrBlob = await qrRes.blob();
      const qrBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(qrBlob);
      });

      // 2. Fetch Logo Kejaksaan
      let logoData: string | null = null;
      try {
        const logoRes = await fetch('/logo-kejaksaan.png');
        if (logoRes.ok) {
          const logoBlob = await logoRes.blob();
          logoData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (e) { console.warn('Logo tidak ditemukan'); }

      // 3. Buat Dokumen PDF A4 (Potrait)
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      // Background hijau elegan
      doc.setFillColor(244, 246, 244);
      doc.rect(0, 0, pageW, pageH, 'F');

      // Top Banner (Hijau Kejaksaan)
      doc.setFillColor(27, 67, 50); // #16213E
      doc.rect(0, 0, pageW, 50, 'F');

      // Teks Header (Logo + Nama Instansi)
      if (logoData) {
        doc.addImage(logoData, 'PNG', pageW / 2 - 12, 10, 24, 24);
      }
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('PERPUSTAKAAN KEJAKSAAN AGUNG REPUBLIK INDONESIA', pageW / 2, 43, { align: 'center' });

      // Kontainer Putih Utama
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(210, 220, 215);
      doc.roundedRect(20, 65, pageW - 40, 180, 5, 5, 'FD');

      // Judul Poster
      doc.setTextColor(27, 67, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(posterTitle, pageW / 2, 90, { align: 'center' });

      // Subjudul
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(posterSubtitle, pageW / 2, 100, { align: 'center' });

      // Area QR Code (Bingkai Hijau Putus-putus)
      const qrBoxSize = 90;
      const qrY = 120;
      doc.setDrawColor(27, 67, 50);
      doc.setLineWidth(1);
      doc.setLineDashPattern([3, 3], 0);
      doc.roundedRect(pageW / 2 - qrBoxSize / 2, qrY, qrBoxSize, qrBoxSize, 5, 5, 'S');

      // Tempel QR Code
      doc.addImage(qrBase64, 'PNG', pageW / 2 - 40, qrY + 10, 80, 80);
      doc.setLineDashPattern([], 0); // reset line dash

      // Teks Bawah
      doc.setTextColor(27, 67, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Arahkan kamera HP Anda ke QR Code di atas', pageW / 2, qrY + qrBoxSize + 15, { align: 'center' });

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('e-perpus.kejaksaan.go.id', pageW / 2, 280, { align: 'center' });

      // Download
      doc.save(`Poster_${posterTitle.replace(' ', '_')}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert('Gagal membuat poster PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95"
      >
        <span className="text-base">🖨️</span> Cetak Poster QR
      </button>

      <GlobalActionLoading isVisible={isExporting} text="Men-generate Poster PDF..." />

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col animate-fade-in">
            
            <div className="px-6 py-5 border-b border-slate-100 bg-[#16213E] flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Cetak Poster Layanan</h3>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">
                  Pilih Layanan (PDF Ukuran A4)
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors border-blue-200 bg-blue-50/30">
                <input
                  type="radio"
                  name="posterType"
                  value="bukutamu"
                  checked={selectedType === 'bukutamu'}
                  onChange={() => setSelectedType('bukutamu')}
                  className="mt-1 w-4 h-4 text-blue-600 accent-blue-600"
                />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Buku Tamu Digital</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pengunjung bisa absen langsung dari HP masing-masing.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors border-blue-200 bg-blue-50/30">
                <input
                  type="radio"
                  name="posterType"
                  value="katalog"
                  checked={selectedType === 'katalog'}
                  onChange={() => setSelectedType('katalog')}
                  className="mt-1 w-4 h-4 text-blue-600 accent-blue-600"
                />
                <div>
                  <p className="font-bold text-slate-800 text-sm">Katalog Buku (Pencarian)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pegawai bisa mencari dan meminjam buku lewat HP.</p>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-100 transition-all tracking-widest"
              >
                Batal
              </button>
              <button
                onClick={handleGeneratePoster}
                disabled={isExporting}
                className="flex-1 py-3 bg-[#16213E] text-white rounded-xl font-black text-[10px] uppercase hover:bg-[#123023] transition-all tracking-widest disabled:opacity-50"
              >
                Unduh PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
