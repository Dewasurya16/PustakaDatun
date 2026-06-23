'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

// ── Spinner ──────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 16, height: 16, flexShrink: 0,
      border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'spin .65s linear infinite',
    }} />
  );
}

// ── Canvas Signature Pad ─────────────────────────────────────
function SignaturePad({
  onChanged,
  onClear,
}: {
  onChanged: (dataUrl: string | null) => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (
    e: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0B1221';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const pos = getPos(e, canvas);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setIsEmpty(false);
    };

    const onEnd = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      const dataUrl = canvas.toDataURL('image/png');
      onChanged(dataUrl);
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
  }, [onChanged]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChanged(null);
    onClear();
  }, [onChanged, onClear]);

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 hover:border-[#16213E]/40 transition-colors group">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
              ✍️ Tanda tangani di sini
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={460}
          height={110}
          className="w-full cursor-crosshair touch-none block"
          style={{ height: 110 }}
        />
      </div>
      {!isEmpty && (
        <button
          type="button"
          onClick={handleClear}
          className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          ↺ Ulangi Tanda Tangan
        </button>
      )}
    </div>
  );
}

// ── Pilihan keperluan ────────────────────────────────────────
const KEPERLUAN_OPTIONS = [
  'Konsultasi Hukum',
  'Pengambilan Berkas',
  'Pelaporan Kasus',
  'Sidang / Persidangan',
  'Studi / Penelitian',
  'Meminjam Buku',
  'Kunjungan Resmi Instansi',
  'Layanan Informasi',
  'Peminjaman Buku',
  'Lainnya',
];

// ── Pilihan bidang ───────────────────────────────────────────
const BIDANG_OPTIONS = [
  'Perdata & Tata Usaha Negara',
  'Pidana Umum',
  'Pidana Khusus',
  'Intelijen',
  'Pembinaan',
  'Barang Bukti',
  'Instansi Pemerintah',
  'Swasta / Umum',
  'Perguruan Tinggi / Pelajar',
  'Lainnya',
];

// ── Komponen utama ───────────────────────────────────────────
export default function BukuTamuForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fields
  const [nama, setNama] = useState('');
  const [bidang, setBidang] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [keperluanLain, setKeperluanLain] = useState('');
  const [kritikSaran, setKritikSaran] = useState('');
  const [ttdData, setTtdData] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const resetForm = () => {
    setNama('');
    setBidang('');
    setKeperluan('');
    setKeperluanLain('');
    setKritikSaran('');
    setTtdData(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!keperluan) return;

    setLoading(true);

    const finalKeperluan =
      keperluan === 'Lainnya' ? keperluanLain.trim() || 'Lainnya' : keperluan;

    const { error } = await supabase.from('buku_tamu').insert([
      {
        nama: nama.trim(),
        asal_instansi: bidang.trim() || null,   // backward compat
        bidang: bidang.trim() || null,
        keperluan: finalKeperluan,
        pesan: kritikSaran.trim() || null,       // reuse kolom pesan
        ttd_data: ttdData || null,
        status: 'approved',
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Gagal menyimpan. Error: ' + error.message);
      return;
    }

    setIsSuccess(true);
    router.refresh();

    setTimeout(() => {
      setIsOpen(false);
      resetForm();
    }, 2800);
  };

  /* ── Step indicator ───────────────────────────────────────── */
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const goNext = () => {
    if (step === 1 && !nama.trim()) return;
    if (step === 2 && !keperluan) return;
    setStep((s) => Math.min(s + 1, totalSteps));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const resetAll = () => { resetForm(); setStep(1); };

  /* ── Modal ────────────────────────────────────────────────── */
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={() => !loading && setIsOpen(false)}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-3">
            <div style={{
              width: 48, height: 48,
              border: '4px solid #e2e8f0', borderTopColor: '#16213E',
              borderRadius: '50%', animation: 'spin .7s linear infinite',
            }} />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Menyimpan...</p>
          </div>
        )}

        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-[#0B1221] to-[#16213E]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Buku Tamu Digital</h3>
              <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-widest mt-0.5">
                Pustaka Datun Kejaksaan Agung
              </p>
            </div>
            <button
              type="button"
              onClick={() => !loading && setIsOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-bold transition-all"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          {!isSuccess && (
            <div className="mt-4 flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-blue-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Success */}
        {isSuccess ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              ✓
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Terima Kasih!</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
              Data kunjungan Anda telah berhasil dicatat. Kehadiran Anda sangat berarti bagi kami.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
            <div className="p-7 space-y-5">

              {/* ─── STEP 1: Identitas ─── */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Langkah 1 / 3</p>
                    <h4 className="text-base font-black text-slate-800">Identitas Pengunjung</h4>
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Budi Santoso, S.H."
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#16213E] focus:border-[#16213E] outline-none transition-all font-medium text-slate-800 text-sm placeholder:text-slate-400"
                    />
                  </div>

                  {/* Bidang */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Bidang / Instansi Asal <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BIDANG_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBidang(opt)}
                          className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-left border transition-all ${
                            bidang === opt
                              ? 'bg-[#16213E] text-white border-[#16213E] shadow-md'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[#16213E]/40 hover:text-[#16213E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Keperluan & Kritik ─── */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Langkah 2 / 3</p>
                    <h4 className="text-base font-black text-slate-800">Keperluan & Masukan</h4>
                  </div>

                  {/* Keperluan */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Keperluan / Tujuan Kunjungan <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {KEPERLUAN_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setKeperluan(opt)}
                          className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-left border transition-all ${
                            keperluan === opt
                              ? 'bg-[#16213E] text-white border-[#16213E] shadow-md'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[#16213E]/40 hover:text-[#16213E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {keperluan === 'Lainnya' && (
                      <input
                        type="text"
                        value={keperluanLain}
                        onChange={(e) => setKeperluanLain(e.target.value)}
                        placeholder="Sebutkan keperluan..."
                        className="mt-3 w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#16213E] focus:border-[#16213E] outline-none transition-all font-medium text-slate-800 text-sm placeholder:text-slate-400"
                      />
                    )}
                  </div>

                  {/* Kritik / Saran */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Kritik / Saran
                    </label>
                    <textarea
                      value={kritikSaran}
                      onChange={(e) => setKritikSaran(e.target.value)}
                      rows={3}
                      placeholder="Sampaikan kritik atau saran untuk meningkatkan layanan kami..."
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#16213E] focus:border-[#16213E] outline-none transition-all font-medium text-slate-800 text-sm resize-none placeholder:text-slate-400 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ─── STEP 3: Tanda Tangan ─── */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Langkah 3 / 3</p>
                    <h4 className="text-base font-black text-slate-800">Tanda Tangan</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Tanda tangani di kotak di bawah sebagai konfirmasi kunjungan Anda.
                    </p>
                  </div>

                  {/* Preview nama */}
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-10 h-10 rounded-xl bg-[#16213E] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{nama}</p>
                      <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{bidang}</p>
                    </div>
                  </div>

                  {/* Canvas pad */}
                  <SignaturePad
                    onChanged={setTtdData}
                    onClear={() => setTtdData(null)}
                  />

                  {!ttdData && (
                    <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                      ⚠️ Tanda tangan diperlukan untuk menyelesaikan
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer tombol */}
            <div className="px-7 pb-7 pt-3 border-t border-slate-100 flex justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
                >
                  ← Kembali
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm"
                >
                  Batal
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (step === 1 && (!nama.trim() || !bidang)) ||
                    (step === 2 && !keperluan)
                  }
                  className="px-6 py-2.5 bg-[#16213E] hover:bg-[#0B1221] text-white rounded-xl font-black text-sm shadow-lg shadow-[#16213E]/20 transition-all disabled:opacity-50"
                >
                  Lanjut →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !ttdData}
                  className="px-6 py-2.5 bg-[#16213E] hover:bg-[#0B1221] text-white rounded-xl font-black text-sm shadow-lg shadow-[#16213E]/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <><Spinner /> Menyimpan...</> : '✍️ Simpan & Selesai'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => { resetAll(); setIsOpen(true); }}
        className="flex items-center gap-2 bg-[#16213E] hover:bg-[#0B1221] text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-[#16213E]/25 hover:-translate-y-0.5 active:translate-y-0"
      >
        <span>✍️</span> Isi Buku Tamu
      </button>

      {mounted && isOpen ? createPortal(modalContent, document.body) : null}
    </>
  );
}