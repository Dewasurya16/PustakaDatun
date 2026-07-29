// middleware.ts — root project
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rute publik (tanpa login)
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/buku-tamu',
  '/faq',
  '/layanan',
  '/tentang',
];

// /profil tidak perlu ditambahkan — otomatis terlindungi karena tidak ada di PUBLIC_PATHS

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan semua public path (termasuk sub-path)
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  const hasAccessToken = !!request.cookies.get('sb_access_token')?.value;

  // Tidak ada session → redirect ke login
  if (!hasAccessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Jalankan di semua path kecuali asset statis & next internals
    '/((?!_next/static|_next/image|favicon.ico|icon\\.png|logo-.*\\.png|images/.*|.*\\.svg|.*\\.webp|.*\\.jpg|.*\\.jpeg|.*\\.png).*)',
  ],
};
