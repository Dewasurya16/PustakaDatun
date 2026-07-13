import type { ReactNode } from 'react';
import Link from 'next/link';

export type CatalogBook = {
  id: string;
  title: string;
  author?: string | null;
  publisher?: string | null;
  category?: string | null;
  nomor_buku?: string | null;
  stock: number;
  rak?: string | null;
  pdf_url?: string | null;
  ringkasan?: string | null;
};

type CatalogBookCardProps = {
  book: CatalogBook;
  index?: number;
  isAdmin?: boolean;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  adminActions?: ReactNode;
};

/* ── Cover color palettes ─────────────────────────────── */

const COVER_PALETTES = [
  { bg: '#d7e5ed', ink: '#16324a', accent: '#2bb7a8' },
  { bg: '#efe4d6', ink: '#3d2a1d', accent: '#c46f45' },
  { bg: '#e6e1ee', ink: '#241b3a', accent: '#7c5fb8' },
  { bg: '#e7eadc', ink: '#293421', accent: '#8fa35b' },
  { bg: '#f0d9df', ink: '#431924', accent: '#c94f71' },
  { bg: '#dce6dd', ink: '#183629', accent: '#4b9775' },
] as const;

function getCoverPalette(book: CatalogBook, index = 0) {
  const key = `${book.category ?? ''}${book.title ?? ''}`;
  const sum = key
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), index);
  return COVER_PALETTES[Math.abs(sum) % COVER_PALETTES.length];
}

/* ── Stock helpers ────────────────────────────────────── */

type StockStatus = 'tersedia' | 'terbatas' | 'habis';

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'habis';
  if (stock <= 3) return 'terbatas';
  return 'tersedia';
}

const STOCK_BADGE_STYLES: Record<StockStatus, string> = {
  tersedia:
    'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  terbatas:
    'bg-amber-50 text-amber-700 ring-amber-200/60',
  habis:
    'bg-rose-50 text-rose-600 ring-rose-200/60',
};

const STOCK_LABELS: Record<StockStatus, string> = {
  tersedia: 'Tersedia',
  terbatas: 'Terbatas',
  habis: 'Habis',
};

/* ── Cover sizing ─────────────────────────────────────── */

const ADMIN_COVER_CLASS = 'h-[180px]';
const PUBLIC_COVER_CLASS = 'aspect-[3/4]';

/* ── Component ────────────────────────────────────────── */

export default function CatalogBookCard({
  book,
  index = 0,
  isAdmin = false,
  primaryAction,
  secondaryAction,
  adminActions,
}: CatalogBookCardProps) {
  const cover = getCoverPalette(book, index);
  const stockStatus = getStockStatus(book.stock ?? 0);
  const coverSizeClass = isAdmin ? ADMIN_COVER_CLASS : PUBLIC_COVER_CLASS;

  const coverTitleClass = isAdmin
    ? 'line-clamp-3 text-[20px]'
    : 'line-clamp-4 text-[clamp(0.95rem,1.6vw,1.35rem)]';

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-xl bg-white ring-1 ring-neutral-100 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.10)] hover:ring-neutral-200">
      {/* ── Book cover ── */}
      <Link href={`/buku/${book.id}`} className="block flex-shrink-0">
        <div
          className={`relative ${coverSizeClass} overflow-hidden rounded-t-xl border-b border-black/5 transition duration-300 group-hover:-translate-y-0.5`}
          style={{ backgroundColor: cover.bg }}
        >
          {/* Spine */}
          <div className="absolute inset-y-0 left-0 w-[10%] border-r border-black/[0.08] bg-black/[0.06]" />

          {/* Top rule */}
          <div className="absolute left-[14%] right-5 top-5 h-px bg-black/10" />

          {/* Stock badge */}
          <div
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${STOCK_BADGE_STYLES[stockStatus]}`}
          >
            {STOCK_LABELS[stockStatus]}
          </div>

          {/* Category + Title on cover */}
          <div className="absolute bottom-5 left-[14%] right-6">
            <p
              className="mb-2 line-clamp-1 text-[10px] font-bold uppercase leading-4 tracking-wide"
              style={{ color: cover.accent }}
            >
              {book.category ?? 'Pustaka Datun'}
            </p>
            <h3
              className={`${coverTitleClass} break-normal font-black leading-[1.1] [overflow-wrap:normal]`}
              style={{ color: cover.ink }}
            >
              {book.title}
            </h3>
          </div>

          {/* Decorative accent */}
          <div
            className="absolute -bottom-3 right-0 h-14 w-24 skew-x-[-18deg] opacity-[0.15]"
            style={{ backgroundColor: cover.accent }}
          />
        </div>
      </Link>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-1 px-3 pb-4 pt-3.5">
        {/* Title */}
        <Link href={`/buku/${book.id}`} className="group/title">
          <h3
            className="line-clamp-2 min-h-[2.75rem] text-[14px] font-semibold leading-[1.4] text-neutral-900 transition-colors group-hover/title:text-[#27b8a7]"
            title={book.title}
          >
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="truncate text-[12px] leading-5 text-neutral-400">
          {book.author ?? book.publisher ?? 'Pustaka Datun'}
        </p>

        {/* Stock + Rak row */}
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold">
          <span
            className={
              stockStatus === 'habis'
                ? 'text-rose-600'
                : 'text-neutral-800'
            }
          >
            {stockStatus === 'habis'
              ? 'Stok habis'
              : `${book.stock} tersedia`}
          </span>
          {book.rak ? (
            <span className="truncate text-neutral-400">
              Rak {book.rak}
            </span>
          ) : null}
        </div>

        {/* ── Action buttons ── */}
        {(primaryAction || secondaryAction) && (
          <div className="mt-auto grid h-[44px] grid-cols-2 gap-2 pt-3">
            <div className="flex min-w-0 items-stretch">{primaryAction}</div>
            <div className="flex min-w-0 items-stretch">
              {secondaryAction}
            </div>
          </div>
        )}

        {isAdmin && adminActions && (
          <div className="mt-2 grid h-[44px] grid-cols-2 gap-2 border-t border-neutral-100 pt-2">
            {adminActions}
          </div>
        )}
      </div>
    </article>
  );
}
