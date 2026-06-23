"use client";

import { useRouter } from "next/navigation";
import { handleLogout } from "./actions";
import Link from "next/link";

export default function ProfileMenu({ email, role }: { email: string, role: string }) {
  const router = useRouter();

  const onLogout = async () => {
    await handleLogout();
    router.push("/");
    router.refresh();
  };

  const isAdmin = role === "admin";

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Tombol Admin - Dibuat muncul di HP dengan ikon saja, di Laptop dengan teks */}
      {isAdmin && (
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1 text-[10px] sm:text-sm font-bold text-[#16213E] hover:bg-[#16213E] hover:text-white transition-all bg-green-50 px-2 sm:px-3 py-1.5 rounded-lg border border-green-200"
          title="Mode Admin"
        >
          <span>⚡</span>
          <span className="hidden xs:block">Admin</span>
        </Link>
      )}

      {/* Info Profil & Logout */}
      <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-200 pl-2 sm:pl-4">
        {/* Email - Disembunyikan di HP sangat kecil agar tidak sempit */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight truncate max-w-[100px] sm:max-w-none">
            {email}
          </span>
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-yellow-600' : 'text-[#16213E]'}`}>
            {isAdmin ? 'Admin' : 'Pegawai'}
          </span>
        </div>
        
        {/* Tombol Profil - Lebih jelas dan mudah ditekan */}
        <Link
          href="/profil"
          title="Lihat Profil Saya"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#16213E] text-white rounded-xl shadow-sm border border-[#143628] hover:bg-[#143628] hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black text-[10px] uppercase group-hover:scale-110 transition-transform">
            {email ? email.charAt(0) : 'U'}
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:block">Profil Saya</span>
        </Link>

        {/* Tombol Logout - Di HP hanya ikon supaya hemat ruang */}
        <button 
          onClick={onLogout}
          className="p-2 sm:px-3 sm:py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 flex items-center gap-1.5 active:scale-95"
          title="Keluar"
        >
          <span className="hidden sm:block text-xs sm:text-sm font-bold">Keluar</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}