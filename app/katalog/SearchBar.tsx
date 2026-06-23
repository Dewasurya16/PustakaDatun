'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function SearchBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isFocused,  setIsFocused]  = useState(false);
  // Gunakan ref agar debounce tidak bergantung pada stale closure
  const latestTerm = useRef(searchTerm);

  // Sync saat URL berubah dari luar (misal: back/forward browser)
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== latestTerm.current) {
      setSearchTerm(urlQ);
      latestTerm.current = urlQ;
    }
  }, [searchParams]);

  // Debounce 500ms — lebih panjang dari sebelumnya (300ms) untuk kurangi lag
  useEffect(() => {
    latestTerm.current = searchTerm;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      } else {
        params.delete('q');
      }
      // Reset ke halaman 1 saat cari
      params.delete('page');
      // Gunakan replace agar tidak menumpuk history browser
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
    // searchParams sengaja tidak dimasukkan deps agar tidak looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, pathname, router]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative w-full flex-1 group">
      <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-transform ${isFocused ? 'scale-110' : ''}`}>
        <span className="text-blue-400 text-lg">🔍</span>
      </div>

      <input
        type="text"
        placeholder="Cari referensi, aturan, penulis, dsb..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full pl-12 pr-10 h-14 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-blue-100/50 rounded-2xl focus:bg-white/20 focus:ring-2 focus:ring-blue-400 outline-none transition-all font-bold text-sm shadow-inner"
      />

      {/* Tombol clear */}
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors text-xl leading-none"
          aria-label="Hapus pencarian"
        >
          ×
        </button>
      )}
    </div>
  );
}