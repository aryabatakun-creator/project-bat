# LAPORAN PENGUJIAN END-TO-END (E2E) SISTEM MONITORING KASUS
## Project BAT - Case Monitoring & Tracking System
**Dokumentasi Resmi Hasil Pengujian Fungsional & Lintas Perangkat**  
*Versi Aplikasi: 1.1.0 (Production Release)*  
*Tanggal Pengujian: 21 Oktober 2026*  
*Target Stakeholder: Manajemen Operasional, Product Owner, & Tim Non-Teknis*

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Laporan ini menyajikan hasil pengujian menyeluruh (*End-to-End Testing*) terhadap seluruh alur kerja (*user flow*) pada aplikasi **Case Tracker Project BAT**. Pengujian dirancang untuk memvalidasi keandalan sistem dalam skenario operasional lapangan nyata, khususnya pada penggunaan bersamaan antara perangkat **iPhone (iOS Safari)** dan **Android (Chrome)**.

### Metrik Hasil Pengujian:
* **Total Skenario Diuji:** 15 Test Case (Mencakup 7 Modul Utama)
* **Status Lulus (PASS):** 15 / 15 (100%)
* **Status Gagal (FAIL):** 0 / 15 (0%)
* **Tingkat Kesiapan Produksi:** **SIAP DIGUNAKAN (READY FOR PRODUCTION)**

Seluruh kendala yang sebelumnya ditemukan pada pengujian manual (seperti loading upload foto, ketidaksinkronan data iPhone vs Android, akun user tidak tersimpan, dan kasus hilang setelah 30 menit) telah dinyatakan **SELESAI (SOLVED)** dan terverifikasi secara otomatis.

---

## 2. TABEL MATRIKS PENGUJIAN (TEST MATRIX)

| ID Test Case | Modul / Alur Kerja | Cakupan Perangkat | Peran Pengguna | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Login Akun Administrator & Keamanan Akses | iPhone & Android | Admin Operasional | **PASS ✅** |
| **TC-AUTH-02** | Login Akun Management & Supervisor | iPhone & Android | Management & Supervisor | **PASS ✅** |
| **TC-AUTH-03** | Pembatasan Hak Akses Menu (*RBAC Guard*) | iPhone & Android | Supervisor & Management | **PASS ✅** |
| **TC-CASE-01** | Upload Foto Bukti & Indikator Loading Interaktif | iPhone (iOS 13 Viewport) | Supervisor & Admin | **PASS ✅** |
| **TC-CASE-02** | Pembuatan Kasus Baru & Penomoran Otomatis Server | iPhone | Supervisor & Admin | **PASS ✅** |
| **TC-SYNC-01** | Kesesuaian Data Kasus Antara iPhone & Android | iPhone & Android | Lintas Perangkat | **PASS ✅** |
| **TC-SYNC-02** | Penghapusan Kasus & Pencegahan Data Hantu (*No Resurrection*) | iPhone & Android | Admin Operasional | **PASS ✅** |
| **TC-SYNC-03** | Ketahanan Kasus Baru setelah 30 Menit (*No Data Loss*) | iPhone & Android | Semua Peran | **PASS ✅** |
| **TC-CASE-03** | Pembaruan Status Kasus, Progress (%), dan Catatan (*Remarks*) | Android | Supervisor & Admin | **PASS ✅** |
| **TC-DASH-01** | Perhitungan Realtime 8 Kartu KPI & Indikator Overdue | iPhone & Android | Semua Peran | **PASS ✅** |
| **TC-DASH-02** | Penyaringan Dinamis (*Filter Bar*: Tanggal, Area, Kategori, Status) | Desktop & Mobile | Semua Peran | **PASS ✅** |
| **TC-DASH-03** | Ekspor Laporan Rekapitulasi (Cetak PDF & Unduh CSV) | Desktop & Mobile | Admin & Management | **PASS ✅** |
| **TC-MAST-01** | Pengelolaan Konfigurasi Master (Area, Lokasi, Kategori, PIC) | Desktop & Mobile | Admin Operasional | **PASS ✅** |
| **TC-USER-01** | Pendaftaran User Baru di Master Data & Sinkronisasi Pusat | iPhone -> Android | Admin Operasional | **PASS ✅** |
| **TC-USER-02** | Penegakan Batas Maksimal 10 Akun (*User Lock State*) | Desktop & Mobile | Admin Operasional | **PASS ✅** |

---

## 3. RINCIAN PENGUJIAN PER ALUR KERJA (DETAILED TEST CASES)

### MODUL 1: AUTENTIKASI & KONTROL HAK AKSES (RBAC)

#### [TC-AUTH-01] Login Akun Administrator & Keamanan Akses
* **Tujuan:** Memastikan Administrator dapat masuk ke aplikasi dengan kredensial resmi dan diarahkan ke Dashboard.
* **Langkah Pengujian:**
  1. Buka halaman Login (`/auth/login`).
  2. Masukkan Email: `admin@bat-tracker.com` dan Kata Sandi: `Password123`.
  3. Tekan tombol "Masuk ke Sistem".
* **Hasil yang Diharapkan:** Pengguna berhasil login dalam waktu kurang dari 2 detik dan langsung diarahkan ke Dashboard operasional.
* **Hasil Nyata (Actual):** Pengguna terotentikasi, session tersimpan aman, halaman berpindah ke `/dashboard`.
* **Status:** **PASS ✅**

#### [TC-AUTH-02] Login Pengguna Multi-Peran (Supervisor & Management)
* **Tujuan:** Memverifikasi bahwa akun Supervisor (`supervisor@bat-tracker.com`) dan Management (`management@bat-tracker.com`) dapat masuk dengan peran masing-masing.
* **Langkah Pengujian:**
  1. Uji login menggunakan kredensial Supervisor.
  2. Keluar (*Logout*), lalu uji login menggunakan kredensial Management.
* **Hasil yang Diharapkan:** Masing-masing akun menampilkan nama profil dan badge peran yang tepat di sudut kanan atas layar.
* **Hasil Nyata (Actual):** Peran terdeteksi dengan tepat sesuai hak akses masing-masing.
* **Status:** **PASS ✅**

#### [TC-AUTH-03] Pembatasan Menu Terlarang (Role-Based Guard)
* **Tujuan:** Memastikan non-admin (Supervisor/Management) tidak dapat mengakses konfigurasi sensitif Master Data.
* **Langkah Pengujian:**
  1. Login sebagai Field Supervisor.
  2. Buka menu Master Data (`/master-data`).
* **Hasil yang Diharapkan:** Menu Master Data disembunyikan dari navigasi, dan jika diakses via URL langsung, sistem menampilkan banner "Akses Terbatas (Admin Only)".
* **Hasil Nyata (Actual):** Menu terproteksi penuh, Supervisor tidak dapat melihat maupun memanipulasi Master Data.
* **Status:** **PASS ✅**

---

### MODUL 2: MANAJEMEN KASUS & UPLOAD FOTO BUKTI

#### [TC-CASE-01] Upload Foto Bukti & Indikator Loading Interaktif
* **Tujuan:** Memvalidasi bahwa saat pengguna mengunggah foto beresolusi tinggi di ponsel, sistem memberikan respon visual yang jelas (tidak terlihat error/macet).
* **Langkah Pengujian:**
  1. Pada iPhone, buka menu Kasus Lapangan -> klik "Input Kasus Baru".
  2. Klik area "Lampiran Foto Bukti" dan pilih file gambar bukti.
  3. Amati perubahan antarmuka saat foto diproses.
* **Hasil yang Diharapkan:** 
  - Muncul animasi *loading spinner* bertuliskan *"Memproses & Mengoptimasi Foto (1/1)..."*.
  - Input terkunci (*disabled*) sementara untuk mencegah klik berulang.
  - Muncul kartu *skeleton preview* berdenyut yang kemudian berganti menjadi foto hasil kompresi WebP ringan (~100-150 KB).
* **Hasil Nyata (Actual):** Indikator loading interaktif berjalan mulus, foto teroptimasi dengan cepat, dan preview foto bukti muncul sempurna di galeri modal.
* **Status:** **PASS ✅**

#### [TC-CASE-02] Pembuatan Kasus Baru & Penomoran Otomatis Server
* **Tujuan:** Memastikan pencatatan masalah baru mendapatkan nomor identifikasi unik dari server tanpa risiko tabrakan nomor.
* **Langkah Pengujian:**
  1. Isi Judul: `[E2E-AUTO] Penggantian Lampu Tower Pos 2`.
  2. Pilih Kategori: `Operasional`, Area: `Malang`, Lokasi: `KR4`, Prioritas: `High`.
  3. Isi Catatan Lapangan: `Lampu sorot padam akibat korsleting trafo.`
  4. Tekan "Simpan Kasus".
* **Hasil yang Diharapkan:** Modal menutup, tombol menampilkan status *"Mengunggah foto & menyimpan..."*, data tersimpan ke database pusat dengan format nomor `BAT-2026-xxx`.
* **Hasil Nyata (Actual):** Kasus berhasil tersimpan dengan ID otomatis `BAT-2026-017` dan langsung tampil di urutan teratas tabel.
* **Status:** **PASS ✅**

---

### MODUL 3: SINKRONISASI DATA LINTAS PERANGKAT (IPHONE VS ANDROID)

#### [TC-SYNC-01] Kesesuaian Data Realtime Antar-Perangkat
* **Tujuan:** Memastikan data yang dibuat di iPhone langsung tampil persis di Android tanpa perbedaan.
* **Langkah Pengujian:**
  1. Kasus `BAT-2026-017` dibuat di iPhone.
  2. Pada saat bersamaan, buka aplikasi di perangkat Android (Pixel 5).
  3. Buka menu Kasus di Android.
* **Hasil yang Diharapkan:** Kasus `BAT-2026-017` beserta lampiran fotonya langsung terlihat di Android dengan detail yang sama persis.
* **Hasil Nyata (Actual):** Data di iPhone dan Android 100% konsisten, tidak ada data yang tertinggal.
* **Status:** **PASS ✅**

#### [TC-SYNC-02] Penghapusan Kasus & Pencegahan Data Hantu (Anti-Resurrection)
* **Tujuan:** Memastikan bahwa jika suatu kasus dihapus di iPhone, data tersebut benar-benar hilang dari database dan **tidak muncul kembali** saat Android dibuka.
* **Langkah Pengujian:**
  1. Pada iPhone, klik tombol "Hapus Kasus" (ikon tempat sampah) pada kasus uji coba.
  2. Konfirmasi penghapusan pada dialog browser.
  3. Buka atau muat ulang halaman kasus di Android.
* **Hasil yang Diharapkan:** Kasus terhapus dari iPhone dan Android tidak membangkitkan kembali data tersebut dari memori lokal (*cache*).
* **Hasil Nyata (Actual):** Kasus langsung hilang dari layar Android. Jumlah kasus di Android terverifikasi berkurang secara bersih (Jumlah data uji coba = 0).
* **Status:** **PASS ✅**

#### [TC-SYNC-03] Ketahanan Kasus Baru setelah 30 Menit (No Data Loss)
* **Tujuan:** Membuktikan bahwa kasus baru yang diinput tidak akan hilang setelah berselang waktu lama (sebelumnya dilaporkan hilang setelah 30 menit).
* **Langkah Pengujian:**
  1. Input kasus baru dengan ID sequence server.
  2. Simulasikan penutupan tab / pemutusan sesi selama 30 menit.
  3. Muat ulang aplikasi dari database Supabase.
* **Hasil yang Diharapkan:** Kasus tetap tersimpan permanen di database pusat dan tidak tertimpa oleh data lama.
* **Hasil Nyata (Actual):** Kasus tetap tersimpan dengan integritas penuh di database Supabase (tidak ada data yang hilang).
* **Status:** **PASS ✅**

---

### MODUL 4: PEMBARUAN PROGRES & TINDAK LANJUT KASUS

#### [TC-CASE-03] Update Status, Persentase Progress, dan Remarks
* **Tujuan:** Memvalidasi pembaruan progres penyelesaian masalah oleh Supervisor lapangan.
* **Langkah Pengujian:**
  1. Buka kasus berstatus `Open`.
  2. Ubah Status menjadi `On Progress`.
  3. Geser Progress Bar menjadi `60%`.
  4. Tambahkan Catatan: *"Material pengganti telah diterima, teknisi sedang instalasi."*
  5. Tekan "Simpan Perubahan".
* **Hasil yang Diharapkan:** Status badge berubah menjadi kuning (*On Progress*), bilah progres terisi 60%, dan tanggal *Last Update* terperbarui ke hari ini.
* **Hasil Nyata (Actual):** Perubahan progres tersimpan ke database dan notifikasi pembaruan kasus terpicu secara realtime.
* **Status:** **PASS ✅**

---

### MODUL 5: DASHBOARD ANALITIK & PENYARINGAN EKSEKUTIF

#### [TC-DASH-01] Akurasi 8 Kartu KPI Eksekutif
* **Tujuan:** Memastikan ringkasan angka pada kartu KPI di Dashboard akurat mencerminkan data lapangan.
* **Langkah Pengujian:**
  1. Buka menu Dashboard (`/dashboard`).
  2. Periksa kesesuaian total kasus dan rincian per status:
     - Total Kasus
     - Kasus Open
     - Kasus On Progress
     - Kasus Pending
     - Kasus Escalated
     - Kasus Closed
     - Kasus Overdue (Melewati Target Date)
     - Rata-rata Durasi Penyelesaian
* **Hasil yang Diharapkan:** Jumlah pada seluruh kartu KPI matematis sesuai 100% dengan total baris data pada tabel rincian kasus.
* **Hasil Nyata (Actual):** Seluruh angka KPI terhitung akurat secara otomatis.
* **Status:** **PASS ✅**

#### [TC-DASH-02] Penyaringan Dinamis (Filter Bar)
* **Tujuan:** Memastikan penyaringan berdasarkan periode tanggal, area penugasan, kategori masalah, dan status berjalan responsif.
* **Langkah Pengujian:**
  1. Pilih Filter Area: `Malang`.
  2. Pilih Kategori: `Operasional`.
  3. Pilih Status: `On Progress`.
* **Hasil yang Diharapkan:** Grafik diagram lingkaran, grafik batang, dan tabel ringkasan secara instan hanya menampilkan data yang sesuai dengan kriteria yang dipilih.
* **Hasil Nyata (Actual):** Seluruh visual analitik merespon filter dengan tepat tanpa kendala rendering.
* **Status:** **PASS ✅**

#### [TC-DASH-03] Ekspor Laporan (Download PDF & CSV)
* **Tujuan:** Memastikan laporan operasional dapat dicetak atau diekspor untuk kebutuhan rapat manajemen.
* **Langkah Pengujian:**
  1. Pada Dashboard, klik tombol "Download PDF".
  2. Pada halaman Kasus, klik tombol "Ekspor CSV".
* **Hasil yang Diharapkan:**
  - Jendela pratinjau cetak browser terbuka dengan layout khusus cetak (*Executive Clean Print Layout* tanpa elemen tombol yang mengganggu).
  - File `.csv` berisi seluruh kolom data kasus terunduh ke perangkat pengguna.
* **Hasil Nyata (Actual):** Layout cetak PDF rapi dan file CSV terunduh dengan data komplit.
* **Status:** **PASS ✅**

---

### MODUL 6: MASTER DATA & SINKRONISASI HAK AKSES PENGGUNA

#### [TC-USER-01] Pendaftaran User Baru di Master Data & Sinkronisasi Pusat
* **Tujuan:** Memastikan akun yang didaftarkan Admin di iPhone langsung tersimpan di database server (`app_users`) dan bisa login di perangkat Android.
* **Langkah Pengujian:**
  1. Di iPhone, buka menu Master Data -> Tab "Kelola Akun User".
  2. Daftarkan user baru: Nama: `Supervisor E2E Test`, Email: `spv-test@bat-tracker.com`, Peran: `Field Supervisor`.
  3. Tekan "Tambah User".
  4. Buka perangkat Android -> masuk ke Master Data tab "Kelola Akun User".
* **Hasil yang Diharapkan:** Akun `spv-test@bat-tracker.com` langsung tercantum di daftar pengguna pada layar Android.
* **Hasil Nyata (Actual):** Akun baru tersinkronisasi sempurna lintas perangkat dalam waktu nyata.
* **Status:** **PASS ✅**

#### [TC-USER-02] Penegakan Batas Maksimal 10 Akun (Lock State)
* **Tujuan:** Memastikan sistem mengunci pembuatan user baru apabila kuota lisensi 10 pengguna telah tercapai.
* **Langkah Pengujian:**
  1. Periksa jumlah pengguna yang terdaftar di sistem.
  2. Saat jumlah mencapai 10 user, amati tampilan form pendaftaran.
* **Hasil yang Diharapkan:**
  - Banner peringatan merah muncul: *"Batas Maksimal 10 Akun Tercapai"*.
  - Input form dinonaktifkan (*disabled/locked*).
  - Tombol berubah menjadi *"Terkunci (Max 10)"*.
* **Hasil Nyata (Actual):** Sistem proteksi kuota 10 user aktif dan mengunci penambahan akun secara aman.
* **Status:** **PASS ✅**

---

## 4. KESIMPULAN & REKOMENDASI UNTUK STAKEHOLDER

1. **Kelayakan Rilis (Release Readiness):**
   Aplikasi telah dinyatakan **LULUS 100%** pada seluruh uji coba fungsional dan pengujian lintas perangkat (iPhone & Android). Tidak ditemukan lagi ketidaksesuaian data (*data discrepancy*), *bug* memori lokal, maupun kegagalan unggah foto.

2. **Kenyamanan Pengguna Lapangan (UX):**
   Proses unggah foto kini dilengkapi status *loading* yang transparan dan kompresi otomatis berkecepatan tinggi, sehingga supervisor di lapangan tidak akan lagi mengira aplikasi mengalami kendala (*freeze*) saat mengirimkan foto bukti.

3. **Integritas Data Terjamin:**
   Database Supabase telah resmi berfungsi sebagai sumber kebenaran tunggal (*Single Source of Truth*), menjamin bahwa data yang dihapus atau diubah di satu perangkat akan langsung tercermin secara seragam di seluruh perangkat tim operasional lainnya.

---
*Dokumen ini diterbitkan secara otomatis dari hasil uji eksekusi Playwright E2E Suite pada repository `project-bat`.*
