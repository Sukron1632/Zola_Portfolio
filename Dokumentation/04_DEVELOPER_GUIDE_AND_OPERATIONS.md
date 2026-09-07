# 04 — Panduan Pengembang & Operasional (Developer & Operations Guide)

> **Dokumen**: `Dokumentation/04_DEVELOPER_GUIDE_AND_OPERATIONS.md`  
> **Target Pengguna**: Pengembang Software, DevOps, & Sistem AI Assistant  

---

## 1. Menjalankan Proyek Secara Lokal

### Prasyarat:
* Node.js v18.17+ atau v20+ LTS
* Akun Supabase (Database PostgreSQL & Storage Bucket)
* Akun Google Cloud Console (Untuk Google OAuth Client ID & Secret)

### Langkah Instalasi:

```bash
# 1. Kloning atau buka direktori proyek
cd e:\Portfolio

# 2. Instal seluruh dependensi
npm install

# 3. Buat dan sesuaikan berkas lingkungan (.env)
cp .env.example .env
# (Pastikan DATABASE_URL, DIRECT_URL, SUPABASE, dan NEXTAUTH kredensial sudah terisi)

# 4. Sinkronisasi skema basis data ke Supabase
npm run db:push

# 5. Inisialisasi data awal (Seeding)
npm run db:seed

# 6. Jalankan server lokal Next.js
npm run dev
```

* Buka beranda portofolio publik: `http://localhost:3000`
* Buka halaman login CMS admin: `http://localhost:3000/admin/login`

---

## 2. Navigasi & Pemahaman Kode Sumber (Codebase Tour)

Untuk memahami arsitektur kode dengan cepat, perhatikan pemetaan berkas kunci berikut:

```text
e:\Portfolio\
├── app/
│   ├── (public)/page.tsx           # Entry point utama beranda publik.
│   │                               # Mengambil data profil dan proyek via Prisma RSC.
│   ├── admin/
│   │   ├── page.tsx                # Dashboard telemetri analitik (RSC membaca Prisma).
│   │   ├── projects/page.tsx       # Datatable proyek dengan switch publish & delete.
│   │   ├── projects/create/page.tsx# Form tambah proyek dengan upload Supabase Storage.
│   │   ├── projects/[id]/edit/     # Form edit proyek komprehensif.
│   │   ├── profile/page.tsx        # Form CMS biodata profil singleton.
│   │   ├── skills/page.tsx         # Manajemen matriks keahlian & stack.
│   │   ├── experience/page.tsx     # Manajemen timeline karir & magang Diskominfo.
│   │   ├── certifications/page.tsx # Manajemen kredensial sertifikasi BNSP.
│   │   └── settings/page.tsx       # Pengaturan sistem & database connection status.
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth Google OAuth handler.
│   │   ├── health/route.ts         # Endpoint diagnostik status DB & Storage real-time.
│   │   ├── profile/route.ts        # Endpoint GET & PUT profil singleton.
│   │   ├── projects/route.ts       # Endpoint GET & POST proyek.
│   │   ├── projects/[id]/route.ts  # Endpoint GET, PATCH, DELETE proyek spesifik.
│   │   ├── track-click/route.ts    # Endpoint logging telemetri asinkron.
│   │   └── upload/route.ts         # Endpoint upload file ke Supabase Storage.
│   └── globals.css                 # Desain token, variabel CSS, & efek radial glow.
├── components/
│   ├── ObsidianModal.tsx           # Komponen modal dialog Obsidian Precision reusable.
│   ├── ProjectActionButtons.tsx    # Tombol toggle publish, edit, dan hapus proyek.
│   ├── ProjectDetailModal.tsx      # Modal penampil blueprint arsitektur & dokumen SRS.
│   └── TrackedLink.tsx             # Anchor link dengan telemetri sendBeacon otomatis.
├── lib/
│   ├── auth.ts                     # Konfigurasi NextAuth & validator email admin whitelist.
│   ├── prisma.ts                   # Prisma Client singleton.
│   └── supabase.ts                 # Supabase client singleton & storage helper.
├── prisma/
│   ├── schema.prisma               # Definisi skema model database relasional.
│   └── seed.mjs                    # Script seeding data awal.
└── middleware.ts                   # Proteksi rute /admin/:path* dengan NextAuth JWT.
```

---

## 3. Eksekusi Test Otomatis (Automation Test Suites)

Proyek ini dilengkapi dengan rangkaian pengujian otomatis (*end-to-end integration test suite*) dengan total **38 skenario pengujian**:

```bash
# A. Jalankan Frontend Automation Test (21 Skenario)
# Menguji respon viewport publik, komponen Bento, security gate, form CMS, & rute edit
npm test

# B. Jalankan Backend Automation Test (17 Skenario)
# Menguji REST endpoints, validasi payload, CRUD proyek, upload storage, & telemetri
npm run test:backend

# C. Jalankan Seluruh Test Suite (Frontend + Backend - 38 Skenario)
npm run test:all

# D. Uji Pemeriksaan Tipe TypeScript
npx tsc --noEmit

# E. Healthcheck Diagnostik Infrastruktur Langsung
npm run healthcheck
```

> [!TIP]
> Sebelum melakukan commit kode atau deployment produksi, selalu pastikan `npm run test:all` dan `npx tsc --noEmit` menghasilkan exit code 0 dengan tingkat kelulusan 100%.

---

## 4. Panduan Menambah Fitur Baru

### A. Menambahkan Kolom Baru pada Proyek
1. Buka [prisma/schema.prisma](file:///e:/Portfolio/prisma/schema.prisma) dan tambahkan field baru pada `model Project` (contoh: `clientName String?`).
2. Jalankan perintah sinkronisasi: `npm run db:push`.
3. Buka [app/api/projects/route.ts](file:///e:/Portfolio/app/api/projects/route.ts) dan [app/api/projects/[id]/route.ts](file:///e:/Portfolio/app/api/projects/%5Bid%5D/route.ts), tambahkan kolom baru tersebut pada `create` dan `update` data handler.
4. Buka formulir input di [app/admin/projects/create/page.tsx](file:///e:/Portfolio/app/admin/projects/create/page.tsx) dan [app/admin/projects/[id]/edit/page.tsx](file:///e:/Portfolio/app/admin/projects/%5Bid%5D/edit/page.tsx) untuk menambahkan field kontrol form.

### B. Menambahkan Menu Navigasi Admin Baru
1. Buat direktori baru di dalam `app/admin/[nama-fitur]/page.tsx`.
2. Buka [components/AdminNav.tsx](file:///e:/Portfolio/components/AdminNav.tsx) dan tambahkan entri rute baru beserta ikon Lucide yang sesuai ke dalam array `NAVIGATION_LINKS`.

---

## 5. Panduan Deployment Produksi (Vercel + Supabase)

1. **Push Kode ke Repositori Git**:
   Pastikan berkas `.env` diabaikan oleh `.gitignore`.
2. **Deploy Proyek di Vercel**:
   * Impor repositori di dashboard Vercel.
   * Pilih framework preset **Next.js**.
   * Salin seluruh variabel lingkungan dari `.env` ke bagian **Environment Variables** di Vercel Settings.
   * Ubah `NEXTAUTH_URL` menjadi URL domain produksi (contoh: `https://portofolio-zola.vercel.app`).
3. **Konfigurasi Google Cloud Console**:
   * Buka *Google Cloud Console > APIs & Services > Credentials*.
   * Pilih OAuth 2.0 Client ID proyek Anda.
   * Pada **Authorized JavaScript origins**, tambahkan: `https://portofolio-zola.vercel.app`
   * Pada **Authorized redirect URIs**, tambahkan:  
     `https://portofolio-zola.vercel.app/api/auth/callback/google`
4. **Validasi Pasca-Deploy**:
   * Kunjungi `https://portofolio-zola.vercel.app/api/health` untuk memverifikasi bahwa status database dan storage bernilai `"HEALTHY"`.
   * Lakukan login admin di `https://portofolio-zola.vercel.app/admin/login`.
