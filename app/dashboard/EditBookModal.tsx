'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import GlobalActionLoading from '../components/GlobalActionLoading';

/* ── Spinner kecil ─────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14, flexShrink: 0,
      border: '2.5px solid rgba(255,255,255,.3)',
      borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin .65s linear infinite',
    }} />
  );
}

/* ── Input atom ────────────────────────────────────────────────────────── */
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
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
export default function EditBookModal({ book }: { book: any }) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [title,     setTitle]     = useState(book.title     || '');
  const [author,    setAuthor]    = useState(book.author    || '');
  const [publisher, setPublisher] = useState(book.publisher || '');
  const [category,  setCategory]  = useState(book.category  || '');
  const [nomorBuku, setNomorBuku] = useState(book.nomor_buku || '');
  const [stock,     setStock]     = useState<number>(book.stock ?? 0);
  const [rak,       setRak]       = useState(book.rak       || '');
  const [pdfUrl,    setPdfUrl]    = useState(book.pdf_url   || '');
  const [ringkasan, setRingkasan] = useState(book.ringkasan || '');
  const [loading,   setLoading]   = useState(false);
  const router = useRouter();

  /* createPortal needs the DOM to be ready */
  useEffect(() => { setMounted(true); }, []);

  /* Kunci scroll body saat modal terbuka */
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

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('books')
      .update({ title, author, publisher, category, nomor_buku: nomorBuku, stock, rak, pdf_url: pdfUrl, ringkasan })
      .eq('id', book.id);
    setLoading(false);
    if (!error) { setIsOpen(false); router.refresh(); }
    else alert('Gagal mengupdate buku: ' + error.message);
  };

  /* ── Trigger button ──────────────────────────────────────────────── */
  const trigger = (
    <button
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600
                 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest
                 border border-blue-100 transition-colors"
    >
      ✏️ Edit
    </button>
  );

  /* ── Modal (via Portal) ──────────────────────────────────────────── */
  const modal = isOpen && mounted && createPortal(
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}
      </style>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{ animation: 'fadeIn .18s ease' }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998]"
      />

      {/* Panel – scroll container */}
      <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        <div
          style={{ animation: 'slideUp .22s cubic-bezier(.34,1.56,.64,1)' }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl my-4 sm:my-8 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Loading overlay */}
          <GlobalActionLoading isVisible={loading} text="Menyimpan perubahan..." />

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4"
               style={{ background: 'linear-gradient(135deg,#16213E,#2D6A4F)' }}>
            <div>
              <p className="text-blue-300 text-[9px] font-black uppercase tracking-widest mb-0.5">
                Manajemen Buku
              </p>
              <h3 className="text-white font-black text-lg leading-none">Edit Data Buku</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10
                         hover:bg-white/20 text-white/70 hover:text-white font-bold
                         transition-all text-lg"
            >✕</button>
          </div>

          {/* ── Form ────────────────────────────────────────────────── */}
          <form onSubmit={handleEditBook} className="p-6 space-y-5">

            {/* Judul */}
            <Field label="Judul Buku">
              <input required type="text" value={title}
                onChange={e => setTitle(e.target.value)}
                className={inputCls}
                placeholder="Masukkan judul buku…" />
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
                  <option value="Buku Datun">Buku Datun</option>
                  <option value="Materi Paparan Jamdatun">Materi Paparan Jamdatun</option>
                  <option value="Peraturan">Peraturan</option>
                  <option value="Pengetahuan penunjang">Pengetahuan penunjang</option>
                  <option value="Berkas perkara lengkap">Berkas perkara lengkap</option>
                  <option value="LO kebijakan dan legislasi">LO kebijakan dan legislasi</option>
                  <option value="LO korporasi">LO korporasi</option>
                  <option value="LO litigasi">LO litigasi</option>
                  <option value="LO pengadaan - pbj">LO pengadaan - pbj</option>
                  <option value="LO perjanjian">LO perjanjian</option>
                  <option value="Materi pelatihan">Materi pelatihan</option>
                  <option value="Perjanjian kerja sama">Perjanjian kerja sama</option>
                  <option value="Laporan perkembangan THL">Laporan perkembangan THL</option>
                  <option value="Materi Rakernas">Materi Rakernas</option>
                </select>
              </Field>
            </div>

            {/* Penulis + Penerbit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Penulis">
                <input required type="text" value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className={inputCls}
                  placeholder="Nama penulis…" />
              </Field>
              <Field label="Penerbit" hint="opsional">
                <input type="text" value={publisher}
                  onChange={e => setPublisher(e.target.value)}
                  className={inputCls}
                  placeholder="Nama penerbit…" />
              </Field>
            </div>

            {/* Stok + Rak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sisa Stok">
                <input required type="number" min="0" value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                  className={inputCls} />
              </Field>
              <Field label="Lokasi Rak" hint="opsional">
                <input type="text" value={rak}
                  onChange={e => setRak(e.target.value)}
                  className={inputCls}
                  placeholder="Mis. A-1, B-3…" />
              </Field>
            </div>

            {/* Ringkasan */}
            <Field label="Ringkasan / Sinopsis" hint="opsional">
              <textarea
                rows={3}
                value={ringkasan}
                onChange={e => setRingkasan(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Tuliskan ringkasan isi buku…"
              />
            </Field>

            {/* Link E-Book */}
            <Field label="Link E-Book (PDF)" hint="opsional">
              <input type="url" value={pdfUrl}
                onChange={e => setPdfUrl(e.target.value)}
                className={inputCls}
                placeholder="https://…" />
            </Field>

            {/* ── Divider ─── */}
            <div className="pt-2 border-t border-slate-100 flex flex-col-reverse sm:flex-row
                            items-stretch sm:items-center justify-between gap-3">

              {/* Info ID */}
              <p className="text-[9px] text-slate-300 font-medium text-center sm:text-left">
                ID: {book.id}
              </p>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
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
                             disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? <><Spinner /> Menyimpan…</> : '💾 Simpan Perubahan'}
                </button>
              </div>
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