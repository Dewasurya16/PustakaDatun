"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function handleRegister(email: string, password: string) {
  // 1. Daftarkan ke Supabase Auth
  const { error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return { success: false, message: authError.message };

  // 2. Masukkan ke tabel profiles dengan status 'pending' (Belum ACC)
  const { error: dbError } = await supabase.from('profiles').insert([{ email }]);
  if (dbError) return { success: false, message: "Gagal membuat profil. Email mungkin sudah terdaftar." };

  return { success: true };
}

export async function handleLogin(email: string, password: string) {
  // 1. Cek tabel profiles dulu (Apakah sudah di-ACC?)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (!profile || profileError) {
    return { success: false, message: "Akun tidak ditemukan. Silakan daftar dulu." };
  }

  if (profile.status === 'pending') {
    return { success: false, message: "⛔ Akun Anda belum di-ACC oleh Admin." };
  }

  // 2. Jika sudah di-ACC, verifikasi password ke Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { success: false, message: "Email atau Password salah!" };
  }

  // 3. Set Cookie berdasarkan ROLE yang ada di database
  const cookieStore = await cookies();
  cookieStore.set("user_email", email, { path: "/" });
  cookieStore.set("session", profile.role, { path: "/" });

  return { success: true, url: profile.role === 'admin' ? "/dashboard" : "/katalog" };
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("user_email");
  await supabase.auth.signOut();
}

// ── Log Download PDF ──────────────────────────────────────────
export async function logPdfDownload(bookId: string, bookTitle: string, pdfUrl: string) {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value || "Tamu";

  const { error } = await supabase.from("pdf_downloads").insert([{
    book_id:    bookId,
    book_title: bookTitle,
    pdf_url:    pdfUrl,
    user_email: userEmail,
    downloaded_at: new Date().toISOString(),
  }]);

  if (error) {
    console.error("Gagal log download:", error.message);
    return { success: false };
  }
  return { success: true };
}