'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_PROMPTS = [
  { icon: '⌕', label: 'Cari Buku', text: 'Tolong carikan rekomendasi buku kategori Peraturan yang ada di perpustakaan.' },
  { icon: '＋', label: 'Pinjam Buku', text: 'Saya ingin meminjam buku. Tolong bantu saya.' },
  { icon: 'i', label: 'Info Pegawai', text: 'Saya ingin mencari data pegawai di kantor ini.' },
  { icon: '⏱', label: 'Aturan Pinjam', text: 'Berapa lama batas waktu peminjaman buku untuk pegawai, dan apa sanksinya jika terlambat?' },
];

const WELCOME_MESSAGE = {
  role: 'ai',
  text: 'Halo! Saya **Lexi**, asisten PustakaDatun.\n\nSaya dapat membantu mencari koleksi, menjelaskan aturan, dan memandu proses peminjaman.',
};

export default function AIAssistant() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([WELCOME_MESSAGE]);
  const [input,    setInput]    = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isOpen]);

  const generateSmartResponse = async (userText: string) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(1).slice(-10),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, {
          role: 'ai',
          text: 'Aduh, otak AI saya sedang kepanasan nih! 🤯 Layanan AI mendeteksi terlalu banyak pesan dalam 1 menit terakhir. Mohon beri saya waktu istirahat sekitar 1 menit, lalu tanyakan lagi ya, Bos!',
        }]);
        return;
      }

      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);

      // Segarkan halaman jika peminjaman berhasil agar tabel sirkulasi langsung update
      if (data.reply.includes('Peminjaman Berhasil Dicatat')) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        role: 'ai',
        text: 'Maaf, koneksi internet sepertinya terputus atau server sedang down. Coba refresh halaman ya. 🔄',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }]);
    setInput('');
    generateSmartResponse(text.trim());
  };

  const clearChat = () => {
    setMessages([{ role: 'ai', text: 'Sesi obrolan telah dibersihkan. Ada hal lain yang ingin Anda ketahui? ✨' }]);
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-black text-blue-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const isBookingSuccess = (text: string) =>
    text.includes('Peminjaman Berhasil Dicatat') || text.includes('✅');

  return (
    <>
      {/* ── JENDELA CHAT ── */}
      {isOpen && (
        <>
          {/* Overlay gelap di mobile */}
          <div
            className="fixed inset-0 z-[99998] bg-slate-900/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className={`
            fixed z-[99999] flex flex-col
            bg-white/95 backdrop-blur-2xl border border-slate-200/80
            shadow-[0_22px_65px_rgba(28,55,90,0.2)]
            overflow-hidden
            animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 origin-bottom-right

            /* Mobile: fullscreen dari bawah kecuali sedikit ruang atas */
            inset-x-0 bottom-0 h-[82vh] rounded-t-[1.75rem] rounded-b-none
            
            /* Desktop: floating di sudut kanan bawah */
            md:inset-auto md:bottom-6 md:right-6
            md:h-[520px] md:w-[360px]
            md:rounded-[24px] lg:w-[380px]
          `}>

            {/* HEADER */}
            <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-gradient-to-r from-[#10234a] to-[#17396f] px-4 py-3.5">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
              {/* Drag handle — mobile only */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full md:hidden" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-lg">
                  <span className="text-lg">🤖</span>
                  <span className="absolute -bottom-1 -right-1 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-blue-400 border-2 border-slate-800 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[13px] font-black leading-tight tracking-tight text-white">Lexi</h3>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-blue-200">Asisten PustakaDatun</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={clearChat} title="Bersihkan obrolan" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs text-white/80 transition-colors hover:bg-white/20">↻</button>
                <button onClick={() => setIsOpen(false)} aria-label="Tutup chatbot" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm text-white transition-colors hover:bg-rose-500">×</button>
              </div>
            </div>

            {/* AREA PESAN */}
            <div className="hide-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#f6f9fc] p-3.5" style={{ WebkitOverflowScrolling: 'touch' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[12px]">🤖</div>
                  )}
                  <div className="flex max-w-[88%] flex-col gap-1">
                    <div className={`p-3 text-[12px] shadow-sm leading-5 ${
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-tr-sm bg-[#17396f] font-medium text-white'
                        : isBookingSuccess(msg.text)
                          ? 'whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-blue-200 bg-blue-50 text-slate-700'
                          : 'whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-700'
                    }`}>
                      {renderFormattedText(msg.text)}
                    </div>

                    {isBookingSuccess(msg.text) && (
                      <div className="flex items-center gap-1.5 ml-1 mt-0.5">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-widest">
                          ✓ Tercatat di Database
                        </span>
                      </div>
                    )}

                    {idx === 0 && messages.length === 1 && (
                      <div className="mt-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                        <p className="col-span-2 mb-0.5 ml-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Akses cepat</p>
                        {QUICK_PROMPTS.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(prompt.text)}
                            disabled={isTyping}
                            className="group flex min-h-12 items-center gap-2 rounded-xl border border-blue-100 bg-white p-2.5 text-left shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-700 transition group-hover:bg-white">{prompt.icon}</span>
                            <span className="text-[10px] font-extrabold leading-4 text-slate-700 group-hover:text-blue-800">{prompt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-end">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[12px] sm:text-[14px] shadow-sm mr-2 shrink-0 border border-slate-300/50">🤖</div>
                  <div className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="shrink-0 border-t border-slate-100 bg-white p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 relative"
              >
                <input
                  type="text"
                  placeholder={isTyping ? 'Lexi sedang mengetik...' : 'Ketik pertanyaan di sini...'}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 text-[12px] font-semibold text-slate-800 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#17396f] text-white shadow-sm transition-all hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                  </svg>
                </button>
              </form>
              <p className="mt-2 text-center text-[8px] font-bold text-slate-400">
                Periksa kembali informasi penting.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── FAB BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-[90px] right-4 z-[99999] flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-[0_10px_32px_rgba(23,57,111,0.3)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 sm:right-6 md:bottom-6 ${
          isOpen
            ? 'pointer-events-none scale-75 border-transparent opacity-0'
            : 'bg-gradient-to-tr from-blue-500 to-[#16213E] border-blue-400'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {!isOpen && (
          <div className="relative">
            <span className="text-2xl text-white">🤖</span>
            <span className="absolute -top-1 -right-2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-rose-500 border-2 border-[#16213E] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-rose-500 border-2 border-[#16213E] rounded-full" />
          </div>
        )}
      </button>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
