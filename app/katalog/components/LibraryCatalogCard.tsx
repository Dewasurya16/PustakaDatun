import Image from 'next/image';
import Link from 'next/link';
import type { CatalogBook } from '../../components/CatalogBookCard';

const COVER_PALETTES = [
  ['#12345b', '#f4f8ff', '#65b7ff'],
  ['#075546', '#f0fff9', '#e8b84a'],
  ['#40306f', '#faf7ff', '#b9a0ff'],
  ['#7b2631', '#fff7f5', '#f2b45f'],
  ['#15576a', '#f1fcff', '#65d0d8'],
  ['#49362a', '#fffaf1', '#d8aa67'],
] as const;

function getPalette(book: CatalogBook, index: number) {
  const key = `${book.title}${book.category || ''}`;
  const sum = key.split('').reduce((total, char) => total + char.charCodeAt(0), index);
  return COVER_PALETTES[Math.abs(sum) % COVER_PALETTES.length];
}

type BookCoverProps = {
  book: CatalogBook;
  index: number;
  compact?: boolean;
};

export function BookCover({ book, index, compact = false }: BookCoverProps) {
  const [background, paper, accent] = getPalette(book, index);
  const catalogNumber = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`relative isolate shrink-0 overflow-hidden rounded-[5px_14px_14px_5px] border border-black/10 shadow-[0_16px_30px_rgba(15,23,42,0.22)] transition duration-300 group-hover:-translate-y-1 ${
        compact ? 'h-[168px] w-28' : 'aspect-[2/3] w-full'
      }`}
      style={{ backgroundColor: background }}
    >
      <div className="absolute inset-y-0 left-0 w-[10%] border-r border-white/10 bg-black/20 shadow-[4px_0_10px_rgba(0,0,0,0.12)]" />
      <div className="absolute inset-y-[3%] right-0 w-[2px] rounded-l bg-white/30" />
      <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div
        className="absolute -right-[22%] -top-[8%] h-[48%] w-[70%] rounded-full border border-white/10"
        style={{ boxShadow: `0 0 0 18px ${accent}12, 0 0 0 38px ${accent}08` }}
      />

      <div className={`absolute flex items-center ${compact ? 'left-[16%] right-[8%] top-[9%] gap-1.5' : 'left-[16%] right-[9%] top-[8%] gap-2'}`}>
        <span className={`relative shrink-0 overflow-hidden rounded-full bg-white/95 shadow-sm ${compact ? 'h-5 w-5' : 'h-7 w-7'}`}>
          <Image
            src="/logo-kejaksaan.png"
            alt=""
            fill
            sizes={compact ? '20px' : '28px'}
            className="object-contain p-0.5"
          />
        </span>
        <div className="min-w-0">
          <p className={`truncate font-black uppercase tracking-[0.12em] text-white ${compact ? 'text-[5px]' : 'text-[7px]'}`}>
            PustakaDatun
          </p>
          <p className={`truncate font-semibold uppercase tracking-[0.1em] text-white/45 ${compact ? 'text-[3px]' : 'text-[5px]'}`}>
            Kejaksaan Agung RI
          </p>
        </div>
      </div>

      <div className={`absolute left-[16%] right-[9%] ${compact ? 'top-[28%]' : 'top-[27%]'}`}>
        <div className="mb-3 h-px w-full bg-white/20" />
        <p className={`line-clamp-2 font-black uppercase tracking-[0.16em] ${compact ? 'text-[5px] leading-[8px]' : 'text-[7px] leading-[11px]'}`} style={{ color: accent }}>
          {book.category || 'Pustaka Datun'}
        </p>
      </div>

      <div className={`absolute left-[16%] right-[10%] ${compact ? 'bottom-[18%]' : 'bottom-[17%]'}`}>
        <h3
          className={`line-clamp-4 font-black tracking-[-0.025em] ${compact ? 'text-[10px] leading-[1.08]' : 'text-[13px] leading-[1.12] sm:text-sm'}`}
          style={{ color: paper }}
        >
          {book.title}
        </h3>
        <p className={`truncate font-semibold text-white/50 ${compact ? 'mt-1.5 text-[5px]' : 'mt-2.5 text-[7px]'}`}>
          {book.author || 'Kejaksaan Agung RI'}
        </p>
      </div>

      <div className={`absolute bottom-[6%] left-[16%] right-[9%] flex items-center justify-between border-t border-white/15 pt-1.5 ${compact ? 'text-[4px]' : 'text-[6px]'}`}>
        <span className="font-bold uppercase tracking-[0.16em] text-white/40">Koleksi Internal</span>
        <span className="font-black" style={{ color: accent }}>{catalogNumber}</span>
      </div>
    </div>
  );
}

type LibraryCatalogCardProps = {
  book: CatalogBook;
  index: number;
};

export default function LibraryCatalogCard({ book, index }: LibraryCatalogCardProps) {
  const rating = Number('rating' in book ? book.rating : 0) || 0;

  return (
    <article className="group grid min-h-[224px] grid-cols-[112px_1fr] gap-5 rounded-[22px] border border-[#eee3df] bg-white p-4 shadow-[0_8px_26px_rgba(65,44,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-[0_18px_38px_rgba(65,44,42,0.12)] sm:p-5">
      <Link href={`/buku/${book.id}`} aria-label={`Buka ${book.title}`}>
        <BookCover book={book} index={index} compact />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/buku/${book.id}`}>
              <h2 className="line-clamp-2 text-base font-black leading-6 text-[#17233c] transition hover:text-[#e97428]">
                {book.title}
              </h2>
            </Link>
            <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {book.author || book.publisher || 'Pustaka Datun'}
            </p>
          </div>
          <span className="shrink-0 text-[9px] font-bold text-amber-500">
            ★ {rating > 0 ? rating.toFixed(1) : '—'}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-[11px] leading-[1.7] text-slate-500">
          {book.ringkasan || 'Koleksi literatur dan referensi hukum Pustaka Datun Kejaksaan Agung Republik Indonesia.'}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className={`text-[10px] font-bold ${book.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {book.stock > 0 ? `${book.stock} tersedia` : 'Stok habis'}
            </p>
            <div className="mt-1 h-0.5 w-14 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-[#17396f]" />
            </div>
          </div>
          <Link
            href={`/buku/${book.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#f97316] px-5 py-2.5 text-[10px] font-black text-white shadow-[0_7px_16px_rgba(249,115,22,0.24)] transition hover:-translate-y-0.5 hover:bg-[#ea580c]"
          >
            Baca
          </Link>
        </div>
      </div>
    </article>
  );
}
