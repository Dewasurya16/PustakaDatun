"use client";

import { useState, useEffect } from "react";
import { handleRegister } from "../actions";
import { useGlobalLoading } from "../components/GlobalLoadingProvider";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus]     = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [strength, setStrength]   = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  const calcStrength = (p: string) => {
    let s = 0;
    if (p.length >= 6)   s++;
    if (p.length >= 10)  s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    setStrength(s);
  };

  const { startAction } = useGlobalLoading();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    await startAction(async () => {
      const result = await handleRegister(email, password);
      if (result.success) {
        setStatus({ type: 'success', msg: 'Pendaftaran berhasil! Akun Anda menunggu persetujuan Admin.' });
        setEmail(''); setPassword(''); setStrength(0);
      } else {
        setStatus({ type: 'error', msg: result.message || 'Gagal mendaftar. Silakan coba lagi.' });
      }
    }, "Mendaftarkan Akun Anda...");
  };

  if (!isMounted) return null;

  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#16213E'];

  return (
    <div className="min-h-screen flex font-sans bg-[var(--background)]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0B1221] relative overflow-hidden flex-col justify-between p-14">
        {/* Animated background blobs */}
        <div className="anim-blob absolute top-14 right-8 w-72 h-72 bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="anim-blob-d absolute bottom-24 left-4 w-56 h-56 bg-blue-500/12 rounded-full blur-[60px] pointer-events-none" />
        <div className="anim-blob-d2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-blue-900/30 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Decorative icons */}
        <div className="anim-float absolute right-12 bottom-36 text-[6rem] opacity-[0.06] select-none rotate-12">🏛️</div>
        <div className="anim-float-d absolute left-10 top-32 text-[5rem] opacity-[0.06] select-none -rotate-12">📝</div>

        {/* Logo */}
        <div className="anim-up-1 relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[var(--shadow-md)] border border-yellow-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <div className="leading-tight">
            <p className="text-white font-black text-[15px]">Pustaka Datun</p>
            <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Pustaka Datun Kejaksaan Agung</p>
          </div>
        </div>

        {/* Center */}
        <div className="relative z-10">
          <div className="anim-up-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-900/40 border border-yellow-700/40 text-yellow-300 text-[10px] font-black uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-[pulseRing_2s_infinite]" /> Pendaftaran Baru
          </div>
          <h2 className="anim-up-3 font-display text-[2.8rem] xl:text-[3.5rem] text-white leading-[1.1] mb-6 drop-shadow-lg">
            Bergabung<br/><span className="shimmer-text">Bersama</span><br/>Kami.
          </h2>
          <p className="anim-up-4 text-blue-100/60 text-[15px] leading-relaxed max-w-[280px] font-medium">
            Daftarkan akun Anda sebagai pegawai Pustaka Datun Kejaksaan Agung untuk mengakses fitur peminjaman digital.
          </p>

          {/* Steps */}
          <div className="anim-up-5 mt-10 flex flex-col gap-3">
            {[
              { step: '01', icon: '📧', text: 'Isi email & buat password' },
              { step: '02', icon: '⏳', text: 'Tunggu persetujuan Admin' },
              { step: '03', icon: '✅', text: 'Akses sistem perpustakaan' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-[var(--green-main)] border border-blue-700/40 flex items-center justify-center text-lg flex-shrink-0 shadow-[var(--shadow-sm)]">{s.icon}</div>
                <span className="text-[13px] font-semibold text-blue-100/80">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-[10px] text-blue-900/60 font-black uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Pranata Komputer 625
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-[var(--background)] to-slate-100/50">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 anim-up-1">
            <div className="w-12 h-12 bg-[var(--green-main)] rounded-2xl flex items-center justify-center shadow-[var(--shadow-sm)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div className="leading-tight">
              <p className="text-slate-900 font-black text-[15px]">Pustaka Datun</p>
              <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">Pustaka Datun Kejaksaan Agung</p>
            </div>
          </div>

          {/* Heading */}
          <div className="anim-up-2 mb-10">
            <h1 className="font-display text-[2.5rem] text-slate-900 leading-tight">Buat Akun Baru</h1>
            <p className="text-slate-500 text-[14px] font-medium mt-2">Daftar sebagai pegawai terdaftar.</p>
          </div>

          {/* Success state */}
          {status?.type === 'success' ? (
            <div className="anim-scale text-center py-10 px-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[1.5rem] border border-blue-200/60 shadow-[var(--shadow-md)]">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-[var(--green-main)] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white shadow-[var(--shadow-green)]">✓</div>
              <h3 className="font-display text-2xl text-blue-800 mb-3">Berhasil Mendaftar!</h3>
              <p className="text-[14px] text-blue-700 font-medium leading-relaxed mb-8 max-w-[260px] mx-auto">{status.msg}</p>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-4 bg-[var(--green-main)] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-[var(--shadow-green)]">
                Lanjut ke Halaman Login →
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">

              {/* Error */}
              {status?.type === 'error' && (
                <div className="anim-up flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm">
                  <span className="text-rose-500 text-lg mt-0.5 shrink-0">⚠️</span>
                  <p className="text-rose-700 text-[13px] font-semibold leading-relaxed">{status.msg}</p>
                </div>
              )}

              {/* Email */}
              <div className="anim-up-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Email Pegawai</label>
                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <input
                    type="email" required
                    className="input-field pl-[3.25rem]"
                    placeholder="nama@kejaksaan.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="anim-up-4">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Kata Sandi Baru</label>
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'} required
                    className="input-field pl-[3.25rem] pr-12"
                    placeholder="Buat sandi yang kuat"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); calcStrength(e.target.value); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Password Strength */}
                {password && (
                  <div className="mt-3 px-1 anim-scale">
                    <div className="flex gap-1.5 mb-2">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 ease-out"
                            style={{ width: strength >= level ? '100%' : '0%', backgroundColor: strengthColor[strength] || '#E2E8F0' }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-right" style={{ color: strengthColor[strength] }}>
                      {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="anim-up-5 btn-primary w-full py-4 px-6 bg-[var(--green-main)] text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-[var(--shadow-green)]"
              >
                Daftar Akun Baru →
              </button>
            </form>
          )}

          {/* Footer links */}
          {status?.type !== 'success' && (
            <div className="anim-up-6 mt-10 text-center space-y-4">
              <p className="text-[13px] text-slate-500 font-medium">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-[var(--green-main)] font-black hover:underline decoration-2 underline-offset-4">
                  Masuk di sini
                </Link>
              </p>
              <p className="text-[13px] text-slate-500 font-medium">
                Bukan pegawai?{' '}
                <Link href="/" className="text-[var(--green-main)] font-black hover:underline decoration-2 underline-offset-4">
                  Kembali ke Beranda
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
