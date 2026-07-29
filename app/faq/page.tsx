import Link from 'next/link';
import AIAssistant from '../AIAssistant';
import PublicFooter from '../components/PublicFooter';
import PublicNavbar from '../components/PublicNavbar';

export const dynamic = 'force-dynamic';

const FAQS = [
  {
    question: 'Apa itu Pustaka Datun Kejaksaan Agung?',
    answer:
      'Pustaka Datun adalah platform perpustakaan digital resmi yang menyediakan referensi, literatur, dan arsip bidang Perdata dan Tata Usaha Negara.',
  },
  {
    question: 'Siapa yang dapat mengakses layanan Pustaka Datun?',
    answer:
      'Katalog dan dokumen internal ditujukan bagi pegawai dengan akun yang telah disetujui. Informasi layanan umum dan Buku Tamu tetap dapat diakses publik.',
  },
  {
    question: 'Bagaimana cara meminjam buku?',
    answer:
      'Masuk menggunakan akun pegawai, cari buku melalui Katalog, pilih Detail & Pinjam, kemudian lengkapi data peminjaman.',
  },
  {
    question: 'Apakah layanan Pustaka Datun dipungut biaya?',
    answer:
      'Tidak. Seluruh layanan perpustakaan diberikan sebagai fasilitas untuk mendukung peningkatan pengetahuan dan pelaksanaan tugas.',
  },
  {
    question: 'Berapa lama batas waktu peminjaman buku?',
    answer:
      'Batas waktu standar adalah tujuh hari kerja. Tenggat setiap peminjaman dapat dilihat pada Katalog dan halaman profil pengguna.',
  },
  {
    question: 'Apakah tersedia E-Book atau PDF?',
    answer:
      'Ya. Dokumen digital tertentu tersedia melalui pembaca privat dan hanya dapat dibuka oleh akun terverifikasi.',
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC] text-[#10234A]">
      <PublicNavbar active="faq" />
      <main className="flex-1">
        <section className="px-5 py-16 text-center sm:px-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1967D2]">
            Pusat Bantuan
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pertanyaan yang sering diajukan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
            Informasi mengenai akun, akses dokumen, peminjaman, dan penggunaan
            layanan Pustaka Datun.
          </p>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-4xl space-y-4">
            {FAQS.map((faq, index) => (
              <article
                key={faq.question}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_12px_32px_rgba(15,35,74,0.06)]"
              >
                <div className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-[#1967D2]">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold">{faq.question}</h2>
                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-[#10234A] p-8 text-center text-white">
            <h2 className="text-xl font-extrabold">Masih memiliki pertanyaan?</h2>
            <p className="mt-2 text-xs text-slate-300">
              Tinggalkan pesan melalui Buku Tamu atau hubungi administrator.
            </p>
            <Link
              href="/buku-tamu"
              className="mt-5 inline-flex rounded-lg bg-[#F59E0B] px-6 py-3 text-[11px] font-bold"
            >
              Buka Buku Tamu
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
      <AIAssistant />
    </div>
  );
}
