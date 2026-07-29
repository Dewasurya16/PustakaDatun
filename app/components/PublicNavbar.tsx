import Image from 'next/image';
import Link from 'next/link';
import { getAuthenticatedProfile } from '../../lib/auth';
import { handleLogoutAndRedirect } from '../actions';

type PublicNavItem = {
  href: string;
  label: string;
  id: 'home' | 'catalog' | 'services' | 'about' | 'guestbook' | 'faq' | 'history';
};

const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { href: '/', label: 'Beranda', id: 'home' },
  { href: '/katalog', label: 'Katalog', id: 'catalog' },
  { href: '/layanan', label: 'Layanan', id: 'services' },
  { href: '/tentang', label: 'Tentang Kami', id: 'about' },
  { href: '/buku-tamu', label: 'Buku Tamu', id: 'guestbook' },
  { href: '/faq', label: 'F.A.Q', id: 'faq' },
];

const AUTHENTICATED_NAV_ITEMS: PublicNavItem[] = [
  { href: '/', label: 'Beranda', id: 'home' },
  { href: '/katalog', label: 'Katalog', id: 'catalog' },
  { href: '/riwayat', label: 'Riwayat Peminjaman', id: 'history' },
];

type Props = {
  active?: PublicNavItem['id'];
};

export default async function PublicNavbar({ active }: Props) {
  const profile = await getAuthenticatedProfile();
  const navItems = profile ? AUTHENTICATED_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  function getHref(item: PublicNavItem) {
    if (item.id !== 'catalog' || profile) return item.href;
    return '/login?redirect=/katalog';
  }

  return (
    <header className="relative z-50 border-b border-slate-100 bg-white">
      <div className="mx-auto grid h-[76px] max-w-[1180px] grid-cols-[auto_1fr_auto] items-center gap-6 px-5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo-kejaksaan.png"
            alt="Logo Kejaksaan Republik Indonesia"
            width={40}
            height={40}
            priority
          />
          <div className="leading-tight">
            <p className="text-[14px] font-extrabold tracking-tight text-[#10234A]">
              PustakaDatun
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Kejaksaan Agung RI
            </p>
          </div>
        </Link>

        <nav className="hidden items-center justify-center gap-6 text-[11px] font-semibold text-slate-500 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={getHref(item)}
              className={
                active === item.id
                  ? 'text-[#1967D2]'
                  : 'transition-colors hover:text-[#1967D2]'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <details className="relative xl:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-lg text-[#10234A]">
              ☰
            </summary>
            <nav className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-[0_18px_45px_rgba(15,35,74,0.14)]">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={getHref(item)}
                  className={`block rounded-lg px-4 py-3 text-xs font-semibold ${
                    active === item.id
                      ? 'bg-blue-50 text-[#1967D2]'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>

          {profile?.role === 'admin' ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 min-w-[84px] items-center justify-center rounded-lg bg-[#1967D2] px-4 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(25,103,210,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1256b4]"
            >
              Dashboard
            </Link>
          ) : profile ? (
            <form action={handleLogoutAndRedirect}>
              <button
                type="submit"
                className="inline-flex h-10 min-w-[84px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 min-w-[84px] items-center justify-center rounded-lg bg-[#1967D2] px-4 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(25,103,210,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1256b4]"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
