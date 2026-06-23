-- Jalankan query ini di SQL Editor Supabase Anda

CREATE TABLE IF NOT EXISTS public.pdf_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL,
    book_title TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    user_email TEXT NOT NULL,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atur Realtime
alter publication supabase_realtime add table public.pdf_downloads;

-- Kebijakan RLS (Row Level Security)
-- Memungkinkan siapa saja untuk menyisipkan data (insert)
CREATE POLICY "Allow anonymous inserts on pdf_downloads" 
ON public.pdf_downloads 
FOR INSERT 
WITH CHECK (true);

-- Memungkinkan semua orang melihat data (select)
CREATE POLICY "Allow public read access on pdf_downloads" 
ON public.pdf_downloads 
FOR SELECT 
USING (true);

-- Jangan lupa untuk mengaktifkan RLS
ALTER TABLE public.pdf_downloads ENABLE ROW LEVEL SECURITY;
