import Image from 'next/image';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-[#0B1832] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.3fr_0.7fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo-kejaksaan.png" alt="" width={42} height={42} />
            <p className="font-extrabold">PustakaDatun</p>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-6 text-slate-400">
            Pusat literatur digital Jaksa Agung Muda Bidang Perdata dan Tata
            Usaha Negara.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold">Navigasi</p>
          <div className="mt-4 flex flex-col gap-3 text-[11px] text-slate-400">
            <Link href="/layanan">Layanan</Link>
            <Link href="/tentang">Tentang Kami</Link>
            <Link href="/faq">F.A.Q</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold">Kontak</p>
          <p className="mt-4 text-[11px] leading-6 text-slate-400">
            Jl. Sultan Hasanuddin No. 1, Kebayoran Baru, Jakarta Selatan
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-5 text-[10px] text-slate-500">
        © {new Date().getFullYear()} Pustaka Datun Kejaksaan Agung Republik
        Indonesia.
      </div>
    </footer>
  );
}
