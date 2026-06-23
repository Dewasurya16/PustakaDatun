import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 👇 TAMBAHKAN BARIS INI: Wajib agar data tidak di-cache oleh Next.js
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*, books(title, rak)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}