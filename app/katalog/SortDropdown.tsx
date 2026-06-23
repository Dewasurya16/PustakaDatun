'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'terbaru';

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative h-14 w-[140px] flex-shrink-0 group">
      <select
        value={currentSort}
        onChange={handleSort}
        className="w-full h-full px-4 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold text-[10px] uppercase tracking-widest cursor-pointer appearance-none transition-all shadow-inner"
      >
        <option value="terbaru" className="text-slate-800 font-bold">✨ Terbaru</option>
        <option value="abjad" className="text-slate-800 font-bold">🔤 Abjad (A-Z)</option>
        <option value="stok" className="text-slate-800 font-bold">📚 Stok Terbanyak</option>
      </select>
      {/* Ikon panah khusus karena appearance-none */}
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <span className="text-white/50 text-xs group-hover:text-white transition-colors">▼</span>
      </div>
    </div>
  );
}