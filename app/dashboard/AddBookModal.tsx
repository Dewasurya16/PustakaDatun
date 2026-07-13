'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import GlobalActionLoading from '../components/GlobalActionLoading';
import { MASTER_CATEGORY_NAMES } from '../../lib/categories';

/* ── Spinner ───────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14, flexShrink: 0,
      border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin .65s linear infinite',
    }} />
  );
}

/* ── Field wrapper ─────────────────────────────────────────────────────── */
function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-[9px] text-slate-300 italic">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl ' +
  'focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white ' +
  'outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300';

/* ════════════════════════════════════════════════════════════════════════ */
export default function AddBookModal() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [title,     setTitle]     = useState('');
  const [author,    setAuthor]    = useState('');
  const [publisher, setPublisher] = useState('');
  const [category,  setCategory]  = useState('');
  const [nomorBuku, setNomorBuku] = useState('');
  const [stock,     setStock]     = useState(1);
  const [rak,       setRak]       = useState('');
  const [pdfUrl,    setPdfUrl]    = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [loading,   setLoading]   = useState(false);
  const router = useRouter();

  /* Kunci scroll body */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Tutup dengan Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const resetForm = () => {
    setTitle(''); setAuthor(''); setPublisher('');
    setCategory(''); setNomorBuku(''); setStock(1);
    setRak(''); setPdfUrl(''); setRingkasan('');
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('books').insert([{
      title, author, publisher, category,
      nomor_buku: nomorBuku, stock, rak,
      pdf_url: pdfUrl, ringkasan,
    }]);
    setLoading(false);
    if (!error) { setIsOpen(false); resetForm(); router.refresh(); }
    else alert('Gagal menambah buku! Error: ' + error.message);
  };

  /* ── Trigger ─────────────────────────────────────────────────────── */
  const trigger = (
    <button
      onClick={() => setIsOpen(true)}
      className="inline-flex h-11 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-md bg-neutral-950 px-4 text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-neutral-800"
    >
      [+] Tambah Buku Baru
    </button>
  );

  /* ── Modal via Portal ────────────────────────────────────────────── */
  const modal = isOpen && typeof document !== 'undefined' && createPortal(
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(.97); }
                             to   { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{ animation: 'fadeIn .18s ease' }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998]"
      />

      {/* Scroll container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
        <div
          style={{ animation: 'slideUp .22s cubic-bezier(.34,1.56,.64,1)' }}
          className="relative flex max-h-[calc(100vh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100vh-40px)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Loading overlay */}
          <GlobalActionLoading isVisible={loading} text="Menyimpan buku..." />

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-6"
               style={{ background: 'linear-gradient(135deg,#16213E,#2D6A4F)' }}>
            <div>
              <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest mb-0.5">
                Manajemen Buku
              </p>
              <h3 className="text-white font-black text-lg leading-none">Tambah Buku Baru</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10
                         hover:bg-white/20 text-white/70 hover:text-white font-bold
                         transition-all text-lg"
            >x</button>
          </div>

          {/* ── Form ────────────────────────────────────────────────── */}
          <form onSubmit={handleAddBook} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 styled-scrollbar">

            {/* Judul */}
            <Field label="Judul Buku">
              <input required type="text" value={title}
                onChange={e => setTitle(e.target.value)}
                className={inputCls}
                placeholder="Contoh: KUHP Edisi Revisi..." />
            </Field>

            {/* ISBN + Klasifikasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ISBN" hint="opsional">
                <input type="text" value={nomorBuku}
                  onChange={e => setNomorBuku(e.target.value)}
                  className={inputCls}
                  placeholder="978-xxx-xxx-xxx-x" />
              </Field>
              <Field label="Kategori Buku">
                <select required value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>Pilih Kategori...</option>
                  {MASTER_CATEGORY_NAMES.map((categoryName) => (
                    <option key={categoryName} value={categoryName}>
                      {categoryName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Penulis + Penerbit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Penulis">
                <input required type="text" value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className={inputCls}
                  placeholder="Nama penulis..." />
              </Field>
              <Field label="Penerbit" hint="opsional">
                <input type="text" value={publisher}
                  onChange={e => setPublisher(e.target.value)}
                  className={inputCls}
                  placeholder="Nama penerbit..." />
              </Field>
            </div>

            {/* Stok + Rak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Jumlah Stok">
                <input required type="number" min="0" value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                  className={inputCls} />
              </Field>
              <Field label="Lokasi Rak" hint="opsional">
                <input type="text" value={rak}
                  onChange={e => setRak(e.target.value)}
                  className={inputCls}
                  placeholder="Mis. A-1, B-3..." />
              </Field>
            </div>

            {/* Ringkasan */}
            <Field label="Ringkasan / Sinopsis" hint="opsional">
              <textarea
                rows={3}
                value={ringkasan}
                onChange={e => setRingkasan(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Tuliskan ringkasan isi buku agar mudah dicari peminjam..."
              />
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
                Ringkasan tampil di kartu buku publik dan dapat dicari.
              </p>
            </Field>

            {/* Link E-Book */}
            <Field label="Link E-Book (PDF)" hint="opsional">
              <input type="url" value={pdfUrl}
                onChange={e => setPdfUrl(e.target.value)}
                className={inputCls}
                placeholder="https://..." />
            </Field>

            {/* ── Actions ─────────────────────────────────────────── */}
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6 flex flex-col-reverse sm:flex-row
                            items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsOpen(false); resetForm(); }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500
                           hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#16213E] to-blue-600
                           hover:from-[#143326] hover:to-blue-700 text-white rounded-xl
                           font-bold text-sm shadow-lg shadow-blue-900/20 transition-all
                           disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner /> Menyimpan...</> : 'Simpan Buku'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}
