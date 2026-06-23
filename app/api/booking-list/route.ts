import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Ini penting agar data selalu fresh saat di-refresh
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('booking_ai')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}