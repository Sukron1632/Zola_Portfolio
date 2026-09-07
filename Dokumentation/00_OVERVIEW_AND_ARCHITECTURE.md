# 00 — Ikhtisar Sistem & Arsitektur Global

> **Dokumen**: `Dokumentation/00_OVERVIEW_AND_ARCHITECTURE.md`  
> **Pemilik Portofolio**: Zola Dimas Firmansyah  
> **Spesialisasi**: Systems Architect, Backend Engineer, Analisis Sistem (UML/SRS), Optimasi PostgreSQL  

---

## 1. Visi & Tujuan Sistem

Sistem ini dibangun untuk memenuhi dua kebutuhan vital:
1. **Etalase Publik Berperforma Tinggi (Public Portfolio)**:
   * Menampilkan kompetensi arsitektur teknis Zola Dimas Firmansyah, sertifikasi resmi BNSP, rekam jejak magang Diskominfo DIY (optimasi latensi query 42%), serta sistem perangkat lunak skala enterprise (seperti *Sistem Manajemen Aset Multi-Hotel*).
   * Menawarkan pengalaman pengguna yang instan, elegan, dan profesional berstandar modern (*Obsidian Precision Dark Theme*).
2. **Content Management System (CMS) Terproteksi**:
   * Memungkinkan admin memperbarui data biodata profil, proyek arsitektur, berkas SRS (PDF), galeri screenshot, matriks keahlian, riwayat karir, dan kredensial sertifikasi secara mandiri melalui browser tanpa perlu mengedit kode sumber secara manual.
3. **Pipeline Telemetri Real-Time**:
   * Merekam setiap interaksi keluar (*outbound links* ke GitHub, SRS, atau demo) secara background asinkron (*non-blocking fire-and-forget*) untuk menghasilkan data analitik interaksi pengunjung yang akurat.

---

## 2. Diagram Alur Arsitektur Sistem (System Flow Diagram)

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Viewport Layer"]
        Visitor["Pengunjung Publik"]
        AdminUser["Admin (Zola Dimas)"]
    end

    subgraph SecurityLayer ["Security & Routing Layer"]
        Middleware["Root Middleware (middleware.ts)"]
        GoogleOAuth["Google OAuth 2.0 (NextAuth)"]
    end

    subgraph AppRouterLayer ["Next.js 14 App Router"]
        PublicRSC["Public Portfolio (RSC /page.tsx)"]
        AdminCMS["Admin CMS Suite (/admin/*)"]
        APIHandlers["API Route Handlers (/api/*)"]
    end

    subgraph InfrastructureLayer ["Data & Storage Layer (Supabase)"]
        PoolerDB[("PostgreSQL Pooler :6543\n(Runtime Queries via Prisma)")]
        DirectDB[("PostgreSQL Session :5432\n(Prisma db push / Migrations)")]
        SupabaseStorage[("Supabase Object Storage\nBucket: 'portofolio' (Public)")]
    end

    %% Visitor Flow
    Visitor -->|"1. Akses Beranda /"| PublicRSC
    PublicRSC -->|"2. Read Direct State"| PoolerDB
    Visitor -->|"3. Klik Outbound Link"| APIHandlers
    APIHandlers -->|"4. sendBeacon /api/track-click"| PoolerDB

    %% Admin Flow
    AdminUser -->|"A. Login /admin/login"| GoogleOAuth
    GoogleOAuth -->|"B. Validasi Email Admin"| SecurityLayer
    SecurityLayer -->|"C. Akses Diberikan"| Middleware
    Middleware -->|"D. Render Dashboard & Forms"| AdminCMS
    AdminCMS -->|"E. Mutasi Proyek & Profil"| APIHandlers
    APIHandlers -->|"F. CRUD Data"| PoolerDB
    AdminCMS -->|"G. Upload Cover / SRS / Galeri"| APIHandlers
    APIHandlers -->|"H. Simpan Berkas"| SupabaseStorage
```

---

## 3. Matriks Tech Stack & Pertimbangan Rekayasa

| Layer | Teknologi | Versi | Rationale Rekayasa |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 14.2+ | Menyediakan *React Server Components* (RSC) untuk rendering HTML berkecepatan tinggi, SEO maksimal, dan zero bundle size di sisi klien untuk data statis. |
| **Bahasa** | TypeScript | 5.x | Menjamin *type safety* menyeluruh dari skema basis data Prisma, payload API, hingga komponen presentasi React. |
| **Styling** | Tailwind CSS | 3.4+ | Fleksibilitas tinggi tanpa runtime CSS-in-JS overhead; palet warna kustom Obsidian Precision (`#030712`, `#0b0f17`, aksen emerald `#10b981` dan cyan `#06b6d4`). |
| **Komponen Ikon** | Lucide React | Latest | Kumpulan ikon vektor ringan dan konsisten untuk status telemetri, metrik arsitektur, dan navigasi. |
| **Database** | PostgreSQL (Supabase) | 15+ | Database relasional berstandar ACID industri, mendukung foreign key cascade, indexing B-tree, dan query JSONB. |
| **ORM** | Prisma ORM | 5.22+ | Menghasilkan client query bertipe kuat (*strongly-typed client*), migrasi deklaratif, dan integritas relasional antar model. |
| **Storage** | Supabase Object Storage | S3-Compatible | Penyimpanan berkas statis (gambar cover JPG/PNG/WEBP, berkas PDF SRS hingga 10MB) dengan URL publik instan. |
| **Autentikasi** | NextAuth.js | 4.24+ | Protokol OAuth 2.0 terstandarisasi industri yang diproteksi di sisi server dengan whitelist email admin ketat. |

---

## 4. Konfigurasi Variabel Lingkungan (`.env`)

Sistem menggunakan konfigurasi berbasis environment variable dengan skema pemisahan koneksi database (*Dual-Connection*):

```env
# ----------------------------------------------------
# DATABASE (Supabase PostgreSQL Connection Strings)
# ----------------------------------------------------
# Digunakan oleh Prisma Client untuk query runtime (port 6543, transaction pooler)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Digunakan oleh Prisma CLI untuk eksekusi db push dan migrasi skema (port 5432, direct connection)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ----------------------------------------------------
# SUPABASE OBJECT STORAGE (Upload Gambar & Berkas SRS)
# ----------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_SECRET]"
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET="portofolio"

# ----------------------------------------------------
# NEXTAUTH (Autentikasi Admin Terproteksi)
# ----------------------------------------------------
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[RANDOM_SECRET_KEY_MIN_32_CHARS]"

GOOGLE_CLIENT_ID="[GOOGLE_OAUTH_CLIENT_ID].apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[GOOGLE_OAUTH_CLIENT_SECRET]"

# Whitelist Email Tunggal yang Berhak Masuk CMS
ADMIN_EMAIL="zoladimas32@gmail.com"
```

> [!IMPORTANT]
> Jangan pernah mempublikasikan nilai `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_SECRET`, atau `DIRECT_URL` ke repositori git publik. Di lingkungan produksi (misalnya Vercel), variabel-variabel ini harus disetel melalui *Environment Variables Settings*.
