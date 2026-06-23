# 📚 E-Perpustakaan KEJAKSAAN AGUNG REPUBLIK INDONESIA

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-blue?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)

Aplikasi Manajemen Perpustakaan Digital modern yang dirancang khusus untuk internal **KEJAKSAAN AGUNG REPUBLIK INDONESIA**. Sistem ini mengintegrasikan kecerdasan buatan (AI) untuk mempermudah pelayanan sirkulasi buku bagi para pegawai.

---

## 🌟 Fitur Utama

### 🤖 1. Lexi - AI Librarian Assistant
Fitur unggulan yang memungkinkan pegawai melakukan **booking buku melalui chat**. Lexi dapat:
- Mencari judul buku secara cerdas.
- Memverifikasi data pegawai secara otomatis.
- Melakukan transaksi peminjaman langsung ke database.
- Memberikan informasi tenggat waktu pengembalian.

### 📋 2. Buku Tamu Digital & Export PDF
Sistem pencatatan kunjungan harian yang dilengkapi dengan fitur:
- Formulir kunjungan untuk tamu dan pegawai.
- **Export Laporan PDF** secara instan dengan format resmi untuk pelaporan pimpinan.

### 📊 3. Dashboard Admin & Sirkulasi
- Manajemen data buku (stok, kategori, lokasi rak).
- Pemantauan status peminjaman (Dipinjam/Dikembalikan).
- Manajemen data pegawai internal.

---

## 🛠️ Arsitektur Teknologi

- **Frontend:** Next.js 15 (App Router) & Tailwind CSS.
- **Backend as a Service:** Supabase (PostgreSQL & Auth).
- **AI Core:** Google Gemini AI SDK (Gemini 1.5/2.0 Flash).
- **PDF Engine:** jsPDF & jsPDF-AutoTable.
- **State Management:** React Hooks (useState, useEffect).

---

## 🚀 Cara Instalasi Lokal

1. **Clone Repositori**
   ```bash
   git clone [https://github.com/username/perpustakaan-kantor.git](https://github.com/username/perpustakaan-kantor.git)
   cd perpustakaan-kantor
   Install Dependensi
    Bash

    npm install

    Pengaturan Environment Variable
    Buat file .env.local dan isi dengan kredensial berikut:
    Code snippet

    NEXT_PUBLIC_SUPABASE_URL=isi_url_supabase_anda
    NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_anda
    GEMINI_API_KEY=isi_api_key_gemini_anda

    Menjalankan Aplikasi
    Bash

    npm run dev

    Akses di http://localhost:3000

📂 Struktur Database Utama

Aplikasi ini berjalan di atas beberapa tabel Supabase berikut:

    books: Data koleksi buku, lokasi rak, dan stok.

    Data Pegawai: Database master pegawai internal.

    loans: Data transaksi peminjaman aktif.

    buku_tamu: Log data kunjungan harian.

    booking_ai: Log khusus untuk transaksi yang diproses melalui asisten AI.

⚖️ Hak Cipta & Lisensi

Dikembangkan oleh Dewa Sinar Surya, S.Kom Pranata Komputer KEJAKSAAN AGUNG REPUBLIK INDONESIA. Penggunaan kode ini ditujukan untuk lingkungan internal Kejaksaan Republik Indonesia.

Dibuat dengan ❤️ untuk kemajuan IT Kejaksaan RI
