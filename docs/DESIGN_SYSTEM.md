# Dashboard Design System Guide
**Project:** Operational Case & Follow-Up Tracker System (Project BAT)  
**Theme:** Enterprise Corporate Dark Blue & Clean Light Grid  
**Version:** 1.1.0  

---

## 1. Color Palette & Theming

### Primary & Layout Surfaces
* **Header / Top Bar**: `#0F172A` (Slate 900) dengan aksen pita emas `#F59E0B` / `#D97706`.
* **Sidebar Background**: `#0F172A` (Slate 900)
* **Sidebar Active Item**: `#1E293B` (Slate 800) dengan border accent kiri `#38BDF8` (Sky 400).
* **Sidebar Text Inactive**: `#94A3B8` (Slate 400) | **Active Text**: `#FFFFFF` (White).
* **App Body Background**: `#F8FAFC` (Slate 50).
* **Card & Container Background**: `#FFFFFF` (White).
* **Dividers & Borders**: `#E2E8F0` (Slate 200).

### Status Indicators (KPI Cards & Table Badges)
| Status | Hex Code | Tailwind Badge Class | Badge Light BG |
| :--- | :--- | :--- | :--- |
| **Open** | `#EF4444` (Red 500) | `bg-red-100 text-red-700 border-red-200` | `#FEE2E2` |
| **On Progress** | `#F59E0B` (Amber 500) | `bg-amber-100 text-amber-800 border-amber-200` | `#FEF3C7` |
| **Pending** | `#64748B` (Slate 500) | `bg-slate-100 text-slate-700 border-slate-200` | `#F1F5F9` |
| **Escalated** | `#F97316` (Orange 500) | `bg-orange-100 text-orange-800 border-orange-200` | `#FFEDD5` |
| **Closed** | `#10B981` (Emerald 500) | `bg-emerald-100 text-emerald-800 border-emerald-200` | `#D1FAE5` |
| **Overdue** | `#991B1B` (Red 800) | `bg-red-100 text-red-900 border-red-300` | `#FEE2E2` |

### Priority Levels
* **Critical**: Background `#7F1D1D` (Dark Red), Text `#FFFFFF`
* **High**: Background `#EF4444` (Red), Text `#FFFFFF`
* **Medium**: Background `#F59E0B` (Amber/Yellow), Text `#1E293B`
* **Low**: Background `#10B981` (Green), Text `#FFFFFF`

---

## 2. Typography & Iconography
* **Font Family**: Inter, Plus Jakarta Sans, atau default sans system.
* **Top Bar Title**: `text-lg font-bold tracking-tight text-white`
* **Section / Card Title**: `text-xs font-semibold uppercase tracking-wider text-slate-500`
* **KPI Number Metric**: `text-2xl font-extrabold text-slate-900`
* **Table Header & Data Text**: `text-xs font-medium text-slate-700`
* **Icons**: Lucide React (`LayoutDashboard`, `ClipboardList`, `Database`, `AlertTriangle`, `Clock`, `CheckCircle2`, `TrendingUp`, `UserCheck`).

---

## 3. UI Component Layout Specifications

### 3.1 Sidebar Navigation
* Posisi: Fixed kiri (lebar 64 / 16rem / 256px).
* Struktur Menu:
  1. `Dashboard Monitoring` (Icon: `LayoutDashboard`) -> Link: `/dashboard`
  2. `Case Monitoring` (Icon: `ClipboardList`) -> Link: `/cases`
  3. `Master Data` (Icon: `Database`) -> Link: `/master-data` *(Hanya tampil jika role = `admin`)*
* Bagian Bawah: Profil user, badge role (Admin / Management / Supervisor), dan tombol Logout.

### 3.2 Top Header Branding
* Header bergaya corporate dark blue (`#0F172A`) dengan:
  * Kiri: Logo Nawakara Perkasa Nusantara + Title & Subtitle.
  * Kanan: Aksen pita diagonal (Gold & Navy) + Logo BAT - A Better Tomorrow.

### 3.3 Global Filter Bar
* Kontainer putih dengan border `border-slate-200` rounded-lg.
* Komponen:
  * Datepicker range (`Periode Monitoring`).
  * Dropdown `Project` (Default: Project BAT).
  * Dropdown `Area / Lokasi` (Semua Area, Malang, Singosari, dll).
  * Dropdown `Kategori` (Semua Kategori, Operasional, Manpower, dll).
  * Dropdown `Status` (Semua Status, Open, On Progress, dll).
  * Indikator `Last Updated` (Icon Calendar & Clock).

### 3.4 Summary Cards (8-Grid KPI Row)
* 8 Card dalam 1 baris grid responsif (`grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3`).
* Masing-masing card memiliki icon di kiri atas, label metrik, dan angka KPI tebal di tengah.

### 3.5 Charts & Visual Analytics (4 Grid)
* **Status Case**: Bar Chart vertikal dengan warna masing-masing status.
* **Kategori Case**: Donut / Pie chart persentase kategori dengan legend count.
* **Prioritas Case**: Pie / Donut chart distribusi tingkat urgensi (Critical, High, Medium, Low).
* **Case by Area**: Horizontal Bar Chart per wilayah operasional.

### 3.6 Data Table Styling
* Header tabel berwarna **Dark Navy (`#1E293B`)** dengan teks putih/terang.
* Alternate row hover effect: `hover:bg-slate-50`.
* **Progress Bar Component**:
  * Lebar 60-80px dengan rounded full.
  * `< 30%` : Background Merah (`bg-red-500`)
  * `30% - 70%`: Background Kuning (`bg-amber-500`)
  * `> 70%` : Background Hijau (`bg-emerald-500`)
