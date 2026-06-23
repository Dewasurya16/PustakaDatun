import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value || 'AI_Guest';
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({
        reply: 'Sistem mendeteksi API Key kosong. Cek file .env.local dan restart server.',
      });
    }

    const modelsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const modelsData = await modelsRes.json();

    if (!modelsRes.ok) {
      return NextResponse.json(
        { reply: `Gagal cek model Google: ${modelsData.error?.message}` },
        { status: 500 }
      );
    }

    const availableModels = modelsData.models.filter(
      (m: any) =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        m.name.includes('gemini')
    );

    if (availableModels.length === 0) {
      return NextResponse.json(
        { reply: 'Google belum membuka akses model Gemini untuk akun ini.' },
        { status: 500 }
      );
    }

    const selectedModel =
      availableModels.find((m: any) => m.name === 'models/gemini-2.5-flash') ||
      availableModels.find((m: any) => m.name === 'models/gemini-1.5-flash') ||
      availableModels[0];

    const { message, history = [] } = await req.json();

    // ── 1. TARIK DATA BUKU ──────────────────────────────────────────────
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, category, stock, rak, nomor_buku, ringkasan');

    if (booksError) console.error('Error fetching books:', booksError);

    // MENGGANTI 'Kategori' MENJADI 'Klasifikasi' DAN MENAMBAHKAN 'ISBN' & 'RINGKASAN'
    const catalogContext =
      books && books.length > 0
        ? books
            .map(
              (b) =>
                `- ID: ${b.id} | Judul: "${b.title}" | Penulis: ${b.author || 'Anonim'} | ISBN: ${b.nomor_buku || 'Tidak Ada'} | Klasifikasi: ${b.category || 'Umum'} | Rak: ${b.rak || 'TBA'} | Sisa Stok: ${b.stock}\n  Ringkasan Sinopsis: ${b.ringkasan ? b.ringkasan.replace(/\n/g, ' ') : 'Belum ada ringkasan'}`
            )
            .join('\n')
        : 'Saat ini belum ada buku di database.';

    // ── 2. TARIK DATA PEGAWAI (kolom spesifik saja — keamanan data) ────
    const { data: staffs, error: staffsError } = await supabase
      .from('Data Pegawai')
      .select('Nama, Jabatan');

    if (staffsError) console.error('Error fetching staffs:', staffsError);

    const staffContext =
      staffs && staffs.length > 0
        ? staffs
            .map((s: any) => {
              const nama = s.Nama || 'Tanpa Nama';
              const jabatan = s.Jabatan || 'Pegawai';
              return `- ${nama} (${jabatan})`;
            })
            .join('\n')
        : 'Data staf belum berhasil dimuat dari sistem.';

    // ── 3. SYSTEM PROMPT ────────────────────────────────────────────────
    // MENGGANTI PANDUAN PENCARIAN BUKU UNTUK MENGGUNAKAN 'Klasifikasi' DAN 'ISBN'
    const systemPrompt = `
Anda adalah "Lexi", Asisten AI Pustaka Datun Kejaksaan Agung.
Karakter Anda: Sangat ramah, empatik, cerdas, dan luwes. Anda berbicara dengan bahasa Indonesia yang rapi, tidak kaku, layaknya pustakawan profesional yang siap membantu rekan-rekan kejaksaan dengan senyuman.

PANDUAN MENJAWAB (SANGAT PENTING):

1. PENCARIAN BUKU & SINOPSIS (DETAIL & SMART FILTER):
   - Jika pengguna mencari buku, baca DATA BUKU dengan sangat teliti. Sebutkan maksimal 3-5 buku yang paling relevan.
   - Jika pengguna bertanya tentang "Apa isi buku X?" atau "Buku tentang apa ini?", Anda WAJIB membaca bagian "Ringkasan Sinopsis" dari DATA BUKU dan merangkum isinya dengan gaya penceritaan yang menarik untuk memancing minat baca.
   - Berikan rinciannya dengan format yang elegan ke bawah:
     Judul: **[Judul Buku]** karya [Penulis]
     ISBN: [ISBN]
     Klasifikasi: [Klasifikasi]
     Lokasi Rak: [Rak]
     Sisa Stok: [Stok] eksemplar
   - Tutup informasi buku dengan tawaran (Contoh: "Apakah Bapak/Ibu tertarik meminjamnya? Boleh sebutkan nama Bapak/Ibu agar saya bantu booking langsung dari sini!").

2. EKSEKUSI PEMINJAMAN / BOOKING (FITUR UTAMA):
   - Jika pengguna menyatakan ingin meminjam/mem-booking buku, pastikan Anda tahu 2 hal: JUDUL BUKU dan NAMA PEGAWAI.
   - WAJIB cocokkan nama pegawai dengan DATA PEGAWAI yang tersedia. Jika tidak cocok, tolak dengan sopan.
   - WAJIB pastikan stok buku > 0 sebelum memproses. Jika stok habis, informasikan ke pengguna.
   - Jika pengguna belum menyebutkan namanya, TANYAKAN dengan ramah: "Tentu, boleh saya tahu nama Bapak/Ibu untuk dicatat di sistem?".
   - JIKA JUDUL BUKU DAN NAMA PEGAWAI SUDAH JELAS DAN VALID, ANDA WAJIB BERHENTI BERBICARA BIASA.
     Anda HANYA BOLEH membalas dengan KODE JSON murni di bawah ini (tanpa tanda kutip markdown, tanpa kalimat apapun):
     {"action":"booking","book_id":"[ID buku dari data]","buku":"[Judul Buku]","nama":"[Nama Pegawai persis dari data]"}

3. PENCARIAN PEGAWAI (INTERAKTIF):
   - Jika pengguna HANYA mengatakan "Saya ingin mencari data pegawai" atau "Info pegawai", JANGAN langsung berikan daftar nama.
     Tanya balik dengan lembut: "Tentu! Anda ingin mencari pegawai berdasarkan **Nama** atau **Jabatannya**?".
   - Jika ditanya spesifik, cari di DATA PEGAWAI dan sebutkan namanya dengan sopan (tambahkan Bapak/Ibu).

4. FITUR UMUM & ATURAN:
   - Aturan Pinjam: 7 hari standar (maks 14 hari). Telat/hilang wajib ganti buku atau denda.
   - Pengetahuan Umum: Jika diajak ngobrol di luar topik perpus, layani dengan ramah.

📚 DATA BUKU (TERMASUK ID UNTUK SISTEM):
${catalogContext}

👥 DATA PEGAWAI KEJAKSAAN AGUNG:
${staffContext}

FORMAT JAWABAN (KECUALI SAAT BOOKING):
- Gunakan huruf tebal (**) untuk judul buku atau nama orang penting.
- DILARANG menggunakan tanda bintang (*) saat menyebutkan daftar nama. Gunakan penomoran angka.
- Gunakan emoji secukupnya agar percakapan terasa hidup.
    `;

    // ── 4. BANGUN HISTORY (MAKS 10 PESAN TERAKHIR) ─────────────────────
    const limitedHistory = history.slice(-10);
    const contents = limitedHistory.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    // ── 5. PANGGIL GEMINI ───────────────────────────────────────────────
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${selectedModel.name}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
        }),
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('❌ Error dari Google:', data);
      if (data.error?.code === 429) {
        return NextResponse.json({
          reply:
            'Aduh, otak AI saya kepanasan nih! 🤯 Google membatasi kecepatan saya karena terlalu banyak pesan dalam 1 menit. Mohon beri saya waktu istirahat sekitar 1 menit, lalu tanyakan lagi ya.',
        });
      }
      return NextResponse.json(
        { reply: `Sistem sedang sibuk. Error: ${data.error?.message}` },
        { status: 500 }
      );
    }

    let replyText = data.candidates[0].content.parts[0].text;

    // ── 6. SERVER INTERCEPTOR — PROSES BOOKING ──────────────────────────
    try {
      const isBookingAction =
        replyText.includes('"action"') && replyText.includes('booking');

      if (isBookingAction) {
        const jsonMatch = replyText.match(/\{[\s\S]*?\}/);

        if (jsonMatch) {
          const command = JSON.parse(jsonMatch[0]);

          if (command.action === 'booking' && command.book_id && command.buku && command.nama) {
            // a. Cek stok buku terkini sebelum insert
            const { data: bookData, error: bookFetchError } = await supabase
              .from('books')
              .select('stock, title')
              .eq('id', command.book_id)
              .single();

            if (bookFetchError || !bookData) {
              replyText = `Maaf, terjadi kesalahan saat mengecek stok buku. Mohon coba lagi.`;
            } else if (bookData.stock <= 0) {
              replyText = `Maaf, stok buku **${command.buku}** saat ini **habis**. Silakan pilih buku lain atau coba lagi nanti. 📚`;
            } else {
              // b. Hitung due_date (7 hari dari sekarang)
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 7);

              // c. Insert ke tabel loans (tabel utama sistem)
              const { error: loanError } = await supabase.from('loans').insert([
                {
                  book_id: command.book_id,
                  user_email: userEmail,
                  employee_name: command.nama,
                  due_date: dueDate.toISOString(),
                  status: 'DIPINJAM',
                  borrowed_via: 'AI_LEXI',
                },
              ]);

              // d. Insert juga ke booking_ai sebagai log
              await supabase.from('booking_ai').insert([
                { nama: command.nama, buku: command.buku },
              ]);

              if (loanError) {
                console.error('Gagal insert ke loans:', loanError.message);
                replyText = `Maaf Bapak/Ibu **${command.nama}**, ada gangguan teknis saat mencatat ke sistem. Mohon coba lagi sebentar ya. 🙏`;
              } else {
                // e. Kurangi stok buku
                await supabase
                  .from('books')
                  .update({ stock: bookData.stock - 1 })
                  .eq('id', command.book_id);

                replyText =
                  `✅ **Peminjaman Berhasil Dicatat!**\n\n` +
                  `Buku **${command.buku}** telah dipinjamkan atas nama **Bapak/Ibu ${command.nama}**.\n\n` +
                  `📅 Tenggat pengembalian: **${dueDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n\n` +
                  `Silakan ambil buku fisiknya di meja layanan E-Perpus. Ada lagi yang bisa Lexi bantu? 😊`;
              }
            }
          }
        }
      }
    } catch (parseError) {
      console.error('Gagal proses JSON booking:', parseError);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('❌ Error AI Detail:', error.message);
    return NextResponse.json(
      { reply: 'Koneksi ke otak AI terputus. Mohon coba lagi.' },
      { status: 500 }
    );
  }
}