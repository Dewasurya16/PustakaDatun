'use client';
import { useState, useEffect } from 'react';

type DueLoan = {
  due_date: string;
  status?: string;
  books?: { title?: string } | null;
};

export default function DueDateBanner() {
  const [loans, setLoans] = useState<DueLoan[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [soonCount, setSoonCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const check = async () => {
      const response = await fetch('/api/my-loans', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!response.ok) return;
      const result = await response.json();
      const data = ((result.data || []) as DueLoan[]).filter(
        (loan) => loan.status === 'DIPINJAM',
      );

      if (!data) return;
      const now = new Date();
      const threeDays = new Date(now.getTime() + 3 * 86400000);

      let overdue = 0;
      let soon = 0;
      data.forEach(l => {
        const due = new Date(l.due_date);
        if (due < now) overdue++;
        else if (due <= threeDays) soon++;
      });
      setLoans(data);
      setOverdueCount(overdue);
      setSoonCount(soon);
    };
    check();
  }, []);

  if (dismissed || (overdueCount === 0 && soonCount === 0)) return null;

  const isOverdue = overdueCount > 0;
  const targetLoans = loans.filter(l => {
    const due = new Date(l.due_date);
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 86400000);
    return isOverdue ? due < now : (due >= now && due <= threeDays);
  });

  return (
    <div className="space-y-2">
      <div className={`relative flex items-center justify-between gap-3 px-4 sm:px-6 py-3 rounded-2xl border text-sm font-bold animate-in slide-in-from-top-2 duration-500 shadow-sm ${
        isOverdue
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setShowDetails(!showDetails)}>
          <span className="text-xl animate-bounce">{isOverdue ? '🚨' : '⏰'}</span>
          <div>
            {isOverdue ? (
              <p>
                <strong>{overdueCount} buku</strong> Anda sudah <strong>melewati tanggal kembali!</strong>{' '}
                <span className="underline decoration-dotted ml-1 text-[11px] opacity-70">Lihat Detail ↓</span>
              </p>
            ) : (
              <p>
                <strong>{soonCount} buku</strong> Anda akan jatuh tempo dalam{' '}
                <strong>3 hari.</strong> <span className="underline decoration-dotted ml-1 text-[11px] opacity-70">Lihat Detail ↓</span>
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full font-black text-xs transition-colors ${
            isOverdue ? 'hover:bg-rose-200 text-rose-500' : 'hover:bg-yellow-200 text-yellow-500'
          }`}
        >
          ✕
        </button>
      </div>

      {showDetails && (
        <div className={`p-4 rounded-2xl border animate-in slide-in-from-top-1 duration-200 ${
          isOverdue ? 'bg-white border-rose-100' : 'bg-white border-yellow-100'
        }`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Daftar Buku Terkait:</p>
          <div className="space-y-2">
            {targetLoans.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[12px] font-bold text-slate-700 line-clamp-1 italic">"{l.books?.title}"</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {new Date(l.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
