# Product Requirement Document (PRD)
**Project Name:** Operational Case & Follow-Up Tracker System (Project BAT)  
**Version:** 1.1.0  
**Status:** Approved / Ready for Development  

---

## 1. Executive Summary
Sistem **Case Monitoring & Follow-Up Tracker (Project BAT)** adalah aplikasi web operasional berbasis *dashboard* analitik dan sistem pencatatan kasus (*cases/issues*) perusahaan secara real-time. Sistem ini memfasilitasi monitoring, evaluasi, eskalasi, dan tindakan korektif (*Monitoring, Evaluation, Escalation & Corrective Action*) dengan kolaborasi multi-role.

---

## 2. User Roles & Hak Akses (3 POV Akses User)

Sistem membedakan hak akses dan menu secara tegas menjadi 3 tingkatan pengguna:

### 2.1 Role Personas
1. **Admin**: Bertanggung jawab atas pengelolaan konfigurasi master data (Area, Kategori, PIC), administrasi user, serta memiliki kontrol penuh (CRUD) terhadap seluruh kasus.
2. **Management / Executive**: Bertanggung jawab atas pengawasan performa tingkat tinggi (*High-Level KPI*), tren operasional, dan kepatuhan penyelesaian (*Closure Rate*). Akses bersifat **Read-Only**.
3. **Supervisor / Area Manager**: Bertanggung jawab atas pencatatan kasus baru (*Create*), memantau daftar kasus wilayahnya (*Read*), dan memperbarui *progress*, status, serta catatan tindak lanjut (*Update*). Tidak memiliki wewenang menghapus kasus (*Delete*) maupun mengelola master data.

### 2.2 Matriks Hak Akses (RBAC Matrix)

| Modul / Fitur | Admin | Management | Supervisor |
| :--- | :---: | :---: | :---: |
| **Sidebar Menu: Dashboard Monitoring** | **Read** (Full Access) | **Read** (Full Access) | **Read** (Full Access) |
| **Sidebar Menu: Case Monitoring** | **CRUD** (Create, Read, Update, Delete) | **Read Only** (View & Filter) | **CRU** (Create, Read, Update - *No Delete*) |
| **Sidebar Menu: Master Data (Area, Kategori, PIC)** | **CRUD** | *Hidden / No Access* | *Hidden / No Access* |
| **Input Kasus Baru (Modal / Form)** | ✅ Ya | ❌ Tidak | ✅ Ya |
| **Update Progress & Remarks Kasus** | ✅ Ya | ❌ Tidak | ✅ Ya |
| **Hapus Kasus (Delete)** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Export Data (Excel / CSV)** | ✅ Ya | ✅ Ya | ✅ Ya |

---

## 3. Information Architecture & Sidebar Navigation

Aplikasi menggunakan layout **Sidebar Navigation** di sebelah kiri (Dark Navy theme) dengan konten utama di sebelah kanan:

```text
┌─────────────────┬────────────────────────────────────────────────────────────┐
│   SIDEBAR       │  TOP HEADER (Branding Nawakara Perkasa Nusantara & BAT)    │
│                 ├────────────────────────────────────────────────────────────┤
│ [📊 Dashboard]  │  GLOBAL FILTER BAR (Periode, Project, Area, Kategori, dsb) │
│ [📋 Case List]  │                                                            │
│ [⚙️ Master Data] │  MAIN CONTENT AREA                                         │
│   (Admin only)  │  - Dashboard View (KPI Cards, Charts, Summary Table)       │
│                 │  - Case Monitoring View (Full Interactive Data Table)      │
│ [👤 User Profile│  - Master Data View (Tabs: Areas, Categories, PICs)        │
│    & Logout]    │                                                            │
└─────────────────┴────────────────────────────────────────────────────────────┘
```

1. **Dashboard Monitoring (`/dashboard`)**:
   * Menampilkan header branding, global filter bar, 8 KPI cards, 4 visual charts, dan ringkasan tabel kasus terbaru.
2. **Case Monitoring (`/cases`)**:
   * Tampilan khusus operasional dengan filter lanjutan, pencarian judul/case ID, sorting kolom, pagination, serta aksi modal input/edit kasus.
3. **Master Data (`/master-data`)** *(Hanya tampil dan dapat diakses oleh Admin)*:
   * **Tab 1 - Master Area / Lokasi**: Tambah/edit/hapus lokasi (Malang, Singosari, Jakarta HO, Karanglo, Semeru, Malang Selatan, dsb).
   * **Tab 2 - Master Kategori Case**: Tambah/edit/hapus kategori (Operasional, Manpower, HSE, Training, dsb).
   * **Tab 3 - Master PIC**: Tambah/edit/hapus Person In Charge beserta email dan jabatan/departemen.

---

## 4. Core Features & Specifications

### 4.1 Top Header & Branding
* **Header Kiri**: Logo & Nama Organisasi *"NAWAKARA PERKASA NUSANTARA"*, Judul *"PROJECT BAT - CASE MONITORING & FOLLOW-UP TRACKER"*, dan Subjudul *"Monitoring, Evaluation, Escalation & Corrective Action"*.
* **Header Kanan**: Logo *"BAT - A Better Tomorrow"* dengan aksen grafis pita diagonal (Dark Navy & Gold Accent).

### 4.2 Global Filter Bar
Terletak di bagian atas dashboard untuk menyaring seluruh metrik, chart, dan data tabel:
* **Periode Monitoring**: Datepicker range (Start Date s/d End Date).
* **Project**: Dropdown pilihan project (Default: `Project BAT`).
* **Area / Lokasi**: Dropdown filter area (Default: `Semua Area`).
* **Kategori**: Dropdown filter kategori (Default: `Semua Kategori`).
* **Status**: Dropdown filter status (Default: `Semua Status`).
* **Last Updated Indicator**: Label tanggal & waktu pembaruan data terakhir (e.g., `06/10/2026 14:32`).

### 4.3 Key Performance Indicators (8-Grid KPI Cards)
8 kartu ringkasan metrik real-time:
1. **Total Case**: Total keseluruhan kasus dalam filter (Warna Navy Blue `#0F172A`).
2. **Open**: Kasus baru yang belum ditangani (Warna Merah `#EF4444`).
3. **On Progress**: Kasus yang sedang dalam proses penanganan (Warna Kuning/Amber `#F59E0B`).
4. **Pending**: Kasus tertunda / menunggu respon pihak ketiga (Warna Slate Gray `#64748B`).
5. **Escalated**: Kasus mendesak yang dinaikkan ke level manajemen (Warna Oranye `#F97316`).
6. **Closed**: Kasus yang telah tuntas terselesaikan (Warna Hijau `#10B981`).
7. **Overdue**: Kasus yang melewati target date dan belum Closed (Warna Dark Red `#991B1B`).
8. **Closure Rate (%)**: Rasio penyelesaian `(Closed / Total Case) * 100` dengan visualisasi mini donut ring.

### 4.4 Visual Analytics & Charts
1. **Status Case**: Bar Chart vertikal dengan label angka di atas setiap bar status.
2. **Kategori Case**: Donut / Pie Chart dengan legend persentase dan daftar count per kategori.
3. **Prioritas Case**: Donut / Ring Chart tingkat urgensi (*Critical, High, Medium, Low*).
4. **Case by Area**: Horizontal Bar Chart persebaran kasus per wilayah operasional.

### 4.5 Data Table Specifications
Kolom tabel sesuai standar operasional:
1. `No.` (Index penomoran)
2. `Case ID` (Auto-generated format: `BAT-2026-XXX`)
3. `Date Reported` (Format DD/MM/YYYY)
4. `Category` (Badge warna sesuai kategori)
5. `Case Title` (Nama/deskripsi singkat kasus)
6. `Location / Area` (Lokasi spesifik)
7. `Priority` (Badge: Critical [Merah Tua], High [Merah], Medium [Kuning], Low [Hijau])
8. `PIC` (Nama penanggung jawab)
9. `Target Date` (Format DD/MM/YYYY)
10. `Status` (Badge status: Open, On Progress, Pending, Escalated, Closed)
11. `Progress` (Horizontal bar + persentase 0-100%)
12. `Last Update` (Format DD/MM/YYYY)
13. `Remarks` (Catatan tindak lanjut terkini)
14. `Actions` (Tombol View Detail, Edit [Admin/Supervisor], Delete [Admin])

### 4.6 Case Input & Edit Modal Form
* **Field Input Baru (Supervisor & Admin)**:
  * Project (Pilihan default `Project BAT`)
  * Date Reported (Default: Hari ini)
  * Kategori (Pilih dari Master Kategori)
  * Case Title (Text input)
  * Location / Area (Pilih dari Master Area)
  * Priority (Critical / High / Medium / Low)
  * PIC (Pilih dari Master PIC)
  * Target Date (Datepicker)
  * Remarks Awal (Textarea)
* **Field Update Kasus (Supervisor & Admin)**:
  * Status (Open / On Progress / Pending / Escalated / Closed)
  * Progress Slider (0% - 100%)
  * Update Remarks / Log Catatan Tambahan
  * Upload Foto Bukti Tindak Lanjut / Penyelesaian

### 4.7 Photo Attachment & Evidence Management (Cloudflare R2 + Web Compression)
* **Kebutuhan Bisnis**: Setiap kasus dapat dilampirkan 1 atau lebih foto bukti masalah awal (*initial condition*) dan bukti hasil penanganan (*completion evidence*).
* **Auto-Compress di Sisi Client (Browser)**:
  * Sebelum file diunggah ke storage, foto dari kamera/galeri dikompresi otomatis di browser via Web Worker.
  * Target format: **WebP**, resolusi maksimal `1280px` (aspect ratio dipertahankan), kualitas 75-80%.
  * Ukuran rata-rata file ditekan dari 4-8 MB menjadi **150-250 KB**.
* **Storage Provider**: **Cloudflare R2** (S3-compatible, 10 GB Free Tier per bulan, $0 Egress/Bandwidth biaya).
* **Metadata Attachment di Database**: URL foto publik/CDN, nama file, ukuran (KB), MIME type, dan user pengunggah dicatat pada tabel `case_attachments`.
* **Tampilan UI**: Thumbnail foto interaktif dengan modal preview / lightbox pembesar gambar saat diklik di halaman detail kasus.
