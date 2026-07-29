import { NextResponse } from 'next/server';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '@/lib/auth';

// Ini penting agar data selalu fresh saat di-refresh
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await getAuthenticatedProfile();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }
    const supabase = await createAuthenticatedClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('booking_ai')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}
