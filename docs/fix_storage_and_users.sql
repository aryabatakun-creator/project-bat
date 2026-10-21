-- ====================================================================
-- PROJECT BAT: SQL FIX SINKRONISASI USER AKSES & UPLOAD FOTO STORAGE
-- File: docs/fix_storage_and_users.sql
-- ====================================================================
-- Petunjuk Eksekusi:
-- 1. Buka Supabase Dashboard -> Project Anda (vxwsyzelhzutbslluhyr)
-- 2. Masuk ke menu "SQL Editor" (ikon terminal di sidebar kiri)
-- 3. Paste seluruh isi skrip ini lalu klik "Run"
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABEL APP_USERS (Sinkronisasi Hak Akses User Antar-Perangkat)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'supervisor',
    password TEXT NOT NULL DEFAULT 'Password123',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan RLS & buat policy akses untuk web app
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access app_users" ON public.app_users;
CREATE POLICY "Allow public access app_users"
ON public.app_users FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- Seed akun bawaan Project BAT
INSERT INTO public.app_users (id, full_name, email, role, password)
VALUES 
('usr-admin-1', 'Admin Operasional', 'admin@bat-tracker.com', 'admin', 'Password123'),
('usr-mgmt-1', 'Area Management', 'management@bat-tracker.com', 'management', 'Password123'),
('usr-spv-1', 'Field Supervisor', 'supervisor@bat-tracker.com', 'supervisor', 'Password123')
ON CONFLICT (email) DO NOTHING;

-- --------------------------------------------------------------------
-- 2. STORAGE BUCKET 'case-photos' & POLICY UPLOAD FOTO BUKTI
-- --------------------------------------------------------------------
-- Pastikan bucket case-photos terdaftar dan publik
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-photos', 'case-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bersihkan policy storage lama untuk case-photos
DROP POLICY IF EXISTS "Allow public read case-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload case-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update case-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete case-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload case-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete case-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read case-photos" ON storage.objects;

-- Buat policy baru agar foto bukti lapangan dapat langsung diunggah dari iPhone & Android
CREATE POLICY "Allow public read case-photos"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'case-photos');

CREATE POLICY "Allow public upload case-photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'case-photos');

CREATE POLICY "Allow public update case-photos"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'case-photos')
WITH CHECK (bucket_id = 'case-photos');

CREATE POLICY "Allow public delete case-photos"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'case-photos');

-- --------------------------------------------------------------------
-- 3. PASTIKAN SELURUH TABEL OPERASIONAL DAPAT DIAKSES OLEH WEB APP
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public access master_locations" ON master_locations;
CREATE POLICY "Allow public access master_locations"
ON master_locations FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access case_attachments" ON case_attachments;
CREATE POLICY "Allow public access case_attachments"
ON case_attachments FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access cases" ON cases;
CREATE POLICY "Allow public access cases"
ON cases FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);
