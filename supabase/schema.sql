-- Pustaka Datun - Supabase database schema
-- Jalankan file ini di Supabase SQL Editor pada project/instans baru.
--
-- Catatan penting:
-- Aplikasi saat ini memakai NEXT_PUBLIC_SUPABASE_ANON_KEY dari server/client
-- dan cookie custom, bukan Supabase SSR auth helper. Karena itu policy RLS
-- di bawah dibuat permisif supaya aplikasi clone langsung berjalan.
-- Untuk produksi yang lebih ketat, pindahkan mutasi admin ke API route dengan
-- service role key, lalu ganti policy menjadi berbasis auth.uid()/role.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Master kategori
-- Kode aplikasi lama memakai books.category sebagai text, jadi categories
-- dibuat sebagai master referensi dan books.category tetap dipertahankan.
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id smallserial primary key,
  name text not null unique,
  slug text not null unique,
  sort_order smallint not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

insert into public.categories (sort_order, name, slug)
values
  (1,  'Buku Datun', 'buku-datun'),
  (2,  'Materi Paparan Jamdatun', 'materi-paparan-jamdatun'),
  (3,  'Peraturan', 'peraturan'),
  (4,  'Pengetahuan penunjang', 'pengetahuan-penunjang'),
  (5,  'Berkas perkara lengkap', 'berkas-perkara-lengkap'),
  (6,  'LO kebijakan dan legislasi', 'lo-kebijakan-dan-legislasi'),
  (7,  'LO korporasi', 'lo-korporasi'),
  (8,  'LO litigasi', 'lo-litigasi'),
  (9,  'LO pengadaan - pbj', 'lo-pengadaan-pbj'),
  (10, 'LO perjanjian', 'lo-perjanjian'),
  (11, 'Materi pelatihan', 'materi-pelatihan'),
  (12, 'Perjanjian kerja sama', 'perjanjian-kerja-sama'),
  (13, 'Laporan perkembangan THL', 'laporan-perkembangan-thl'),
  (14, 'Materi Rakernas', 'materi-rakernas')
on conflict (name) do update
set
  slug = excluded.slug,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Akun aplikasi
-- Supabase Auth tetap menyimpan credential utama. Tabel profiles dipakai app
-- untuk approval, role, dan kompatibilitas modal reset lama.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null,
  role text not null default 'user'
    constraint profiles_role_check check (role in ('admin', 'user')),
  status text not null default 'pending'
    constraint profiles_status_check check (status in ('pending', 'approved')),
  password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email));

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Master pegawai internal
-- Nama tabel/kolom sengaja memakai spasi dan huruf kapital karena kode
-- memanggil .from('Data Pegawai').select('Nama, Jabatan') dll.
-- ---------------------------------------------------------------------------

create table if not exists public."Data Pegawai" (
  id uuid primary key default gen_random_uuid(),
  "Nama" text not null,
  "Jabatan" text,
  "Bidang" text,
  "No HP" text,
  "Email" text,
  "NIP" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists data_pegawai_nama_idx
  on public."Data Pegawai" ("Nama");

create index if not exists data_pegawai_email_lower_idx
  on public."Data Pegawai" (lower("Email"))
  where "Email" is not null;

drop trigger if exists trg_data_pegawai_updated_at on public."Data Pegawai";
create trigger trg_data_pegawai_updated_at
before update on public."Data Pegawai"
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Katalog buku
-- ---------------------------------------------------------------------------

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  publisher text,
  category text references public.categories(name)
    on update cascade
    on delete restrict,
  nomor_buku text,
  stock integer not null default 0
    constraint books_stock_check check (stock >= 0),
  rak text,
  pdf_url text,
  ringkasan text,
  bidang_bb text,
  rating numeric(2,1) not null default 0
    constraint books_rating_check check (rating >= 0 and rating <= 5),
  rating_count integer not null default 0
    constraint books_rating_count_check check (rating_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_category_idx on public.books (category);
create index if not exists books_created_at_idx on public.books (created_at desc);
create index if not exists books_stock_idx on public.books (stock);
create index if not exists books_title_trgm_idx
  on public.books using gin (title gin_trgm_ops);
create index if not exists books_author_trgm_idx
  on public.books using gin (author gin_trgm_ops)
  where author is not null;

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
before update on public.books
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Sirkulasi/peminjaman
-- id dibuat bigserial karena route /api/loans/[id]/return mengubah params id
-- menjadi Number(...).
-- ---------------------------------------------------------------------------

create table if not exists public.loans (
  id bigserial primary key,
  book_id uuid not null references public.books(id)
    on update cascade
    on delete restrict,
  user_email text,
  employee_name text not null,
  employee_nip text,
  loan_date date not null default current_date,
  due_date timestamptz not null,
  return_date timestamptz,
  status text not null default 'DIPINJAM'
    constraint loans_status_check check (
      status in ('DIPINJAM', 'DIKEMBALIKAN', 'SUDAH DIULAS', 'TERLAMBAT')
    ),
  borrowed_via text default 'KATALOG'
    constraint loans_borrowed_via_check check (
      borrowed_via is null or borrowed_via in ('KATALOG', 'AI_LEXI')
    ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists loans_book_id_idx on public.loans (book_id);
create index if not exists loans_user_email_idx on public.loans (user_email);
create index if not exists loans_employee_name_idx on public.loans (employee_name);
create index if not exists loans_status_idx on public.loans (status);
create index if not exists loans_due_date_idx on public.loans (due_date);
create index if not exists loans_created_at_idx on public.loans (created_at desc);

drop trigger if exists trg_loans_updated_at on public.loans;
create trigger trg_loans_updated_at
before update on public.loans
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Log booking dari Lexi AI
-- ---------------------------------------------------------------------------

create table if not exists public.booking_ai (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  buku text not null,
  tanggal timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists booking_ai_tanggal_idx
  on public.booking_ai (tanggal desc);

-- ---------------------------------------------------------------------------
-- Buku tamu digital
-- ---------------------------------------------------------------------------

create table if not exists public.buku_tamu (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  bidang text,
  asal_instansi text,
  keperluan text not null,
  pesan text,
  isi_buku text,
  ttd_data text,
  tampil_publik boolean not null default true,
  status text not null default 'pending'
    constraint buku_tamu_status_check check (
      status in ('pending', 'approved', 'rejected')
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buku_tamu_status_idx on public.buku_tamu (status);
create index if not exists buku_tamu_created_at_idx on public.buku_tamu (created_at desc);
create index if not exists buku_tamu_tampil_publik_idx
  on public.buku_tamu (tampil_publik)
  where tampil_publik = true;

drop trigger if exists trg_buku_tamu_updated_at on public.buku_tamu;
create trigger trg_buku_tamu_updated_at
before update on public.buku_tamu
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Log download PDF/e-book
-- ---------------------------------------------------------------------------

create table if not exists public.pdf_downloads (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id)
    on update cascade
    on delete set null,
  book_title text not null,
  pdf_url text not null,
  user_email text not null,
  downloaded_at timestamptz not null default now()
);

create index if not exists pdf_downloads_downloaded_at_idx
  on public.pdf_downloads (downloaded_at desc);
create index if not exists pdf_downloads_book_id_idx
  on public.pdf_downloads (book_id);
create index if not exists pdf_downloads_user_email_idx
  on public.pdf_downloads (user_email);

-- Aktifkan realtime untuk log download PDF jika publication tersedia.
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pdf_downloads'
  ) then
    alter publication supabase_realtime add table public.pdf_downloads;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants dasar untuk Supabase anon/authenticated roles
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select, update on all sequences in schema public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Policy ini permisif untuk kompatibilitas dengan kode clone saat ini.
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public."Data Pegawai" enable row level security;
alter table public.books enable row level security;
alter table public.loans enable row level security;
alter table public.booking_ai enable row level security;
alter table public.buku_tamu enable row level security;
alter table public.pdf_downloads enable row level security;

do $$
declare
  tbl regclass;
begin
  foreach tbl in array array[
    'public.categories'::regclass,
    'public.profiles'::regclass,
    'public."Data Pegawai"'::regclass,
    'public.books'::regclass,
    'public.loans'::regclass,
    'public.booking_ai'::regclass,
    'public.buku_tamu'::regclass,
    'public.pdf_downloads'::regclass
  ]
  loop
    execute format('drop policy if exists app_public_select on %s', tbl);
    execute format('drop policy if exists app_public_insert on %s', tbl);
    execute format('drop policy if exists app_public_update on %s', tbl);
    execute format('drop policy if exists app_public_delete on %s', tbl);

    execute format(
      'create policy app_public_select on %s for select to anon, authenticated using (true)',
      tbl
    );
    execute format(
      'create policy app_public_insert on %s for insert to anon, authenticated with check (true)',
      tbl
    );
    execute format(
      'create policy app_public_update on %s for update to anon, authenticated using (true) with check (true)',
      tbl
    );
    execute format(
      'create policy app_public_delete on %s for delete to anon, authenticated using (true)',
      tbl
    );
  end loop;
end;
$$;
