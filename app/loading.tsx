import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center">

      {/* Logo with pulse ring */}
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping scale-150" />
        <div className="absolute inset-0 rounded-full bg-blue-400/10 animate-ping scale-125" style={{ animationDelay: '0.3s' }} />

        <div className="relative w-24 h-24 bg-white rounded-full shadow-[0_8px_32px_rgba(27,67,50,0.18)] border border-slate-100 flex items-center justify-center overflow-hidden">
          <div className="relative w-16 h-16">
            <Image
              src="/images/logo-kejaksaan.png"
              alt="Memuat..."
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Text */}
      <p className="text-[13px] font-black text-[#16213E] uppercase tracking-[0.2em] mb-4">
        Memuat Data...
      </p>

      {/* Progress bar */}
      <div className="w-40 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#16213E] via-blue-400 to-[#16213E] rounded-full animate-[loading-bar_1.8s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
