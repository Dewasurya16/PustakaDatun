'use client';

import { useCallback, useEffect, useState } from 'react';

type DownloadLog = {
  id: string;
  book_id: string | null;
  book_title: string;
  user_email: string;
  pdf_url: string;
  downloaded_at: string;
};

const REFRESH_INTERVAL_MS = 15_000;

export default function PdfDownloadLog() {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/pdf-downloads', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Log gagal dimuat.');

      setLogs(result.data || []);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Log gagal dimuat.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => void fetchLogs(), 0);
    const intervalId = window.setInterval(() => void fetchLogs(), REFRESH_INTERVAL_MS);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [fetchLogs]);

  function formatTime(value: string) {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-950 to-[#16213E] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-base">
            📖
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Log Akses E-Book</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/60">
              Diperbarui otomatis · {logs.length} entri
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchLogs()}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-white hover:bg-white/20"
        >
          Muat Ulang
        </button>
      </div>

      {errorMessage ? (
        <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-bold text-rose-700">Log belum dapat dimuat</p>
          <p className="mt-1 text-[11px] leading-5 text-rose-600">{errorMessage}</p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3 p-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : logs.length === 0 && !errorMessage ? (
          <div className="py-16 text-center">
            <div className="mb-3 text-4xl">📭</div>
            <p className="text-sm font-semibold text-slate-400">
              Belum ada akses e-book tercatat.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-3 text-left">Waktu</th>
                <th className="px-5 py-3 text-left">Pengguna</th>
                <th className="px-5 py-3 text-left">Judul Buku</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/50">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-500">
                    {formatTime(log.downloaded_at)}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-700">
                    {log.user_email}
                  </td>
                  <td className="max-w-[260px] px-5 py-3 font-semibold text-slate-700">
                    <span className="line-clamp-2">{log.book_title}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {log.book_id ? (
                      <a
                        href={`/api/books/${log.book_id}/ebook`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Buka
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
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
