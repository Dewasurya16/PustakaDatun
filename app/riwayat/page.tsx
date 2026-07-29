import { redirect } from 'next/navigation';
import { getAuthenticatedProfile } from '../../lib/auth';
import AIAssistant from '../AIAssistant';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';
import DueDateBanner from '../katalog/DueDateBanner';
import MyHistory from '../katalog/History';

export const dynamic = 'force-dynamic';

export default async function RiwayatPeminjamanPage() {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    redirect('/login?redirect=/riwayat');
  }

  return (
    <div className="min-h-screen bg-[#f7d9d7] text-[#17233c]">
      <PublicNavbar active="history" />

      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_rgba(122,75,69,0.12)]">
          <header className="border-b border-[#f0e1dd] bg-[#fffaf8] px-5 py-8 sm:px-8 lg:px-10">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#f5823f]">
              Aktivitas koleksi
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[#17233c] sm:text-4xl">
              Riwayat Peminjaman
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#68758e] sm:text-base">
              Pantau buku yang sedang dipinjam, riwayat pengembalian, serta ulasan Anda
              dalam satu halaman.
            </p>
          </header>

          <div className="space-y-6 p-4 sm:p-8 lg:p-10">
            <DueDateBanner />
            <MyHistory />
          </div>
        </section>
      </main>

      <PublicFooter />
      <AIAssistant />
    </div>
  );
}
