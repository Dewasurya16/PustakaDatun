'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DownloadLog {
  id: string;
  book_title: string;
  user_email: string;
  pdf_url: string;
  downloaded_at: string;
}

export default function PdfDownloadLog() {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('pdf_downloads')
      .select('*')
      .order('downloaded_at', { ascending: false })
      .limit(50);
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Realtime subscription — tampil notif saat ada download baru
    const channel = supabase
      .channel('pdf-downloads-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pdf_downloads',
      }, (payload) => {
        setLogs(prev => [payload.new as DownloadLog, ...prev]);
        setNewCount(c => c + 1);
        // Reset badge setelah 5 detik
        setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 5000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-950 to-[#16213E]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-black text-sm">Log Download PDF</h3>
            <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-widest">Realtime · {logs.length} entri</p>
          </div>
        </div>
        {newCount > 0 && (
          <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            +{newCount} Baru
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400 text-sm font-semibold">Belum ada download PDF tercatat.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[9px] font-black border-b border-slate-100">
                <th className="px-5 py-3 text-left">Waktu</th>
                <th className="px-5 py-3 text-left">Pengguna</th>
                <th className="px-5 py-3 text-left">Judul Buku</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={`transition-colors hover:bg-blue-50/50 ${i === 0 && newCount > 0 ? 'bg-emerald-50 animate-pulse-once' : ''}`}
                >
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap font-medium">
                    {formatTime(log.downloaded_at)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                        {log.user_email?.[0] || '?'}
                      </div>
                      <span className="text-slate-700 font-semibold truncate max-w-[140px]">{log.user_email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-semibold max-w-[200px]">
                    <span className="line-clamp-2 leading-snug">{log.book_title}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <a
                      href={log.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-black text-[9px] uppercase tracking-wider"
                    >
                      Buka
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
