-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR PROJECT BAT (CASE MONITORING SYSTEM)
-- Version: 1.1.0
-- ====================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
CREATE TYPE app_role AS ENUM ('admin', 'management', 'supervisor');
CREATE TYPE priority_level AS ENUM ('Critical', 'High', 'Medium', 'Low');
CREATE TYPE case_status AS ENUM ('Open', 'On Progress', 'Pending', 'Escalated', 'Closed');

-- 2. USER PROFILES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role app_role NOT NULL DEFAULT 'supervisor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MASTER TABLES
CREATE TABLE IF NOT EXISTS master_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID REFERENCES master_areas(id) ON DELETE CASCADE,
    area_name VARCHAR(100),
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS master_pics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SEQUENCE & FUNCTION UNTUK AUTO-GENERATE CASE ID (BAT-YYYY-001)
CREATE SEQUENCE IF NOT EXISTS case_id_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_case_id()
RETURNS TRIGGER AS $$
DECLARE
    target_yr TEXT := TO_CHAR(COALESCE(NEW.date_reported, CURRENT_DATE), 'YYYY');
    seq_val TEXT;
BEGIN
    seq_val := LPAD(NEXTVAL('case_id_seq')::TEXT, 3, '0');
    NEW.case_id := 'BAT-' || target_yr || '-' || seq_val;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. MAIN CASES TABLE
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(30) UNIQUE,
    date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES master_categories(id) ON DELETE SET NULL,
    case_title TEXT NOT NULL,
    area_id UUID REFERENCES master_areas(id) ON DELETE SET NULL,
    location_id UUID REFERENCES master_locations(id) ON DELETE SET NULL,
    location_name VARCHAR(150),
    priority priority_level NOT NULL DEFAULT 'Medium',
    pic_id UUID REFERENCES master_pics(id) ON DELETE SET NULL,
    target_date DATE NOT NULL,
    status case_status NOT NULL DEFAULT 'Open',
    progress INT CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom location_id & location_name ada jika tabel cases sudah dibuat sebelumnya
ALTER TABLE cases ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES master_locations(id) ON DELETE SET NULL;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS location_name VARCHAR(150);

-- 6. CASE ATTACHMENTS TABLE (Supabase Storage / Base64 Metadata)
CREATE TABLE IF NOT EXISTS case_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_kb INT,
    mime_type VARCHAR(50) DEFAULT 'image/webp',
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TRIGGERS
-- Trigger: Generate Case ID jika kosong saat INSERT
DROP TRIGGER IF EXISTS trg_generate_case_id ON cases;
CREATE TRIGGER trg_generate_case_id
BEFORE INSERT ON cases
FOR EACH ROW
WHEN (NEW.case_id IS NULL OR NEW.case_id = '')
EXECUTE PROCEDURE generate_case_id();

-- Trigger: Update timestamp last_update
CREATE OR REPLACE FUNCTION update_last_update_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cases_last_update ON cases;
CREATE TRIGGER update_cases_last_update
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE PROCEDURE update_last_update_column();

-- Trigger: Auto-create Profile saat user mendaftar di auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'supervisor'::app_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 8. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_area ON cases(area_id);
CREATE INDEX IF NOT EXISTS idx_cases_location ON cases(location_id);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category_id);
CREATE INDEX IF NOT EXISTS idx_cases_date_reported ON cases(date_reported);
CREATE INDEX IF NOT EXISTS idx_cases_target_date ON cases(target_date);
CREATE INDEX IF NOT EXISTS idx_case_attachments_case ON case_attachments(case_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES & STORAGE BUCKET
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_pics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_attachments ENABLE ROW LEVEL SECURITY;

-- Helper Function: Dapatkan Role User aktif
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        'supervisor'::app_role
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies: PROFILES
DROP POLICY IF EXISTS "Allow public access profiles" ON profiles;
CREATE POLICY "Allow public access profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policies: MASTER TABLES
DROP POLICY IF EXISTS "Allow public access master_areas" ON master_areas;
CREATE POLICY "Allow public access master_areas" ON master_areas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access master_locations" ON master_locations;
CREATE POLICY "Allow public access master_locations" ON master_locations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access master_categories" ON master_categories;
CREATE POLICY "Allow public access master_categories" ON master_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access master_pics" ON master_pics;
CREATE POLICY "Allow public access master_pics" ON master_pics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policies: CASES
DROP POLICY IF EXISTS "Allow public access cases" ON cases;
CREATE POLICY "Allow public access cases" ON cases FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policies: CASE ATTACHMENTS
DROP POLICY IF EXISTS "Allow public access case_attachments" ON case_attachments;
CREATE POLICY "Allow public access case_attachments" ON case_attachments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- SUPABASE STORAGE BUCKET UNTUK FOTO BUKTI KASUS (case-photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-photos', 'case-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public upload case-photos" ON storage.objects;
CREATE POLICY "Allow public upload case-photos"
ON storage.objects FOR ALL TO anon, authenticated
USING (bucket_id = 'case-photos')
WITH CHECK (bucket_id = 'case-photos');

-- ====================================================================
-- 10. INITIAL SEED DATA (Sesuai Dashboard Asli Project BAT)
-- ====================================================================

-- Insert Master Categories
INSERT INTO master_categories (name) VALUES 
('Operasional'),
('Manpower'),
('HR & Industrial Relation'),
('Equipment & Uniform'),
('Administrasi & Billing'),
('Training & Competency'),
('HSE & Compliance'),
('Facility & Infrastructure'),
('Client Request')
ON CONFLICT (name) DO NOTHING;

-- Insert Master Areas
INSERT INTO master_areas (name) VALUES 
('Malang'),
('Malang - KR4'),
('Malang Selatan'),
('Singosari'),
('Singosari - Artemis'),
('Jakarta (HO)'),
('Karanglo'),
('Semeru'),
('Semua Area')
ON CONFLICT (name) DO NOTHING;

-- Insert Master PICs
INSERT INTO master_pics (name, role) VALUES 
('Erlangga', 'Operational Lead'),
('Rokhim', 'Manpower Coordinator'),
('Riski Yunani', 'Training Specialist'),
('Deni Nur', 'Finance & Billing'),
('Logistik', 'Supply Chain & Uniform'),
('HSE', 'Health, Safety & Environment'),
('Facility', 'Infrastructure Lead'),
('HR', 'HR & Industrial Relations'),
('DJT', 'Fleet & SOC Dispatcher'),
('Prima', 'Training Lead'),
('Kudiyanto', 'Account Executive'),
('Aminudin', 'Security Supervisor')
ON CONFLICT DO NOTHING;

-- Insert Sample Cases (14 Data Riil Operasional BAT)
INSERT INTO cases (
    case_id,
    date_reported,
    category_id,
    case_title,
    area_id,
    priority,
    pic_id,
    target_date,
    status,
    progress,
    remarks
) VALUES 
(
    'BAT-2026-001',
    '2026-10-01',
    (SELECT id FROM master_categories WHERE name = 'Operasional' LIMIT 1),
    'Penggantian HT Operasional Rusak (Frekuensi VHF)',
    (SELECT id FROM master_areas WHERE name = 'Malang - KR4' LIMIT 1),
    'High',
    (SELECT id FROM master_pics WHERE name = 'Erlangga' LIMIT 1),
    '2026-10-08',
    'On Progress',
    60,
    '3 unit HT baru sedang dikirim dari vendor lokal Malang. Estimasi tiba besok.'
),
(
    'BAT-2026-002',
    '2026-10-02',
    (SELECT id FROM master_categories WHERE name = 'Manpower' LIMIT 1),
    'Kekurangan Personil Shift 3 Pos Utama',
    (SELECT id FROM master_areas WHERE name = 'Singosari - Artemis' LIMIT 1),
    'High',
    (SELECT id FROM master_pics WHERE name = 'Rokhim' LIMIT 1),
    '2026-10-10',
    'Open',
    25,
    'Koordinasi dengan tim rekrutmen regional, 2 kandidat cadangan sedang proses screening.'
),
(
    'BAT-2026-003',
    '2026-10-03',
    (SELECT id FROM master_categories WHERE name = 'Training & Competency' LIMIT 1),
    'Sertifikasi Damkar Kelas D Personel Regu A',
    (SELECT id FROM master_areas WHERE name = 'Malang' LIMIT 1),
    'Medium',
    (SELECT id FROM master_pics WHERE name = 'Riski Yunani' LIMIT 1),
    '2026-10-15',
    'On Progress',
    75,
    'Pelatihan teori selesai di Dinas Damkar, sisa ujian praktik lapangan minggu ini.'
),
(
    'BAT-2026-004',
    '2026-10-04',
    (SELECT id FROM master_categories WHERE name = 'Administrasi & Billing' LIMIT 1),
    'Penyerahan Hardcopy Laporan MCU Tahunan',
    (SELECT id FROM master_areas WHERE name = 'Jakarta (HO)' LIMIT 1),
    'High',
    (SELECT id FROM master_pics WHERE name = 'Deni Nur' LIMIT 1),
    '2026-10-09',
    'Pending',
    40,
    'Menunggu verifikasi tanda tangan dokter spesialis okupasi dari RS rekanan.'
),
(
    'BAT-2026-005',
    '2026-10-05',
    (SELECT id FROM master_categories WHERE name = 'Equipment & Uniform' LIMIT 1),
    'Distribusi Jaket Patroli & PDL Tambahan',
    (SELECT id FROM master_areas WHERE name = 'Malang' LIMIT 1),
    'Medium',
    (SELECT id FROM master_pics WHERE name = 'Logistik' LIMIT 1),
    '2026-10-12',
    'On Progress',
    80,
    '45 pasang PDL sudah terdistribusi ke pos jaga, tersisa 10 stel ukuran khusus.'
),
(
    'BAT-2026-006',
    '2026-10-06',
    (SELECT id FROM master_categories WHERE name = 'HSE & Compliance' LIMIT 1),
    'Pengadaan APD Safety Vest High-Visibility',
    (SELECT id FROM master_areas WHERE name = 'Semeru' LIMIT 1),
    'Critical',
    (SELECT id FROM master_pics WHERE name = 'HSE' LIMIT 1),
    '2026-10-10',
    'Escalated',
    30,
    'Eskalasi ke Management BAT karena temuan audit kepatuhan zona loading dock.'
),
(
    'BAT-2026-007',
    '2026-10-07',
    (SELECT id FROM master_categories WHERE name = 'Facility & Infrastructure' LIMIT 1),
    'Perbaikan Drainase & Pompa Air Pos Timur',
    (SELECT id FROM master_areas WHERE name = 'Malang Selatan' LIMIT 1),
    'Low',
    (SELECT id FROM master_pics WHERE name = 'Facility' LIMIT 1),
    '2026-10-20',
    'On Progress',
    50,
    'Material pipa PVC dan pompa submersible 1 HP sudah tiba di lokasi pekerjaan.'
),
(
    'BAT-2026-008',
    '2026-10-08',
    (SELECT id FROM master_categories WHERE name = 'HR & Industrial Relation' LIMIT 1),
    'Rekonsiliasi Klaim BPJS RITL Periode Oktober',
    (SELECT id FROM master_areas WHERE name = 'Semua Area' LIMIT 1),
    'Medium',
    (SELECT id FROM master_pics WHERE name = 'HR' LIMIT 1),
    '2026-10-14',
    'Pending',
    20,
    'Menunggu kelengkapan form F1 dari 4 personel yang dirawat jalan.'
),
(
    'BAT-2026-009',
    '2026-10-03',
    (SELECT id FROM master_categories WHERE name = 'Operasional' LIMIT 1),
    'Integrasi Trucking Gate ke SOC Dashboard',
    (SELECT id FROM master_areas WHERE name = 'Karanglo' LIMIT 1),
    'High',
    (SELECT id FROM master_pics WHERE name = 'DJT' LIMIT 1),
    '2026-10-11',
    'On Progress',
    65,
    'API sensor gate barrier berhasil terhubung dengan server SOC central.'
),
(
    'BAT-2026-010',
    '2026-10-02',
    (SELECT id FROM master_categories WHERE name = 'Training & Competency' LIMIT 1),
    'Pelatihan Standards of Business Conduct (SoBC)',
    (SELECT id FROM master_areas WHERE name = 'Semua Area' LIMIT 1),
    'Medium',
    (SELECT id FROM master_pics WHERE name = 'Prima' LIMIT 1),
    '2026-10-25',
    'Open',
    15,
    'Sosialisasi materi batch 1 via webinar telah dikirim ke seluruh supervisor area.'
),
(
    'BAT-2026-011',
    '2026-10-03',
    (SELECT id FROM master_categories WHERE name = 'Client Request' LIMIT 1),
    'Meeting Koordinasi Level 2 (Office Amenity)',
    (SELECT id FROM master_areas WHERE name = 'Jakarta (HO)' LIMIT 1),
    'Low',
    (SELECT id FROM master_pics WHERE name = 'Kudiyanto' LIMIT 1),
    '2026-10-05',
    'Closed',
    100,
    'MoM dan action item disepakati bersama PIC Client BAT. Case closed.'
),
(
    'BAT-2026-012',
    '2026-10-03',
    (SELECT id FROM master_categories WHERE name = 'Manpower' LIMIT 1),
    'Pembentukan Tim RRT / ERT Personel Khusus',
    (SELECT id FROM master_areas WHERE name = 'Malang' LIMIT 1),
    'Critical',
    (SELECT id FROM master_pics WHERE name = 'Aminudin' LIMIT 1),
    '2026-10-18',
    'Escalated',
    20,
    'Menunggu persetujuan anggaran suplemen rompi tactical dari client BAT.'
),
(
    'BAT-2026-013',
    '2026-10-09',
    (SELECT id FROM master_categories WHERE name = 'Operasional' LIMIT 1),
    'Kalibrasi Ulang Sensor CCTV Thermal Perimeter',
    (SELECT id FROM master_areas WHERE name = 'Singosari' LIMIT 1),
    'High',
    (SELECT id FROM master_pics WHERE name = 'Erlangga' LIMIT 1),
    '2026-10-16',
    'Open',
    0,
    'Jadwal kunjungan teknisi vendor diagendakan Kamis pagi.'
),
(
    'BAT-2026-014',
    '2026-10-10',
    (SELECT id FROM master_categories WHERE name = 'Facility & Infrastructure' LIMIT 1),
    'Penggantian Kartu Akses RFID Turnstile Gerbang Utama',
    (SELECT id FROM master_areas WHERE name = 'Karanglo' LIMIT 1),
    'Medium',
    (SELECT id FROM master_pics WHERE name = 'Facility' LIMIT 1),
    '2026-10-13',
    'Closed',
    100,
    '150 kartu RFID telah diprogram ulang dan diserahkan kepada perwakilan user.'
)
ON CONFLICT (case_id) DO UPDATE SET
    date_reported = EXCLUDED.date_reported,
    category_id = EXCLUDED.category_id,
    case_title = EXCLUDED.case_title,
    area_id = EXCLUDED.area_id,
    priority = EXCLUDED.priority,
    pic_id = EXCLUDED.pic_id,
    target_date = EXCLUDED.target_date,
    status = EXCLUDED.status,
    progress = EXCLUDED.progress,
    remarks = EXCLUDED.remarks,
    last_update = NOW();

-- Sinkronisasi sequence counter agar input kasus baru otomatis berlanjut ke nomor berikutnya (BAT-2026-015 dst)
SELECT setval('case_id_seq', (
    SELECT COALESCE(MAX(SUBSTRING(case_id FROM '[0-9]+$')::INT), 0)
    FROM cases
));

