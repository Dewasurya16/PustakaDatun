'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import GlobalActionLoading from '../components/GlobalActionLoading';

export default function CetakSuratPeringatan({ loan, daysLate }: { loan: any, daysLate: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Signature States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [namaPetugas, setNamaPetugas] = useState('');
  const [nipPetugas, setNipPetugas] = useState('');
  const [dendaPerHari, setDendaPerHari] = useState(1000);

  useEffect(() => { setMounted(true); }, []);

  // Signature Pad Logic
  useEffect(() => {
    if (!isOpen) return;
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
      isDrawing.current = false;
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
  }, [isOpen]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      let ttdDataUrl: string | null = null;
      const canvas = canvasRef.current;
      if (canvas && !isEmpty) {
        const temp = document.createElement('canvas');
        temp.width = canvas.width;
        temp.height = canvas.height;
        const ctx = temp.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, temp.width, temp.height);
        ctx.drawImage(canvas, 0, 0);
        ttdDataUrl = temp.toDataURL('image/png');
      }

      // Fetch Logo Kejaksaan
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

      // Kertas A4
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 25;

      // 1. KOP SURAT
      const headerY = 15;
      if (logoData) {
        doc.addImage(logoData, 'PNG', margin + 3, headerY, 26, 26);
      }
      doc.setTextColor(30, 30, 30);
      doc.setFont('times', 'normal');
      doc.setFontSize(13);
      doc.text('KEJAKSAAN REPUBLIK INDONESIA', pageW / 2, headerY + 5, { align: 'center' });
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.text('KEJAKSAAN AGUNG', pageW / 2, headerY + 13, { align: 'center' });

      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.text('Jl. Sultan Hasanuddin Nomor 1, Kebayoran Baru, Jakarta Selatan', pageW / 2, headerY + 20, { align: 'center' });
      doc.text('Telp. (021) 7203061 - (ext. 10306) fax. (021) 7208317', pageW / 2, headerY + 25, { align: 'center' });
      doc.text('www.kejaksaan.go.id', pageW / 2, headerY + 30, { align: 'center' });
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.0);
      doc.line(margin, headerY + 33, pageW - margin, headerY + 33);
      doc.setLineWidth(0.3);
      doc.line(margin, headerY + 34.5, pageW - margin, headerY + 34.5);

      // 2. TANGGAL & PERIHAL
      const tglFormal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text(`Jakarta, ${tglFormal}`, pageW - margin, 60, { align: 'right' });
      
      doc.text('Nomor      : B-    /P.4.20/Perpus/    /2026', margin, 65);
      doc.text('Lampiran   : 1 (satu) Berkas', margin, 71);
      doc.text('Perihal    : ', margin, 77);
      doc.setFont('times', 'bold');
      doc.text('Peringatan Keterlambatan Pengembalian Buku', margin + 18, 77);
      
      // 3. KEPADA
      doc.setFont('times', 'normal');
      doc.text('Yth. Sdr/i ', margin, 90);
      doc.setFont('times', 'bold');
      doc.text(loan.employee_name || 'Pegawai', margin + 18, 90);
      doc.setFont('times', 'normal');
      doc.text('di -', margin, 96);
      doc.text('     Tempat', margin, 102);

      // 4. ISI SURAT
      let currentY = 115;
      doc.text('Dengan hormat,', margin, currentY);
      currentY += 8;
      
      const paragraf1 = `Berdasarkan catatan administrasi Perpustakaan Pustaka Datun Kejaksaan Agung, Saudara/i masih belum mengembalikan buku pinjaman yang telah melewati batas waktu pengembalian yang disepakati.`;
      const splitP1 = doc.splitTextToSize(paragraf1, pageW - (margin * 2));
      doc.text(splitP1, margin, currentY);
      currentY += (splitP1.length * 6) + 5;

      doc.text('Rincian Peminjaman Buku:', margin, currentY);
      currentY += 8;
      
      // Rincian (tabel semu)
      const rX1 = margin + 5;
      const rX2 = margin + 45;
      doc.text('Judul Buku', rX1, currentY); doc.text(`: ${loan.books?.title || '—'}`, rX2, currentY); currentY += 6;
      const tglPinjam = new Date(loan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text('Tanggal Pinjam', rX1, currentY); doc.text(`: ${tglPinjam}`, rX2, currentY); currentY += 6;
      const tglJatuhTempo = new Date(loan.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text('Batas Pengembalian', rX1, currentY); doc.text(`: ${tglJatuhTempo}`, rX2, currentY); currentY += 6;
      doc.setFont('times', 'bold');
      doc.text('Lama Keterlambatan', rX1, currentY); doc.text(`: ${daysLate} hari`, rX2, currentY); currentY += 6;
      
      if (dendaPerHari > 0) {
        const totalDenda = (daysLate * dendaPerHari).toLocaleString('id-ID');
        doc.text('Estimasi Denda', rX1, currentY); doc.text(`: Rp ${totalDenda} (Rp ${dendaPerHari.toLocaleString('id-ID')}/hari)`, rX2, currentY); 
      }
      currentY += 10;
      
      doc.setFont('times', 'normal');
      const paragraf2 = `Kami mohon kerjasamanya untuk segera mengembalikan buku tersebut ke Perpustakaan agar dapat dimanfaatkan oleh pegawai lainnya. Apabila buku telah hilang atau rusak, mohon agar segera melapor kepada Petugas Perpustakaan.`;
      const splitP2 = doc.splitTextToSize(paragraf2, pageW - (margin * 2));
      doc.text(splitP2, margin, currentY);
      currentY += (splitP2.length * 6) + 5;

      doc.text('Demikian pemberitahuan ini disampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.', margin, currentY);

      // 5. TANDA TANGAN
      currentY += 25;
      const signW = 60;
      const signX = pageW - margin - signW;
      
      doc.text('Petugas Perpustakaan,', signX + signW/2, currentY, { align: 'center' });
      
      if (ttdDataUrl) {
        doc.addImage(ttdDataUrl, 'PNG', signX + signW/2 - 20, currentY + 5, 40, 20);
      }
      
      doc.setLineWidth(0.3);
      doc.line(signX, currentY + 30, signX + signW, currentY + 30);
      
      doc.setFont('times', 'bold');
      doc.text(namaPetugas || '(_________________________)', signX + signW/2, currentY + 35, { align: 'center' });
      
      doc.setFont('times', 'normal');
      if (nipPetugas) {
        doc.text(`NIP. ${nipPetugas}`, signX + signW/2, currentY + 40, { align: 'center' });
      }

      doc.save(`Surat_Teguran_${loan.employee_name.replace(' ', '_')}.pdf`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[9px] font-black bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors uppercase tracking-widest flex-shrink-0"
      >
        Cetak Surat
      </button>

      <GlobalActionLoading isVisible={isExporting} text="Memproses Dokumen PDF..." />

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-rose-900 to-rose-700">
              <h3 className="text-base font-black text-white">Generate Surat Peringatan</h3>
              <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest mt-0.5">
                Keterlambatan {daysLate} Hari — {loan.employee_name}
              </p>
            </div>
            
            <div className="p-7 space-y-4">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800 font-medium">
                Buku: <strong>{loan.books?.title}</strong>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tarif Denda per Hari (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                  <input
                    type="number" value={dendaPerHari} onChange={(e) => setDendaPerHari(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Estimasi tagihan: Rp {(daysLate * dendaPerHari).toLocaleString('id-ID')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Petugas</label>
                  <input
                    type="text" value={namaPetugas} onChange={(e) => setNamaPetugas(e.target.value)}
                    placeholder="Nama..."
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">NIP Petugas</label>
                  <input
                    type="text" value={nipPetugas} onChange={(e) => setNipPetugas(e.target.value)}
                    placeholder="NIP..."
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 transition-all"
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
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">✍️ Tanda tangani</p>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={100}
                    className="w-full cursor-crosshair touch-none block"
                    style={{ height: 100 }}
                  />
                </div>
                {!isEmpty && (
                  <button type="button" onClick={handleClear} className="mt-1.5 text-[9px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest">
                    ↺ Ulangi
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-200 transition-all tracking-widest">
                  Batal
                </button>
                <button
                  onClick={generatePDF}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-rose-700 transition-all tracking-widest"
                >
                  Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
