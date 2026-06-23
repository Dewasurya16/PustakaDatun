import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define the context to match Next.js 15+ expectations
type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  req: NextRequest,
  context: Context // params is inside context
) {
  try {
    // Await the params before using them
    const { id } = await context.params;
    
    // Clean the ID (important if any trailing spaces leaked in)
    const loanId = Number(id.trim());

    if (isNaN(loanId)) {
      return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
    }

    // 1. Ambil data loan
    const { data: loan, error: fetchError } = await supabase
      .from('loans')
      .select('book_id, status')
      .eq('id', loanId)
      .single();

    if (fetchError || !loan) {
      return NextResponse.json({ error: 'Data peminjaman tidak ditemukan.' }, { status: 404 });
    }

    if (['DIKEMBALIKAN', 'SUDAH DIULAS'].includes(loan.status?.toUpperCase())) {
      return NextResponse.json({ error: 'Buku ini sudah dikembalikan sebelumnya.' }, { status: 400 });
    }

    // 2. Update status loan
    const { error: updateError } = await supabase
      .from('loans')
      .update({
        status: 'DIKEMBALIKAN',
        return_date: new Date().toISOString(),
      })
      .eq('id', loanId);

    if (updateError) throw new Error(updateError.message);

    // 3. Tambah stok buku +1
    const { data: bookData } = await supabase
      .from('books')
      .select('stock')
      .eq('id', loan.book_id)
      .single();

    if (bookData) {
      await supabase
        .from('books')
        .update({ stock: (bookData.stock ?? 0) + 1 })
        .eq('id', loan.book_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
