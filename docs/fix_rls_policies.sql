-- ====================================================================
-- SQL FIX: BUKA AKSES SIMPAN / UPDATE / HAPUS & UPLOAD FOTO KE SUPABASE
-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. Bersihkan policy lama yang memblokir insert/update/delete dari web app
DROP POLICY IF EXISTS "Allow admin manage master_areas" ON master_areas;
DROP POLICY IF EXISTS "Allow admin manage master_categories" ON master_categories;
DROP POLICY IF EXISTS "Allow admin manage master_pics" ON master_pics;
DROP POLICY IF EXISTS "Allow supervisor & admin insert cases" ON cases;
DROP POLICY IF EXISTS "Allow supervisor & admin update cases" ON cases;
DROP POLICY IF EXISTS "Allow admin delete cases" ON cases;
DROP POLICY IF EXISTS "Allow authenticated read case_attachments" ON case_attachments;
DROP POLICY IF EXISTS "Allow supervisor & admin insert case_attachments" ON case_attachments;
DROP POLICY IF EXISTS "Allow supervisor & admin delete case_attachments" ON case_attachments;
DROP POLICY IF EXISTS "Allow public access master_areas" ON master_areas;
DROP POLICY IF EXISTS "Allow public access master_categories" ON master_categories;
DROP POLICY IF EXISTS "Allow public access master_pics" ON master_pics;
DROP POLICY IF EXISTS "Allow public access cases" ON cases;
DROP POLICY IF EXISTS "Allow public access case_attachments" ON case_attachments;

-- 2. Buat policy baru agar web app dapat menyimpan Case, Master Data, dan Foto
CREATE POLICY "Allow public access master_areas"
ON master_areas FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access master_categories"
ON master_categories FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access master_pics"
ON master_pics FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access cases"
ON cases FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access case_attachments"
ON case_attachments FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);
