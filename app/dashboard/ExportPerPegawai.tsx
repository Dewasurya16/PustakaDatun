'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import GlobalActionLoading from '../components/GlobalActionLoading';

export default function ExportPerPegawai({ loans }: { loans: any[] }) {
  const [selectedName, setSelectedName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ambil daftar unik nama pegawai
  const names = Array.from(new Set(loans.map(l => l.employee_name).filter(Boolean))).sort();

  const filteredLoans = selectedName
    ? loans.filter(l => l.employee_name === selectedName)
    : [];

  const handleExcelPerPegawai = () => {
    if (!selectedName || filteredLoans.length === 0) {
      alert('Pilih pegawai terlebih dahulu.');
      return;
    }
    const rows = filteredLoans.map((l, i) => ({
      'No': i + 1,
      'Nama Peminjam': l.employee_name || '—',
      'NIP': l.employee_nip || '—',
      'Judul Buku': l.books?.title || '—',
      'Tgl Pinjam': l.created_at ? new Date(l.created_at).toLocaleDateString('id-ID') : '—',
      'Tenggat': l.due_date ? new Date(l.due_date).toLocaleDateString('id-ID') : '—',
      'Tgl Kembali': l.return_date ? new Date(l.return_date).toLocaleDateString('id-ID') : '—',
      'Status': l.status || '—',
      'Via': l.borrowed_via || '—',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 4 }, { wch: 30 }, { wch: 20 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sirkulasi');
    XLSX.writeFile(wb, `Sirkulasi_${selectedName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePDFPerPegawai = async () => {
    if (!selectedName || filteredLoans.length === 0) {
      alert('Pilih pegawai terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    try {
      let logoData: string | null = null;
      try {
        const res = await fetch('/logo-kejaksaan.png');
        if (res.ok) {
          const blob = await res.blob();
          logoData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (_) {}

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;

      // Kop Surat
      if (logoData) {
        doc.addImage(logoData, 'PNG', margin + 3, margin, 26, 26);
      }
      doc.setFont('times', 'normal');
      doc.setFontSize(13);
      doc.text('KEJAKSAAN REPUBLIK INDONESIA', pageW / 2, margin + 5, { align: 'center' });
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.text('KEJAKSAAN AGUNG', pageW / 2, margin + 13, { align: 'center' });

      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.text('Jl. Sultan Hasanuddin Nomor 1, Kebayoran Baru, Jakarta Selatan', pageW / 2, margin + 20, { align: 'center' });
      doc.text('Telp. (021) 7203061 - (ext. 10306) fax. (021) 7208317', pageW / 2, margin + 25, { align: 'center' });
      doc.text('www.kejaksaan.go.id', pageW / 2, margin + 30, { align: 'center' });

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.0);
      doc.line(margin, margin + 33, pageW - margin, margin + 33);
      doc.setLineWidth(0.3);
      doc.line(margin, margin + 34.5, pageW - margin, margin + 34.5);

      // Judul
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text('REKAP SIRKULASI PEMINJAMAN BUKU', pageW / 2, margin + 45, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text(`Pegawai: ${selectedName}`, pageW / 2, margin + 51, { align: 'center' });
      doc.text(`Per Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageW / 2, margin + 56, { align: 'center' });

      // Statistik ringkas
      const active = filteredLoans.filter(l => l.status?.toUpperCase() === 'DIPINJAM').length;
      const returned = filteredLoans.filter(l => ['DIKEMBALIKAN','SUDAH DIULAS'].includes(l.status?.toUpperCase())).length;
      const today = new Date();
      const late = filteredLoans.filter(l => l.status?.toUpperCase() === 'DIPINJAM' && new Date(l.due_date) < today).length;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total: ${filteredLoans.length} | Aktif: ${active} | Dikembalikan: ${returned} | Terlambat: ${late}`, pageW / 2, margin + 61, { align: 'center' });
      doc.setTextColor(30, 30, 30);

      // Tabel
      const tableData = filteredLoans.map((l, i) => [
        i + 1,
        l.books?.title || '—',
        l.due_date ? new Date(l.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        l.return_date ? new Date(l.return_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        l.status || '—',
        l.borrowed_via || '—',
      ]);

      autoTable(doc, {
        startY: margin + 65,
        head: [['No', 'Judul Buku', 'Tenggat', 'Dikembalikan', 'Status', 'Via']],
        body: tableData,
        theme: 'grid',
        styles: { font: 'times', fontSize: 9, cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }, textColor: [40, 40, 40] },
        headStyles: { fillColor: [27, 67, 50], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { halign: 'center', cellWidth: 28 },
          3: { halign: 'center', cellWidth: 28 },
          4: { halign: 'center', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 18 },
        },
        alternateRowStyles: { fillColor: [249, 252, 250] },
        margin: { left: margin, right: margin },
      });

      doc.save(`Rekap_${selectedName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Gagal membuat PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalActionLoading isVisible={isLoading} text="Membuat Rekap PDF..." />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-base">👤</span>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Export per Pegawai</h3>
            <p className="text-[10px] text-slate-400 font-medium">Rekap sirkulasi berdasarkan satu nama pegawai</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedName}
            onChange={e => setSelectedName(e.target.value)}
            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#16213E] transition-all cursor-pointer"
          >
            <option value="">— Pilih Pegawai —</option>
            {names.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {selectedName && (
            <span className="self-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
              {filteredLoans.length} transaksi
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExcelPerPegawai}
            disabled={!selectedName || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📊 Excel
          </button>
          <button
            onClick={handlePDFPerPegawai}
            disabled={!selectedName || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📄 PDF Rekap
          </button>
        </div>
      </div>
    </>
  );
}
