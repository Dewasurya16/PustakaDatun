'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCat = searchParams.get('cat') || '';

  const handleFilter = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('cat', cat);
    } else {
      params.delete('cat');
    }
    params.delete('page'); // Reset pagination
    router.push(`?${params.toString()}`);
  };

  const activeStyle = "bg-[#F59E0B]/20 text-[#F59E0B] border-l-4 border-[#F59E0B] pl-3 font-bold";
  const inactiveStyle = "text-gray-400 hover:text-white hover:bg-white/5 pl-4 border-l-4 border-transparent";

  return (
    <div className="flex flex-col gap-1">
      <button 
        onClick={() => handleFilter('')} 
        className={`py-2.5 text-left text-sm transition-all duration-200 ${!currentCat ? activeStyle : inactiveStyle}`}
      >
        Semua Kategori
      </button>
      
      {categories.map(cat => (
        <button 
          key={cat} 
          onClick={() => handleFilter(cat)} 
          className={`py-2.5 text-left text-sm transition-all duration-200 ${currentCat === cat ? activeStyle : inactiveStyle}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}