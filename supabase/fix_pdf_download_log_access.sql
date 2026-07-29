-- Jalankan sekali jika secure_ebook_access.sql sudah pernah diterapkan.
-- Policy admin sudah ada, tetapi PostgreSQL tetap memerlukan table grant.

grant select, insert on public.pdf_downloads to authenticated;

drop policy if exists pdf_downloads_admin_select on public.pdf_downloads;
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
