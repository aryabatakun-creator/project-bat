# Technical Requirement Document (TRD)
**Project Name:** Operational Case & Follow-Up Tracker System (Project BAT)  
**Version:** 1.1.0  
**Tech Stack:** Next.js (App Router, TypeScript) + Supabase + Tailwind CSS + Vercel  
**Deployment Target:** Vercel (Production & Preview)  

---

## 1. System Architecture & Component Hierarchy

```text
[ Client Browser ]
       │ (HTTPS / Realtime)
       ├─────────────────────────────────────────┐
       ▼                                         ▼ (Direct Upload via Presigned URL)
[ Vercel CDN & Edge Middleware ]          [ Cloudflare R2 Storage ]
       │ (Authentication & Role Guard)          │ (Evidence Photos / WebP 150-250KB)
       ▼                                         │
[ Next.js App Router (Server & Client) ]         │
 ├── /dashboard      -> Visual Analytics         │
 ├── /cases          -> Case List, Modal, Photos │
 ├── /master-data    -> Master Setup (Admin)     │
 └── /auth/login     -> Supabase Auth Login      │
       │                                         │
       ▼ (Server Actions / Supabase SSR Client)  ▼ (Read CDN URL)
[ Supabase BaaS (PostgreSQL) ] ◄─────────────────┘
 ├── Auth Layer      -> User identities & session tokens
 ├── Profiles Table  -> User RBAC Roles (admin, management, supervisor)
 ├── Main Tables     -> cases, master_*, case_attachments (Photo Metadata)
 ├── Database RLS    -> Row Level Security enforcing read/write permissions
 └── DB Triggers     -> Atomic Case ID generator (BAT-YYYY-001) & last_update
```

---

## 2. Technology Stack & Libraries

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | Next.js 14/15 (App Router, React 19) | Server Components untuk rendering cepat & Server Actions untuk mutasi data |
| **Language** | TypeScript | Strict type checking untuk konsistensi skema data |
| **Styling** | Tailwind CSS + Lucide React | Utility-first CSS dengan palet Enterprise Slate/Navy |
| **UI Components** | Shadcn UI (Radix UI) | Dialog, Select, Dropdown, Tabs, Badge, Progress Bar, Popover |
| **Charts / Visuals** | Recharts | Bar Chart, Donut/Pie Chart, Horizontal Bar Chart |
| **Database & Auth** | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | PostgreSQL, Row Level Security, Auth Session cookies |
| **Object Storage** | Cloudflare R2 (`@aws-sdk/client-s3`) | S3-compatible, 10 GB Free tier, $0 egress bandwidth |
| **Image Compression** | `browser-image-compression` | Kompresi WebP di browser (resize max 1280px, ~200 KB) |
| **Validation** | Zod + React Hook Form | Type-safe form validation di client dan server |
| **Deployment** | Vercel | Auto CI/CD terintegrasi dengan GitHub branch |

---

## 3. RBAC & Route Protection Implementation

### 3.1 Role Hierarchy & Permissions
1. **admin**:
   * Akses penuh ke semua route (`/dashboard`, `/cases`, `/master-data`).
   * Akses mutasi penuh (INSERT, UPDATE, DELETE) pada semua tabel.
2. **management**:
   * Akses route `/dashboard` dan `/cases`.
   * Akses mutasi: Ditolak (Read Only).
   * Akses route `/master-data`: Diredirect ke `/dashboard` dengan notifikasi Unauthorized.
3. **supervisor**:
   * Akses route `/dashboard` dan `/cases`.
   * Akses mutasi: Boleh INSERT case baru dan UPDATE status/progress/remarks. Dilarang DELETE case.
   * Akses route `/master-data`: Diredirect ke `/dashboard` dengan notifikasi Unauthorized.

### 3.2 Next.js Middleware Protection Pattern
Middleware (`middleware.ts`) membaca cookie sesi Supabase dan memverifikasi role dari tabel `profiles`:
```typescript
// Pseudocode Middleware Route Guard
export async function middleware(req: NextRequest) {
  const { user, role } = await getSessionUser(req);
  const path = req.nextUrl.pathname;

  if (!user && path !== '/auth/login') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (path.startsWith('/master-data') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return NextResponse.next();
}
```

---

## 4. Master Data Seed Reference (Berdasarkan Dashboard Asli)

### 4.1 Master Kategori Case
1. `Operasional`
2. `Manpower`
3. `HR & Industrial Relation`
4. `Equipment & Uniform`
5. `Administrasi & Billing`
6. `Training & Competency`
7. `HSE & Compliance`
8. `Facility & Infrastructure`
9. `Client Request`

### 4.2 Master Area / Lokasi
1. `Malang`
2. `Malang - KR4`
3. `Malang Selatan`
4. `Singosari`
5. `Singosari - Artemis`
6. `Jakarta (HO)`
7. `Karanglo`
8. `Semeru`

---

## 5. Business Logic & Calculations

### 5.1 Atomic Case ID Generation
Format: `BAT-{YYYY}-{0001}` (contoh: `BAT-2026-001` atau `BAT-2026-0001`).
* Dikelola langsung melalui PostgreSQL Trigger & Sequence untuk mencegah *race condition* dan duplikasi ID.

### 5.2 Dynamic Overdue Calculation
Kasus dihitung sebagai `Overdue` secara komputasi (bukan hardcoded di database):
$$\text{is\_overdue} = (\text{status} \neq \text{'Closed'}) \quad \text{AND} \quad (\text{target\_date} < \text{CURRENT\_DATE})$$

### 5.3 KPI & Closure Rate Formula
* $\text{Total Cases} = \sum \text{Cases matching active filters}$
* $\text{Open} = \text{Count}(\text{status} = \text{'Open'})$
* $\text{On Progress} = \text{Count}(\text{status} = \text{'On Progress'})$
* $\text{Pending} = \text{Count}(\text{status} = \text{'Pending'})$
* $\text{Escalated} = \text{Count}(\text{status} = \text{'Escalated'})$
* $\text{Closed} = \text{Count}(\text{status} = \text{'Closed'})$
* $\text{Overdue} = \text{Count}(\text{is\_overdue} = \text{true})$
* $\text{Closure Rate (\%)} = \left( \frac{\text{Closed}}{\text{Total Cases}} \right) \times 100$

---

## 6. Photo Storage & Evidence Upload Workflow

```text
[ User Selects Image ]
        │
        ▼ (Client-Side Compression)
[ browser-image-compression ]
  - Max resolution: 1280px
  - Format: WebP (quality: 0.8)
  - Size reduction: ~5MB -> ~200KB
        │
        ▼
[ Next.js Server Action: getR2UploadPresignedUrl ]
  - Generate S3 PutObjectCommand presigned URL
        │
        ▼ (Direct PUT upload)
[ Cloudflare R2 Bucket ]
  - File stored under: /cases/{case_id}/{timestamp}_{filename}.webp
        │
        ▼ (Insert Metadata via Server Action)
[ Supabase: case_attachments table ]
  - Records: case_id, file_url, file_name, file_size_kb, uploaded_by
```

---

## 7. Environment Variables Configuration

File `.env.local` pada project lokal dan Vercel Environment Variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Cloudflare R2 Storage (S3-Compatible)
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_ACCESS_KEY_ID=<your-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
R2_BUCKET_NAME=project-bat-attachments
NEXT_PUBLIC_R2_PUBLIC_URL=https://<your-custom-or-r2-public-domain>
```
*(Catatan: `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di server actions jika diperlukan operasi administrative tanpa batas RLS).*
