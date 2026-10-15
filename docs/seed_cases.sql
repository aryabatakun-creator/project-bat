-- ====================================================================
-- PROJECT BAT - SAMPLE SEED DATA UNTUK TABEL CASES
-- Version: 1.1.0
-- ====================================================================
-- Petunjuk:
-- Jalankan skrip ini di Supabase SQL Editor setelah Anda menjalankan
-- skrip schema.sql. Skrip ini akan mengaktifkan policy akses baca
-- untuk anon (frontend) dan memasukkan 14 data riil operasional Project BAT.
-- ====================================================================

-- 1. Pastikan Policy RLS mengizinkan SELECT untuk anon (Frontend Dashboard)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Allow anon read cases'
    ) THEN
        CREATE POLICY "Allow anon read cases" ON cases FOR SELECT TO anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'master_areas' AND policyname = 'Allow anon read master_areas'
    ) THEN
        CREATE POLICY "Allow anon read master_areas" ON master_areas FOR SELECT TO anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'master_categories' AND policyname = 'Allow anon read master_categories'
    ) THEN
        CREATE POLICY "Allow anon read master_categories" ON master_categories FOR SELECT TO anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'master_pics' AND policyname = 'Allow anon read master_pics'
    ) THEN
        CREATE POLICY "Allow anon read master_pics" ON master_pics FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- 2. Insert Sample Cases (14 Data Riil Operasional BAT)
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

-- 3. Sinkronisasi sequence counter agar input kasus baru otomatis berlanjut ke nomor berikutnya (BAT-2026-015 dst)
SELECT setval('case_id_seq', (
    SELECT COALESCE(MAX(SUBSTRING(case_id FROM '[0-9]+$')::INT), 0)
    FROM cases
));
