"use client";

import { useState, useEffect, useRef } from "react";
import { handleLogin } from "../actions";
import { useGlobalLoading } from "../components/GlobalLoadingProvider";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [errorMsg, setErrorMsg]   = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused]     = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  const { startAction } = useGlobalLoading();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    await startAction(async () => {
      try {
        const result = await handleLogin(email, password);
        if (result.success && result.url) {
          window.location.href = result.url;
        } else {
          setErrorMsg(result.message || "Email atau password salah.");
          setIsLoading(false);
        }
      } catch {
        setErrorMsg("Koneksi gagal. Silakan coba lagi.");
        setIsLoading(false);
      }
    }, "Memverifikasi Akun...");
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex font-sans overflow-hidden" style={{ background: '#070D1A' }}>

      {/* ══════════════════════════════════════════
          LEFT PANEL — Full-bleed image + overlay
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">

        {/* Gedung background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/kejaksaan agung.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 5%',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Deep dark gradient overlay dari kiri */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, #070D1A 0%, #0B1530cc 45%, transparent 100%)',
          }}
        />
        {/* Bottom fade untuk transisi ke foto */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #070D1A 0%, transparent 40%)',
          }}
        />


        {/* Content kiri atas */}
        <div className="relative z-30 p-14 flex flex-col justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border border-[#F59E0B]/30" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Image src="/logo-kejaksaan.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-white font-black text-base tracking-tight">Pustaka Datun</p>
              <p className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.18em]">Kejaksaan Agung RI</p>
            </div>
          </div>

          {/* Tagline tengah */}
          <div className="max-w-[380px]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border border-[#F59E0B]/25"
              style={{ background: 'rgba(245,158,11,0.08)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[#F59E0B] text-[10px] font-black uppercase tracking-[0.2em]">Portal Pegawai</span>
            </div>
            <h2 className="text-[2.8rem] xl:text-[3.2rem] font-black text-white leading-[1.08] mb-5">
              Selamat<br />
              <span style={{ color: '#F59E0B' }}>Datang</span><br />
              Kembali.
            </h2>
            <p className="text-white/40 text-[13.5px] leading-relaxed font-medium max-w-[300px]">
              Akses sistem manajemen perpustakaan hukum digital Datun Kejaksaan Agung Republik Indonesia.
            </p>

            {/* Feature list */}
            <div className="mt-8 flex flex-col gap-2.5">
              {[
                { icon: '📚', label: 'Kelola koleksi buku & aset' },
                { icon: '🔄', label: 'Sistem peminjaman digital' },
                { icon: '📊', label: 'Laporan & ekspor otomatis' },
                { icon: '🤖', label: 'Asisten AI 24/7' },
              ].map((f) => (
                <div key={f.label}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/8 backdrop-blur-sm transition-all hover:border-[#F59E0B]/30"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-base">{f.icon}</span>
                  <span className="text-[12.5px] font-semibold text-white/55">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer kecil */}
          <p className="text-white/18 text-[10px] font-bold uppercase tracking-[0.22em] mt-10 pt-6 border-t border-white/8">
            © {new Date().getFullYear()} Pustaka Datun Kejaksaan Agung RI
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Login form
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-12 sm:px-10"
        style={{ background: 'linear-gradient(160deg, #0B1530 0%, #070D1A 100%)' }}>

        {/* Subtle glow blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />


        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Image src="/logo-kejaksaan.png" alt="Logo" width={44} height={44} className="rounded-xl" />
            <div>
              <p className="text-white font-black text-base">Pustaka Datun</p>
              <p className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-widest">Kejaksaan Agung RI</p>
            </div>
          </div>

          {/* Card header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#F59E0B]/20 mb-4"
              style={{ background: 'rgba(245,158,11,0.07)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-[#F59E0B] text-[9px] font-black uppercase tracking-[0.2em]">Sistem Login</span>
            </div>
            <h1 className="text-[2rem] font-black text-white leading-tight">Masuk ke Akun</h1>
            <p className="text-white/35 text-[13px] mt-1.5 font-medium">Gunakan kredensial akun pegawai Anda.</p>
          </div>

          {/* Form card — glassmorphism */}
          <form onSubmit={onSubmit}
            className="rounded-2xl p-7 sm:p-8 border border-white/8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

            {/* Error message */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl mb-6 border border-rose-500/25 animate-pulse-once"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <span className="text-rose-400 shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <p className="text-rose-300 text-[12.5px] font-semibold leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email field */}
              <div>
                <label className="block text-[10.5px] font-black text-white/40 uppercase tracking-[0.18em] mb-2">
                  Email Pegawai
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focused === 'email'
                    ? 'border-[#F59E0B]/70 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'
                    : 'border-white/10 hover:border-white/20'
                }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@kejaksaan.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent outline-none text-white text-sm placeholder-white/20 font-medium rounded-xl"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10.5px] font-black text-white/40 uppercase tracking-[0.18em] mb-2">
                  Kata Sandi
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${
                  focused === 'password'
                    ? 'border-[#F59E0B]/70 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'
                    : 'border-white/10 hover:border-white/20'
                }`} style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-11 pr-12 py-3.5 bg-transparent outline-none text-white text-sm placeholder-white/20 font-medium rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/70 rounded-lg transition-colors"
                  >
                    {showPass ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-7 py-4 rounded-xl font-black text-sm uppercase tracking-[0.14em] transition-all duration-200 relative overflow-hidden group"
              style={{
                background: isLoading
                  ? 'rgba(245,158,11,0.5)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#fff',
                boxShadow: isLoading ? 'none' : '0 8px 32px rgba(245,158,11,0.35)',
              }}
            >
              {/* Shine effect on hover */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }} />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">atau</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Back to home */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white/45 text-[12.5px] font-semibold hover:border-white/25 hover:text-white/70 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
              Kembali ke Beranda
            </Link>
          </form>

          {/* Footer */}
          <p className="text-white/15 text-[10px] font-bold uppercase tracking-[0.22em] text-center mt-6">
            © {new Date().getFullYear()} Pustaka Datun Kejaksaan Agung RI
          </p>
        </div>
      </div>

    </div>
  );
}