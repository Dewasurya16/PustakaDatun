-- WAJIB dijalankan di Supabase SQL Editor sebelum rilis.
-- Menjadikan bucket yang direferensikan books.pdf_url privat dan hanya
-- mengizinkan akun Supabase terautentikasi membaca object.

update storage.buckets
set public = false
where id in (
  select distinct split_part(
    split_part(pdf_url, '/storage/v1/object/public/', 2),
    '/',
    1
  )
  from public.books
  where pdf_url like '%/storage/v1/object/public/%'
);

drop policy if exists "authenticated ebook reads" on storage.objects;
create policy "authenticated ebook reads"
on storage.objects
for select
to authenticated
using (
  bucket_id in (
    select distinct split_part(
      split_part(pdf_url, '/storage/v1/object/public/', 2),
      '/',
      1
    )
    from public.books
    where pdf_url like '%/storage/v1/object/public/%'
  )
);

-- Data katalog boleh dibaca akun, tetapi role anon tidak boleh memperoleh
-- pdf_url melalui REST. View publik sengaja tidak menyertakan pdf_url.
revoke select on public.books from anon;
grant select (
  id,
  title,
  author,
  category,
  stock,
  rating,
  rating_count,
  created_at
) on public.books to anon;
grant select on public.books to authenticated;

-- Log dokumen bersifat internal.
revoke all on public.pdf_downloads from anon;
grant select, insert on public.pdf_downloads to authenticated;

-- Hapus policy permisif lama pada tabel sensitif.
drop policy if exists app_public_select on public.pdf_downloads;
drop policy if exists app_public_insert on public.pdf_downloads;
drop policy if exists app_public_update on public.pdf_downloads;
drop policy if exists app_public_delete on public.pdf_downloads;

create policy pdf_downloads_authenticated_insert
on public.pdf_downloads
for insert
to authenticated
with check (auth.jwt() ->> 'email' = user_email);

create policy pdf_downloads_admin_select
on public.pdf_downloads
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where (
        auth_user_id = auth.uid()
        or lower(email) = lower(auth.jwt() ->> 'email')
      )
      and role = 'admin'
      and status = 'approved'
  )
);
