import { NextResponse } from 'next/server';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  const supabase = await createAuthenticatedClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('loans')
    .select('*, books(*)')
    .eq('user_email', profile.email)
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Riwayat peminjaman tidak dapat dimuat.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: data || [] });
}
