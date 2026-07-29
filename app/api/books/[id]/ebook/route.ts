import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createAuthenticatedClient,
  getAuthenticatedProfile,
} from '../../../../../lib/auth';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSupabaseStorageLocation(pdfUrl: string) {
  try {
    const url = new URL(pdfUrl);
    const expectedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
    if (url.protocol !== 'https:' || url.host !== expectedHost) return null;

    const marker = '/storage/v1/object/public/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const objectLocation = decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length),
    );
    const separatorIndex = objectLocation.indexOf('/');
    if (separatorIndex <= 0) return null;

    return {
      bucket: objectLocation.slice(0, separatorIndex),
      path: objectLocation.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function getSafeExternalUrl(pdfUrl: string) {
  try {
    const url = new URL(pdfUrl);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

async function recordEbookAccess(
  supabase: SupabaseClient,
  book: { id: string; title: string },
  userEmail: string,
) {
  const { error } = await supabase.from('pdf_downloads').insert({
    book_id: book.id,
    book_title: book.title,
    pdf_url: `/api/books/${book.id}/ebook`,
    user_email: userEmail,
    downloaded_at: new Date().toISOString(),
  });

  return !error;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Autentikasi diperlukan.' }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'ID buku tidak valid.' }, { status: 400 });
  }

  const supabase = await createAuthenticatedClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
  }

  const { data: book, error } = await supabase
    .from('books')
    .select('id, title, pdf_url')
    .eq('id', id)
    .single();
  if (error || !book?.pdf_url) {
    return NextResponse.json({ error: 'E-book tidak ditemukan.' }, { status: 404 });
  }

  const location = getSupabaseStorageLocation(book.pdf_url);
  if (!location) {
    const externalUrl = getSafeExternalUrl(book.pdf_url);
    if (!externalUrl) {
      return NextResponse.json(
        { error: 'Hyperlink e-book tidak valid atau tidak menggunakan HTTPS.' },
        { status: 422 },
      );
    }

    const isRecorded = await recordEbookAccess(supabase, book, profile.email);
    if (!isRecorded) {
      return NextResponse.json(
        { error: 'Aktivitas membaca tidak dapat dicatat.' },
        { status: 500 },
      );
    }

    const response = NextResponse.redirect(externalUrl, 307);
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  const { data: document, error: downloadError } = await supabase.storage
    .from(location.bucket)
    .download(location.path);
  if (downloadError || !document) {
    return NextResponse.json(
      { error: 'E-book tidak dapat diakses.' },
      { status: 404 },
    );
  }

  const isRecorded = await recordEbookAccess(supabase, book, profile.email);
  if (!isRecorded) {
    return NextResponse.json(
      { error: 'Aktivitas membaca tidak dapat dicatat.' },
      { status: 500 },
    );
  }

  const safeTitle = String(book.title || 'ebook')
    .replace(/[^\p{L}\p{N}._ -]/gu, '')
    .slice(0, 100);
  return new NextResponse(document.stream(), {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': `inline; filename="${safeTitle}.pdf"`,
      'Content-Type': document.type || 'application/pdf',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
