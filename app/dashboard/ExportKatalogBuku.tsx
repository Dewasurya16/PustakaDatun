'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import GlobalActionLoading from '../components/GlobalActionLoading';

// ── Tipe ─────────────────────────────────────────────────────
type Book = {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  category?: string;
  nomor_buku?: string;
  stock: number;
  rak?: string;
  pdf_url?: string;
  ringkasan?: string;
};

// ── Helper ────────────────────────────────────────────────────
function formatTanggalFormal(date = new Date()) {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── FIX: Flatten canvas ke background putih sebelum export ───
function getCanvasDataUrlWithWhiteBg(canvas: HTMLCanvasElement): string {
  const temp = document.createElement('canvas');
  temp.width = canvas.width;
  temp.height = canvas.height;
  const ctx = temp.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, temp.width, temp.height);
  ctx.drawImage(canvas, 0, 0);
  return temp.toDataURL('image/png');
}

// ── Modal TTD Pegawai ─────────────────────────────────────────
function PegawaiSignaturePad({
  onConfirm,
  onCancel,
}: {
  onConfirm: (data: { nama: string; nip: string; ttdDataUrl: string | null }) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [namaPegawai, setNamaPegawai] = useState('');
  const [nipPegawai, setNipPegawai] = useState('');
  const [ttdDataUrl, setTtdDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0B1221';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      if ('touches' in e) {
        return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
      }
      return { x: ((e as MouseEvent).clientX - rect.left) * sx, y: ((e as MouseEvent).clientY - rect.top) * sy };
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      setIsEmpty(false);
    };
    const onEnd = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      setTtdDataUrl(getCanvasDataUrlWithWhiteBg(canvas));
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);
    return () => {
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setTtdDataUrl(null);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-[#0B1221] to-[#16213E]">
          <h3 className="text-base font-black text-white">Tanda Tangan Petugas</h3>
          <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-widest mt-0.5">
            Untuk dokumen PDF resmi
          </p>
        </div>
        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Petugas</label>
              <input
                type="text" value={namaPegawai} onChange={(e) => setNamaPegawai(e.target.value)}
                placeholder="Nama lengkap..."
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#16213E] focus:border-[#16213E] transition-all placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">NIP</label>
              <input
                type="text" value={nipPegawai} onChange={(e) => setNipPegawai(e.target.value)}
                placeholder="NIP..."
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#16213E] focus:border-[#16213E] transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Tanda Tangan Petugas
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">✍️ Tanda tangani di sini</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full cursor-crosshair touch-none block"
                style={{ height: 120 }}
              />
            </div>
            {!isEmpty && (
              <button type="button" onClick={handleClear} className="mt-1.5 text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest">
                ↺ Ulangi
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest">
              Lewati
            </button>
            <button
              onClick={() => onConfirm({ nama: namaPegawai, nip: nipPegawai, ttdDataUrl })}
              className="flex-1 py-3 bg-[#16213E] text-white rounded-xl font-black text-[10px] uppercase hover:bg-[#143628] transition-all tracking-widest"
            >
              Cetak PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Utama ────────────────────────────────────────────
export default function ExportKatalogBuku({ books }: { books: Book[] }) {
  const [mounted, setMounted] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── EXPORT EXCEL ─────────────────────────────────────────────
  const handleExportExcel = () => {
    const rows = books.map((b, i) => ({
      'No': i + 1,
      'Judul Buku': b.title,
      'Penulis': b.author || '—',
      'Penerbit': b.publisher || '—',
      'Klasifikasi / Kategori': b.category || '—',
      'ISBN / Nomor Buku': b.nomor_buku || '—',
      'Lokasi Rak': b.rak || '—',
      'Sisa Stok': b.stock,
      'Ringkasan': b.ringkasan || '—',
      'Link E-Book': b.pdf_url || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    ws['!cols'] = [
      { wch: 5 }, { wch: 45 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 50 }, { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Katalog Buku');

    const infoData = [
      ['KATALOG BUKU PERPUSTAKAAN', ''],
      ['Pustaka Datun Kejaksaan Agung', ''],
      ['Dicetak pada:', formatTanggalFormal()],
      ['Total Koleksi:', books.length],
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    wsInfo['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Info');

    XLSX.writeFile(wb, `Katalog_Buku_KejaksaanAgung_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ── EXPORT PDF (Kop Surat + TTD + Tabel Rapi) ────────────────
  const generatePDF = async ({
    nama: namaPegawai,
    nip: nipPegawai,
    ttdDataUrl,
  }: {
    nama: string;
    nip: string;
    ttdDataUrl: string | null;
  }) => {
    setShowSignModal(false);
    setIsExportingPDF(true);

    try {
      // 1. Fetch logo dari public folder
      let logoData: string | null = null;
      try {
        const res = await fetch('/logo-kejaksaan.png');
        if (res.ok) {
          const blob = await res.blob();
          logoData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch {
        console.warn('Logo tidak ditemukan, melanjutkan tanpa logo.');
      }

      // 2. Kertas Landscape A4
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;

      // 3. Fungsi Kop Surat (sama persis dengan ExportLaporan, disesuaikan landscape)
      const drawHeader = (isFirstPage: boolean) => {
        if (!isFirstPage) {
          doc.setFont('times', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Katalog Buku Perpustakaan — Pustaka Datun Kejaksaan Agung (Lanjutan)', pageW / 2, margin - 5, { align: 'center' });
          doc.setDrawColor(15, 42, 28);
          doc.setLineWidth(0.3);
          doc.line(margin, margin - 2, pageW - margin, margin - 2);
          return;
        }

        // --- KOP SURAT ---
        doc.setTextColor(30, 30, 30);

        // Logo
        if (logoData) {
          doc.addImage(logoData, 'PNG', margin + 3, margin, 26, 26);
        }

        // Teks Kop (centered di halaman landscape)
        doc.setFont('times', 'normal');
        doc.setFontSize(13);
        doc.text('KEJAKSAAN REPUBLIK INDONESIA', pageW / 2, margin + 5, { align: 'center' });
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('KEJAKSAAN AGUNG', pageW / 2, margin + 13, { align: 'center' });

        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text('Jl. Sultan Hasanuddin Nomor 1, Kebayoran Baru, Jakarta Selatan', pageW / 2, margin + 20, { align: 'center' });
        doc.text('Telp. (021) 7203061 – (ext. 10306) fax. (021) 7208317', pageW / 2, margin + 25, { align: 'center' });
        doc.text('www.kejaksaan.go.id', pageW / 2, margin + 30, { align: 'center' });

        // Garis Ganda Pembatas Kop
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1.0);
        doc.line(margin, margin + 33, pageW - margin, margin + 33); // Garis tebal
        doc.setLineWidth(0.3);
        doc.line(margin, margin + 34.5, pageW - margin, margin + 34.5); // Garis tipis

        // Judul Dokumen
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('KATALOG BUKU PERPUSTAKAAN', pageW / 2, margin + 44, { align: 'center' });

        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        const tanggalCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.text(`Per Tanggal: ${tanggalCetak}`, pageW / 2, margin + 49, { align: 'center' });
      };

      // 4. Data Tabel
      const tableHead = [['No', 'Judul Buku', 'Penulis', 'Penerbit', 'Klasifikasi', 'ISBN / No. Buku', 'Rak', 'Stok']];
      const tableBody: any[][] = books.map((b, i) => [
        i + 1,
        b.title,
        b.author || '—',
        b.publisher || '—',
        b.category || '—',
        b.nomor_buku || '—',
        b.rak || '—',
        b.stock,
      ]);

      // 5. Render Tabel
      autoTable(doc, {
        startY: margin + 55,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: {
          font: 'times',
          fontSize: 9,
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          valign: 'middle',
          textColor: [40, 40, 40],
          lineColor: [210, 220, 215],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [27, 67, 50],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          lineColor: [27, 67, 50],
          lineWidth: 0.1,
          minCellHeight: 10,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 70 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 25 },
          5: { cellWidth: 40 },
          6: { cellWidth: 20 },
          7: { cellWidth: 15, halign: 'center' },
        },
        alternateRowStyles: { fillColor: [248, 250, 249] },
        margin: { left: margin, right: margin },

        didDrawPage: (data) => {
          drawHeader(data.pageNumber === 1);
        },
      });

      let finalY = (doc as any).lastAutoTable?.finalY ?? margin + 52;

      // 6. Bagian Tanda Tangan Pengesahan Petugas
      if (finalY > pageH - 50) {
        doc.addPage();
        drawHeader(false);
        finalY = margin + 15;
      }

      const signWidth = 65;
      const signX = pageW - margin - signWidth;
      const signY = finalY + 15;

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      const tglFormal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(`Jakarta, ${tglFormal}`, signX + signWidth / 2, signY, { align: 'center' });
      doc.text('Petugas Perpustakaan,', signX + signWidth / 2, signY + 6, { align: 'center' });

      // Tempel TTD petugas dari modal
      if (ttdDataUrl) {
        try {
          doc.addImage(ttdDataUrl, 'PNG', signX + signWidth / 2 - 22, signY + 8, 44, 18);
        } catch (_) { /* skip */ }
      }

      // Garis nama
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(0.3);
      doc.line(signX, signY + 30, signX + signWidth, signY + 30);

      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.text(
        namaPegawai || '(                                              )',
        signX + signWidth / 2, signY + 34, { align: 'center' }
      );

      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      if (nipPegawai) {
        doc.text(`NIP. ${nipPegawai}`, signX + signWidth / 2, signY + 38, { align: 'center' });
      }

      // 7. Footer Nomor Halaman
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Halaman ${i} dari ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
        doc.text('Perpustakaan Pustaka Datun Kejaksaan Agung', margin, pageH - 8);
      }

      doc.save(`Katalog_Buku_KejaksaanAgung_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <>
      <GlobalActionLoading isVisible={isExportingPDF} text="Mengekspor Laporan PDF..." />
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <button
          onClick={handleExportExcel}
          disabled={isExportingPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#16213E] border border-slate-200 hover:border-blue-200 hover:bg-blue-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
        >
          <span className="text-base">📊</span> Excel
        </button>

        <button
          onClick={() => setShowSignModal(true)}
          disabled={isExportingPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-[#16213E] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-wait"
        >
          {isExportingPDF ? (
            <>
              <span className="animate-spin text-base">⏳</span> Memproses...
            </>
          ) : (
            <>
              <span className="text-base">📄</span> Cetak PDF
            </>
          )}
        </button>
      </div>

      {/* Modal TTD Pegawai */}
      {mounted && showSignModal && createPortal(
        <PegawaiSignaturePad
          onConfirm={generatePDF}
          onCancel={() => {
            setShowSignModal(false);
            generatePDF({ nama: '', nip: '', ttdDataUrl: null });
          }}
        />,
        document.body
      )}
    </>
  );
}
