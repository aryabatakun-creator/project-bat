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
    current_yr TEXT := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_val TEXT;
BEGIN
    seq_val := LPAD(NEXTVAL('case_id_seq')::TEXT, 3, '0');
    NEW.case_id := 'BAT-' || current_yr || '-' || seq_val;
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

-- 6. CASE ATTACHMENTS TABLE (Cloudflare R2 Storage Metadata)
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

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_area ON cases(area_id);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category_id);
CREATE INDEX IF NOT EXISTS idx_cases_date_reported ON cases(date_reported);
CREATE INDEX IF NOT EXISTS idx_cases_target_date ON cases(target_date);
CREATE INDEX IF NOT EXISTS idx_case_attachments_case ON case_attachments(case_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_areas ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Allow authenticated read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user update self profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies: MASTER TABLES
-- Semua user terautentikasi bisa membaca master data (untuk dropdown)
CREATE POLICY "Allow authenticated read master_areas" ON master_areas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read master_categories" ON master_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read master_pics" ON master_pics FOR SELECT TO authenticated USING (true);

-- Hanya ADMIN yang boleh mutasi (Insert, Update, Delete) Master Tables
CREATE POLICY "Allow admin manage master_areas" ON master_areas FOR ALL TO authenticated 
    USING (get_user_role() = 'admin');

CREATE POLICY "Allow admin manage master_categories" ON master_categories FOR ALL TO authenticated 
    USING (get_user_role() = 'admin');

CREATE POLICY "Allow admin manage master_pics" ON master_pics FOR ALL TO authenticated 
    USING (get_user_role() = 'admin');

-- Policies: CASES
-- Semua user (Admin, Management, Supervisor) bisa membaca seluruh kasus
CREATE POLICY "Allow authenticated read cases" ON cases FOR SELECT TO authenticated USING (true);

-- Supervisor & Admin boleh input kasus baru
CREATE POLICY "Allow supervisor & admin insert cases" ON cases FOR INSERT TO authenticated 
    WITH CHECK (get_user_role() IN ('admin', 'supervisor'));

-- Supervisor & Admin boleh update status, progress, remarks
CREATE POLICY "Allow supervisor & admin update cases" ON cases FOR UPDATE TO authenticated 
    USING (get_user_role() IN ('admin', 'supervisor'));

-- Hanya ADMIN yang boleh menghapus kasus
CREATE POLICY "Allow admin delete cases" ON cases FOR DELETE TO authenticated 
    USING (get_user_role() = 'admin');

-- Policies: CASE ATTACHMENTS (Cloudflare R2 File Metadata)
CREATE POLICY "Allow authenticated read case_attachments" ON case_attachments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow supervisor & admin insert case_attachments" ON case_attachments FOR INSERT TO authenticated 
    WITH CHECK (get_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Allow supervisor & admin delete case_attachments" ON case_attachments FOR DELETE TO authenticated 
    USING (get_user_role() IN ('admin', 'supervisor'));

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
