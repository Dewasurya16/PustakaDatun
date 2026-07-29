"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  clearAuthCookies,
  getAuthenticatedProfile,
  setAuthCookies,
} from "../lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function handleRegister(email: string, password: string) {
  // 1. Daftarkan ke Supabase Auth
  const normalizedEmail = email.trim().toLowerCase();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });
  if (authError || !authData.user) {
    return { success: false, message: authError?.message || "Gagal membuat akun." };
  }

  // 2. Masukkan ke tabel profiles dengan status 'pending' (Belum ACC)
  const { error: dbError } = await supabase.from('profiles').insert([{
    auth_user_id: authData.user.id,
    email: normalizedEmail,
  }]);
  if (dbError) return { success: false, message: "Gagal membuat profil. Email mungkin sudah terdaftar." };

  return { success: true };
}

export async function handleLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error || !data.user || !data.session) {
    return { success: false, message: "Email atau Password salah!" };
  }

  const cookieStore = await cookies();
  setAuthCookies(
    cookieStore,
    data.session.access_token,
    data.session.refresh_token,
  );
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    clearAuthCookies(cookieStore);
    await supabase.auth.signOut();
    return {
      success: false,
      message: "⛔ Akun Anda belum disetujui atau profil tidak valid.",
    };
  }

  return { success: true, url: profile.role === 'admin' ? "/dashboard" : "/katalog" };
}

export async function handleLogout() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
  await supabase.auth.signOut();
}

export async function handleLogoutAndRedirect() {
  await handleLogout();
  redirect('/');
}

// ── Log Download PDF ──────────────────────────────────────────
