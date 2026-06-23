'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardCharts({ loans, books }: { loans: any[], books: any[] }) {
  // ── 1. Proses Data untuk Line/Area Chart (Tren Peminjaman 6 Bulan Terakhir) ──
  const trendData = useMemo(() => {
    if (!loans) return [];
    
    // Group by month
    const months: Record<string, { name: string, pinjam: number, kembali: number, sortKey: string }> = {};
    
    // Create last 6 months scaffold
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[sortKey] = { name: monthName, pinjam: 0, kembali: 0, sortKey };
    }

    loans.forEach(loan => {
      const d = new Date(loan.created_at);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[sortKey]) {
        months[sortKey].pinjam += 1;
        if (loan.status?.toUpperCase() === 'DIKEMBALIKAN' || loan.status?.toUpperCase() === 'SUDAH DIULAS') {
          months[sortKey].kembali += 1;
        }
      }
    });

    return Object.values(months).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [loans]);

  // ── 2. Proses Data untuk Donut Chart (Distribusi Kategori) ──
  const { categoryData, COLORS } = useMemo(() => {
    if (!books) return { categoryData: [], COLORS: [] };
    const catMap: Record<string, number> = {};
    let total = 0;
    
    books.forEach(b => {
      const c = b.category || 'Lainnya';
      catMap[c] = (catMap[c] || 0) + 1;
      total += 1;
    });

    const data = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5
      .map(([name, value]) => ({ name, value }));
      
    // Hitung sisanya sebagai "Lainnya"
    const top5Count = data.reduce((sum, item) => sum + item.value, 0);
    if (total > top5Count) {
        data.push({ name: 'Lainnya', value: total - top5Count });
    }

    const palette = ['#16213E', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];
    return { categoryData: data, COLORS: palette };
  }, [books]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* ── CHART 1: Tren Peminjaman ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-base">📈</span>
            Tren Sirkulasi (6 Bulan)
          </h3>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPinjam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16213E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#16213E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorKembali" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="pinjam" name="Dipinjam" stroke="#16213E" strokeWidth={3} fillOpacity={1} fill="url(#colorPinjam)" />
              <Area type="monotone" dataKey="kembali" name="Dikembalikan" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorKembali)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHART 2: Distribusi Kategori ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
        <h3 className="font-black text-slate-800 flex items-center gap-2 mb-2 text-sm">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-base">📊</span>
          Komposisi Katalog Buku
        </h3>
        
        <div className="h-[250px] w-full flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Label Tengah Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
            <span className="text-2xl font-black text-[#16213E]">{books?.length || 0}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Buku</span>
          </div>
        </div>
      </div>

    </div>
  );
}
