# 01 — Arsitektur Frontend & Antarmuka Pengguna

> **Dokumen**: `Dokumentation/01_FRONTEND_ARCHITECTURE.md`  
> **Teknologi**: Next.js 14+ App Router, React Server Components (RSC), Tailwind CSS, Lucide React  

---

## 1. Prinsip Desain & Pemisahan Komponen (RSC vs Client Components)

Arsitektur frontend proyek ini menerapkan pemisahan tugas (*separation of concerns*) yang ketat antara **React Server Components (RSC)** dan **Client Components (`"use client"`)**:

```text
┌─────────────────────────────────────────────────────────────┐
│                    React Server Components                  │
│  - Default untuk seluruh halaman presentasi data            │
│  - Membaca basis data PostgreSQL langsung via Prisma Client  │
│  - Kecepatan render instan di sisi server, tanpa bundle JS  │
│  - Optimal untuk SEO (Search Engine Optimization)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Melewatkan Props Serialized
┌──────────────────────────────▼──────────────────────────────┐
│                   Client Components ("use client")          │
│  - Form input, tombol submit interaktif, & switch toggle   │
│  - Dialog modal (ObsidianModal, ProjectDetailModal)         │
│  - Upload file multipart (Supabase Storage) & preview gambar│
│  - Handler clipboard (CopyEmailButton)                      │
│  - Background click tracker (TrackedLink via sendBeacon)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Direktori Frontend

```text
app/
├── (public)/
│   ├── layout.tsx                # Layout navigasi header & footer publik
│   └── page.tsx                  # Beranda portofolio publik (RSC membaca Prisma)
├── admin/
│   ├── layout.tsx                # Shell CMS admin: sidebar AdminNav & AdminUserCard
│   ├── page.tsx                  # Dashboard analitik telemetri & KPI HUD
│   ├── projects/
│   │   ├── page.tsx              # Datatable proyek, filter publikasi & tindakan
│   │   ├── create/page.tsx       # Form tambah proyek baru + dropzone Supabase
│   │   └── [id]/edit/page.tsx    # Form edit blueprint proyek komprehensif
│   ├── skills/page.tsx           # Matrix kompetensi keahlian & modal edit stack
│   ├── experience/page.tsx       # Timeline karir, magang Diskominfo & modal edit
│   ├── certifications/page.tsx   # Kredensial sertifikasi BNSP, hash audit & modal edit
│   ├── profile/page.tsx          # Singleton CMS biodata, avatar & resume
│   └── settings/page.tsx         # System settings, dual-connection DB & danger zone
components/
├── AdminNav.tsx                  # Navigasi sidebar CMS responsif
├── AdminUserCard.tsx             # Kartu identitas admin terotentikasi
├── AuthProvider.tsx              # Provider NextAuth SessionProvider wrapper
├── CopyEmailButton.tsx           # Tombol copy email ke clipboard dengan state feedback
├── ObsidianModal.tsx             # Modal dialog elegan bertema Obsidian Precision
├── ObsidianToast.tsx             # Sistem notifikasi toast non-intrusif
├── ProjectActionButtons.tsx      # Tombol aksi tabel proyek (Toggle Publish, Edit, Delete)
├── ProjectDetailModal.tsx        # Modal blueprint & pratinjau spesifikasi SRS proyek
├── ProjectDetailTrigger.tsx      # Komponen trigger interaktif pembuka modal blueprint
└── TrackedLink.tsx               # Anchor link dengan telemetri background otomatis
```

---

## 3. Komponen Beranda Portofolio Publik (`app/(public)/page.tsx`)

Beranda publik dibangun sebagai Server Component tunggal yang mengambil data secara paralel menggunakan `Promise.all`:

1. **Hero Section**:
   * Menampilkan headline arsitektural dinamis dari database (`profile.heroTitle`), lokasi domisili (`profile.location`), bio ringkas (`profile.aboutText`), serta avatar Supabase dengan efek *halo glow*.
   * Status beacon aktif bertuliskan `"AVAILABLE FOR WORK / CONTRACTS"`.
   * Tombol CTA unduh resume (`TrackedLink`), eksplorasi proyek, dan dialog salin email instan (`CopyEmailButton`).
2. **Structured Engineering Arsenal (Matriks Keahlian)**:
   * **Core Backend**: Node.js, PostgreSQL (Neon), Prisma ORM, REST/GraphQL.
   * **System Analysis**: UML Modeling Suite (Use-Case, Sequence, Class), SRS IEEE-830, Skema ERD & Normalisasi (3NF/BCNF), UAT Testing.
   * **Infra & DevOps**: Docker, Redis Heuristics, CI/CD GitHub Actions, Linux Ubuntu Server.
3. **Track Record & Timeline (Pengalaman & Milestone Karir)**:
   * Milestone Magang di **Diskominfo DIY** dengan metrik utama **42% Query Latency Cut**.
   * Milestone **Desa Ambalkliwonan** dengan transisi digital administrasi 100%.
   * Konsultasi Arsitektur Perangkat Lunak independen.
4. **Engineered Architectures (Bento Grid Proyek)**:
   * **Kartu Bento Utama**: *Multi-Hotel IT Asset Management System* terhubung langsung secara dinamis ke database; mengekspos metrik isolasi transaksi *Strict Read-Committed* dan latensi query rata-rata 4.2ms.
   * **Kartu Bento 2**: Smart Village Portal Desa Ambalkliwonan.
   * **Kartu Bento 3**: Real-Time Click Tracker Daemon internal.
   * **Grid Proyek Tambahan**: Seluruh proyek baru yang dipublikasikan admin melalui CMS akan secara otomatis ter-render di bawah bento grid tanpa duplikasi.
   * **Komponen Blueprint Modal**: Memungkinkan pengunjung meninjau deskripsi arsitektur teknis mendalam, dokumen spesifikasi SRS PDF, tangkapan layar galeri, dan link repositori GitHub.

---

## 4. Antarmuka CMS Admin (`app/admin/*`)

### A. Dashboard HUD Telemetri (`/admin`)
* Menampilkan KPI card interaktif: Total Outbound Clicks, Total Proyek Terpublikasi, dan Latensi Ping Database langsung dari query PostgreSQL Supabase.
* Grafik distribusi klik telemetri per-proyek.
* Log riwayat klik telemetri real-time yang mencatat timestamp, negara (ISO), user-agent, dan proyek yang dituju.

### B. Manajemen Proyek (`/admin/projects`)
* **Datatable Proyek**: Menampilkan thumbnail, nama proyek, slug rute, badge status publikasi (*Published/Draft*), hitungan klik telemetri, dan tag tech stack.
* **Aksi Cepat ([ProjectActionButtons.tsx](file:///e:/Portfolio/components/ProjectActionButtons.tsx))**:
  * Tombol **Toggle Publish** (ikon mata hijau/abu-abu).
  * Tombol **Edit Blueprint** (ikon pensil cyan) yang langsung mengarah ke `/admin/projects/[id]/edit`.
  * Tombol **Hapus Proyek** (ikon tempat sampah rose) dengan konfirmasi dialog aman.

### C. Tambah & Edit Proyek (`/admin/projects/create` & `/admin/projects/[id]/edit`)
* Input metadata: Judul Proyek, Route Slug (otomatis dibuat dari judul pada mode create), Deskripsi Teknis/Arsitektural, Tag Tech Stack, Tanggal Penyelesaian (menggunakan pemilih kalender HTML5 `input[type="date"]`), Repo URL, dan Video Demo URL.
* **Integrasi Supabase Storage**:
  * Dropzone upload gambar Cover Visual (JPG/PNG/WEBP).
  * Dropzone upload dokumen SRS / Dokumen Teknis (PDF/DOCX hingga 10MB) dengan indikator nama berkas dan link pratinjau.
  * Multi-file upload galeri screenshot arsitektur dengan tombol hapus per-gambar.

### D. Manajemen Skills, Experience, dan Certifications
* **Skills (`/admin/skills`)**: Admin dapat mengedit persentase keahlian, tingkat kemahiran (*Mastery*, *Proficient*, *Familiar*), deskripsi teknis, dan switch toggle apakah ditampilkan di beranda (*Featured*).
* **Experience (`/admin/experience`)**: Admin dapat mengedit rincian peran, lembaga, periode, tipe keterlibatan, metrik dampak, dan narasi kontribusi.
* **Certifications (`/admin/certifications`)**: Admin dapat mengedit judul sertifikasi BNSP, nomor kredensial, URL verifikasi publik, serta pin sebagai *Hero Trust Badge*.

### E. Manajemen Profil Singleton (`/admin/profile`)
* Terkoneksi ke `GET /api/profile` dan `PUT /api/profile` (id: 1).
* Mengelola Nama, Headline Hero, Subtitle, Bio Lengkap, Domisili Lokasi, Email Kontak, Tautan GitHub/LinkedIn, serta tombol upload Avatar dan berkas Resume (PDF).

---

## 5. Sistem Desain Obsidian Precision

Konfigurasi tema dikelola terpusat melalui [tailwind.config.ts](file:///e:/Portfolio/tailwind.config.ts) dan [app/globals.css](file:///e:/Portfolio/app/globals.css):

```css
/* Palet Warna Inti Obsidian */
--obsidian-void: #030712;      /* Hitam pekat dasar canvas */
--obsidian-canvas: #0b0f17;    /* Warna latar belakang kartu & bento */
--obsidian-card: #111827;      /* Warna permukaan elemen interaktif */
--obsidian-highlight: #1f2937; /* Warna hover & aksen sekunder */
--obsidian-border: #1f293d;    /* Garis pembatas elegan */

/* Warna Aksen Rekayasa */
--brand-emerald: #10b981;      /* Status sehat, data produksi, koneksi aktif */
--brand-cyan: #06b6d4;         /* Spesifikasi sistem, UML, & link eksternal */
```

* Efek kartu menggunakan utility class `.card-radial-glow` yang memancarkan gradasi radial mikro lembut saat kursor pengguna berada di atas kartu.
* Tipografi menggunakan Google Font **Inter** via `next/font/google` dengan variabel font monospace untuk elemen teknis seperti slug, latensi, dan persentase.
