'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV_ITEMS = [
  { label: 'Beranda',    href: '#' },
  { label: 'Koleksi',   href: '#katalog' },
  { label: 'Layanan',   href: '#layanan' },
  { label: 'Buku Tamu', href: '/buku-tamu' },
];

export default function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-50 transition-colors gap-1.5"
        aria-label="Menu"
      >
        <span className={`block w-5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`block w-5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Mobile menu dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-[72px] left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-[13px] font-semibold text-slate-700 hover:text-[#16213E] hover:bg-blue-50 transition-all flex items-center gap-2"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-2 pb-1 border-t border-slate-100 mt-1">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#16213E] text-white rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all"
                  >
                    <span>🛡️</span> Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-[#16213E] text-[#16213E] rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all"
                  >
                    <span>🔐</span> Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}