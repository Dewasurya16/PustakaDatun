'use client';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import GlobalActionLoading from '../components/GlobalActionLoading';
import { createPortal } from 'react-dom';

export default function ImportBukuModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDownloadTemplate = () => {
    const template = [
      {
        title: 'Buku Contoh (Wajib)',
        author: 'Penulis Contoh',
        publisher: 'Penerbit Contoh',
        category: 'Hukum',
        nomor_buku: 'ISBN-12345',
        stock: 5,
        rak: 'A1',
        ringkasan: 'Buku ini membahas tentang hukum...',
        pdf_url: 'https://...',
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Import_Buku.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreview(data.slice(0, 3)); // Preview 3 baris pertama
      } catch (err) {
        alert('Gagal membaca file Excel.');
        setFile(null);
      }
    };
    reader.readAsBinaryString(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error('File kosong');

        const insertData = data.map(row => ({
          title: String(row.title || '').trim(),
          author: row.author ? String(row.author).trim() : null,
          publisher: row.publisher ? String(row.publisher).trim() : null,
          category: row.category ? String(row.category).trim() : null,
          nomor_buku: row.nomor_buku ? String(row.nomor_buku).trim() : null,
          stock: Number(row.stock) || 1,
          rak: row.rak ? String(row.rak).trim() : null,
          ringkasan: row.ringkasan ? String(row.ringkasan).trim() : null,
          pdf_url: row.pdf_url ? String(row.pdf_url).trim() : null,
        })).filter(row => row.title);

        if (insertData.length === 0) throw new Error('Tidak ada data valid (Pastikan kolom "title" terisi).');

        // ── Cek duplikat berdasarkan judul ──
        const titles = insertData.map(r => r.title);
        const { data: existing } = await supabase
          .from('books')
          .select('title')
          .in('title', titles);

        const existingTitles = new Set((existing || []).map((b: any) => b.title.toLowerCase()));
        const duplicates = insertData.filter(r => existingTitles.has(r.title.toLowerCase()));
        const newBooks   = insertData.filter(r => !existingTitles.has(r.title.toLowerCase()));

        if (duplicates.length > 0) {
          const dupList = duplicates.slice(0, 5).map(d => `"${d.title}"`).join(', ');
          const more = duplicates.length > 5 ? ` dan ${duplicates.length - 5} lainnya` : '';
          const proceed = confirm(
            `⚠️ Ditemukan ${duplicates.length} judul yang sudah ada di database:\n${dupList}${more}\n\nKlik OK untuk tetap import ${newBooks.length} buku baru (duplikat dilewati), atau Cancel untuk membatalkan.`
          );
          if (!proceed) { setIsLoading(false); return; }
        }

        if (newBooks.length === 0) {
          alert('Semua buku di file ini sudah ada di database. Tidak ada yang diimport.');
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.from('books').insert(newBooks);
        if (error) throw error;

        alert(`✅ Berhasil import ${newBooks.length} buku baru!${duplicates.length > 0 ? `\n(${duplicates.length} duplikat dilewati)` : ''}`);
        setIsOpen(false);
        setFile(null);
        setPreview([]);
        router.refresh();
      } catch (err: any) {
        alert(`Gagal import: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-100 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95"
      >
        <span className="text-base">📥</span> Import Excel
      </button>

      <GlobalActionLoading isVisible={isLoading} text="Mengimpor Data Buku..." />

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-900 to-indigo-700 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Import Buku Massal</h3>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">
                  Upload file Excel (.xlsx)
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Step 1 */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-10 h-10 bg-white border border-indigo-200 text-indigo-600 rounded-xl flex items-center justify-center font-black flex-shrink-0">1</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">Unduh Template</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Gunakan format ini agar data terbaca dengan benar.</p>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Download
                </button>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center font-black flex-shrink-0">2</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800">Upload File Anda</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pilih file template yang sudah Anda isi.</p>
                  </div>
                </div>
                
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                >
                  {file ? (
                    <div>
                      <p className="text-3xl mb-2">📄</p>
                      <p className="font-bold text-sm text-slate-800">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Siap untuk di-import</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl mb-2">📥</p>
                      <p className="font-bold text-sm text-slate-600">Klik untuk memilih file Excel</p>
                      <p className="text-[10px] text-slate-400 mt-1">.xlsx, .xls</p>
                    </div>
                  )}
                </div>
              </div>

              {preview.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-2 border-b border-slate-200">
                    Preview Data (3 Baris Pertama)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-100/50">
                        <tr>
                          {Object.keys(preview[0]).map(k => (
                            <th key={k} className="px-3 py-2 font-bold text-slate-600">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-3 py-2 text-slate-600">{String(val).slice(0, 30)}{String(val).length > 30 ? '...' : ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => { setIsOpen(false); setFile(null); setPreview([]); }}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase hover:bg-slate-100 transition-all tracking-widest"
              >
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={!file}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-indigo-700 transition-all tracking-widest disabled:opacity-50"
              >
                Mulai Import
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
