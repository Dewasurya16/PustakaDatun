'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { useGlobalLoading } from '../components/GlobalLoadingProvider';

export default function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { startAction } = useGlobalLoading();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    await startAction(async () => {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
      } else {
        setSuccess(true);
        setPassword('');
        setConfirm('');
      }
    }, "Mengupdate Password...");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
      >
        🔒 Ubah Password
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsOpen(false); setSuccess(false); }} />
          
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-7">
            <h3 className="text-xl font-black text-slate-800 mb-2">Ubah Kata Sandi</h3>
            <p className="text-[11px] text-slate-400 font-medium mb-6 uppercase tracking-widest">Keamanan Akun Pegawai</p>

            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">✓</div>
                <p className="text-sm font-bold text-slate-700 mb-6">Password berhasil diperbarui!</p>
                <button
                  onClick={() => { setIsOpen(false); setSuccess(false); }}
                  className="w-full py-3 bg-[#16213E] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-bold">
                    ⚠️ {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#16213E] transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Konfirmasi</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#16213E] transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#16213E] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
