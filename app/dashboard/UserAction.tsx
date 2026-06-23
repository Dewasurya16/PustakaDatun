"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import GlobalActionLoading from "../components/GlobalActionLoading";

export default function UserAction({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk Modal Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState(user.role || 'user');
  const [status, setStatus] = useState(user.status || 'pending');
  const [newPassword, setNewPassword] = useState('');

  // Fungsi ACC Cepat (Tanpa buka modal)
  const handleQuickAcc = async () => {
    setIsLoading(true);
    await supabase.from("profiles").update({ status: 'approved' }).eq("id", user.id);
    router.refresh();
    setIsLoading(false);
  };

  // Fungsi Hapus Akun
  const handleDeleteUser = async () => {
    if (confirm(`Peringatan: Hapus permanen akun ${user.email}?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      setIsLoading(true);
      await supabase.from("profiles").delete().eq("id", user.id);
      router.refresh();
      setIsLoading(false);
    }
  };

  // Fungsi Simpan Perubahan Edit & Reset Password
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const updates: any = { role, status };
    
    // Jika kolom password diisi, ikut diupdate ke database
    if (newPassword.trim() !== '') {
      updates.password = newPassword; 
    }

    await supabase.from("profiles").update(updates).eq("id", user.id);
    
    setIsModalOpen(false);
    setNewPassword(''); // Kosongkan lagi setelah sukses
    router.refresh();
    setIsLoading(false);
  };

  return (
    <>
      <GlobalActionLoading isVisible={isLoading} text="Memproses Data..." />
      <div className="flex items-center justify-end gap-2">
        
        {/* Tombol ACC Cepat (Hanya muncul jika status masih pending) */}
        {user.status === 'pending' ? (
          <button 
            onClick={handleQuickAcc} disabled={isLoading}
            className="text-[10px] font-black bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-all uppercase tracking-wider shadow-sm disabled:opacity-50"
            title="Setujui Pendaftar Ini"
          >
            {isLoading ? "..." : "ACC Cepat"}
          </button>
        ) : (
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-widest hidden sm:inline-block">
            {user.role === 'admin' ? 'Admin' : 'Aktif'}
          </span>
        )}

        {/* Tombol Buka Modal Edit */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
          title="Edit & Reset Password"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>

        {/* Tombol Hapus */}
        <button 
          onClick={handleDeleteUser} disabled={isLoading}
          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
          title="Hapus Akun"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>

      {/* ========================================== */}
      {/* MODAL EDIT & RESET PASSWORD                */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-[#16213E] to-[#2d6a4f] p-6 text-white text-left">
              <h3 className="text-xl font-black flex items-center gap-2"><span>🛡️</span> Kelola Akun Pegawai</h3>
              <p className="text-xs font-medium text-blue-100/80 mt-1">{user.email}</p>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 sm:p-8 space-y-5 text-left">
              
              {/* Hak Akses (Role) */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Tingkat Akses (Role)</label>
                <select 
                  value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16213E]/50 text-sm font-bold text-gray-900 transition-all"
                >
                  <option value="user">Pegawai Biasa</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                </select>
              </div>

              {/* Status Akun */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-2">Status Akun</label>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16213E]/50 text-sm font-bold text-gray-900 transition-all"
                >
                  <option value="pending">Menunggu Persetujuan (Pending)</option>
                  <option value="approved">Aktif (Approved)</option>
                </select>
              </div>

              {/* Reset Password */}
              <div className="pt-2 border-t border-gray-100 mt-6">
                <label className="block text-[10px] font-extrabold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>🔑</span> Reset Kata Sandi Baru
                </label>
                <input 
                  type="text" 
                  placeholder="Ketik password baru jika ingin diganti..." 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-sm font-bold text-gray-900 transition-all placeholder:font-medium placeholder:text-gray-400"
                />
                <p className="text-[9px] text-gray-400 font-medium mt-1.5">*Kosongkan kotak ini jika tidak ingin mengubah kata sandi.</p>
              </div>

              <div className="flex gap-3 pt-6 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all uppercase tracking-wider"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={isLoading}
                  className="flex-1 py-3.5 bg-[#16213E] text-white rounded-xl font-bold text-sm hover:bg-[#123023] transition-all shadow-md uppercase tracking-wider disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}