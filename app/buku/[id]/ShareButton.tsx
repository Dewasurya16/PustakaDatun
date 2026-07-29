'use client';
import { useState } from 'react';

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buku: ${title}`,
          text: `Cek buku "${title}" di Pustaka Datun Kejaksaan Agung!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.log('Copy failed', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="group flex items-center justify-center rounded-xl border border-[#eadfdb] bg-white p-3 text-slate-500 transition-all hover:border-orange-200 hover:bg-[#fff8f5] hover:text-[#f97316]"
      title="Bagikan buku ini"
    >
      {copied ? (
        <span className="text-[10px] font-black uppercase text-blue-600">Copied!</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      )}
    </button>
  );
}
