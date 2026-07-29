import { NextResponse } from 'next/server';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const profile = await getAuthenticatedProfile();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 });
  }

  const supabase = await createAuthenticatedClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('pdf_downloads')
    .select('id, book_id, book_title, user_email, pdf_url, downloaded_at')
    .order('downloaded_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: 'Log tidak dapat dibaca. Pastikan grant SELECT sudah diterapkan.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: data || [] });
}
