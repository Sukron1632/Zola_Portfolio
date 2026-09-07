# 02 — Arsitektur Backend & Dokumentasi Referensi API

> **Dokumen**: `Dokumentation/02_BACKEND_AND_API_REFERENCE.md`  
> **Framework**: Next.js 14 Route Handlers, NextAuth.js, Prisma Client v5, Supabase SDK  

---

## 1. Konsep & Arsitektur Backend

Backend dibangun menggunakan **Next.js Route Handlers** (`app/api/*/route.ts`) yang berjalan di lingkungan Node.js serverless/edge-ready. Setiap handler mematuhi standar RESTful API dengan format serialisasi JSON, penanganan kesalahan berlapis (*layered error handling*), dan validasi tipe ketat.

---

## 2. Katalog Endpoint API Lengkap

### A. Health & Diagnostics (`/api/health`)
* **Method**: `GET`
* **Deskripsi**: Melakukan pemeriksaan langsung status konektivitas runtime basis data PostgreSQL dan bucket Supabase Storage, mengukur latensi ping dalam milidetik.
* **Response Contoh (HTTP 200)**:
  ```json
  {
    "status": "HEALTHY",
    "timestamp": "2026-09-06T10:45:00.000Z",
    "responseTimeMs": 14,
    "checks": {
      "database": {
        "status": "HEALTHY",
        "provider": "Supabase PostgreSQL",
        "latencyMs": 12
      },
      "storage": {
        "status": "HEALTHY",
        "bucket": "portofolio",
        "isPublic": true
      },
      "auth": {
        "provider": "Google OAuth",
        "adminConfigured": true,
        "adminEmail": "zoladimas32@gmail.com"
      }
    }
  }
  ```

---

### B. Profil Singleton (`/api/profile`)

#### 1. `GET /api/profile`
* **Deskripsi**: Mengambil data profil singleton publik (ID: 1). Jika database kosong, mengembalikan fallback profil awal Zola Dimas Firmansyah.
* **Akses**: Terbuka untuk umum (Public).

#### 2. `PUT /api/profile`
* **Deskripsi**: Memperbarui profil singleton. Memvalidasi format email kontak menggunakan regex.
* **Akses**: Terproteksi (Hanya Admin).
* **Payload Request**:
  ```json
  {
    "name": "Zola Dimas Firmansyah",
    "heroTitle": "Systems Architect & Backend Engineer",
    "heroSubtitle": "Specializing in Distributed Systems & PostgreSQL Optimization",
    "aboutText": "Spesialis arsitektur sistem informasi enterprise...",
    "emailContact": "zoladimas32@gmail.com",
    "location": "Yogyakarta, Indonesia",
    "avatarUrl": "https://[SUPABASE_URL]/storage/v1/object/public/portofolio/avatar.webp",
    "resumeUrl": "https://[SUPABASE_URL]/storage/v1/object/public/portofolio/resume.pdf",
    "githubUrl": "https://github.com/zoladimas",
    "linkedinUrl": "https://linkedin.com/in/zoladimas"
  }
  ```
* **Response**: Objek profil yang berhasil di-upsert (HTTP 200).

---

### C. Manajemen Proyek (`/api/projects`)

#### 1. `GET /api/projects`
* **Deskripsi**: Mengambil daftar proyek dari database yang diurutkan descending berdasarkan `createdAt`. Menyertakan agregasi jumlah klik telemetri (`_count.clickTracks`).
* **Query Parameters**:
  * `?published=true`: Memfilter hanya proyek yang berstatus `isPublished: true`.
* **Akses**: Publik.

#### 2. `POST /api/projects`
* **Deskripsi**: Menambahkan entitas proyek arsitektur baru.
* **Akses**: Terproteksi (Hanya Admin).
* **Payload Request**:
  ```json
  {
    "title": "Sistem Manajemen Aset Multi-Hotel",
    "slug": "multi-hotel-asset-management",
    "description": "Platform audit aset multi-hotel dengan isolasi row-level...",
    "techStack": ["Next.js", "PostgreSQL", "Prisma", "Docker"],
    "thumbnail": "https://.../cover.webp",
    "documentUrl": "https://.../srs-document.pdf",
    "gallery": ["https://.../screen1.webp", "https://.../screen2.webp"],
    "completedAt": "2025-11-01",
    "repoUrl": "https://github.com/zoladimas/hotel-asset-manager",
    "videoUrl": "https://youtube.com/...",
    "isPublished": true
  }
  ```
* **Kode Respons**:
  * `201 Created`: Proyek berhasil disimpan.
  * `400 Bad Request`: Payload tidak lengkap (kolom wajib `title`, `slug`, `description`).
  * `409 Conflict`: Slug proyek sudah digunakan oleh record lain.

---

### D. Detail, Update, & Hapus Proyek (`/api/projects/[id]`)

#### 1. `GET /api/projects/[id]`
* **Deskripsi**: Mengambil record proyek spesifik. Parameter `[id]` dapat berupa primary key CUID (`id`) ataupun route identifier unik (`slug`).
* **Respons**: Objek proyek lengkap beserta daftar relasi telemetri klik (HTTP 200) atau HTTP 404 jika tidak ditemukan.

#### 2. `PATCH /api/projects/[id]`
* **Deskripsi**: Memperbarui sebagian field proyek (misalnya toggle status publikasi atau revisi konten blueprint).
* **Akses**: Terproteksi (Hanya Admin).
* **Payload Request (Parsial diperbolehkan)**:
  ```json
  {
    "isPublished": false,
    "description": "Pembaruan spesifikasi arsitektur transaksi..."
  }
  ```
* **Respons**: Objek proyek yang telah diperbarui (HTTP 200).

#### 3. `DELETE /api/projects/[id]`
* **Deskripsi**: Menghapus proyek dari basis data. Relasi data pelacakan klik (`ClickTracker`) akan dihapus secara otomatis melalui constraint `onDelete: Cascade` di Prisma.
* **Akses**: Terproteksi (Hanya Admin).
* **Respons**: `{"success": true, "message": "Project deleted successfully"}` (HTTP 200).

---

### E. Telemetri Pelacakan Klik (`/api/track-click`)

#### 1. `POST /api/track-click`
* **Deskripsi**: Mencatat klik tautan keluar (*outbound links*). Bersifat **fire-and-forget** sehingga tidak pernah memblokir navigasi pengunjung.
* **Ekstraksi Header**: Mengurai User-Agent pengunjung dan kode negara geolokasi Vercel/Cloudflare (`x-vercel-ip-country`, `cf-ipcountry`).
* **Resolusi ID Fleksibel**: Menerima primary key CUID ataupun slug proyek. Jika tautan bersifat umum (misal unduh CV), query tetap berhasil tanpa melempar foreign key error.
* **Payload Request**:
  ```json
  {
    "projectId": "multi-hotel-asset-management"
  }
  ```
* **Respons**: `{"success": true, "tracked": true}` (HTTP 200).

#### 2. `GET /api/track-click`
* **Deskripsi**: Mengambil ringkasan analitik klik telemetri: Total klik global, 20 log interaksi terbaru, dan matriks distribusi klik per-proyek.
* **Akses**: Publik / Dashboard HUD.

---

### F. Upload Berkas Supabase Storage (`/api/upload`)

* **Method**: `POST` (Multipart / Form-Data)
* **Deskripsi**: Mengunggah berkas gambar thumbnail, galeri tangkapan layar, dokumen SRS (PDF/DOCX), atau berkas resume langsung ke bucket Supabase Storage `portofolio`.
* **Validasi Keamanan**:
  1. Memeriksa sesi admin.
  2. Batas ukuran berkas maksimal **10 Megabytes (10MB)**.
  3. Whitelist MIME-Type: Gambar (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`) dan Dokumen (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
* **Response Contoh (HTTP 200)**:
  ```json
  {
    "success": true,
    "url": "https://tyywhqwzadynlibihfon.supabase.co/storage/v1/object/public/portofolio/projects/1788691234567-architecture-srs.pdf",
    "name": "1788691234567-architecture-srs.pdf",
    "size": 2451820,
    "type": "application/pdf"
  }
  ```

---

## 3. Sistem Keamanan & Autentikasi Admin

### A. Provider Google OAuth ([lib/auth.ts](file:///e:/Portfolio/lib/auth.ts))
* Menggunakan callback `signIn` yang mengecek kecocokan email:
  ```typescript
  async signIn({ user }) {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!adminEmail || !user.email) return false;
    return user.email.toLowerCase() === adminEmail;
  }
  ```
* Email di luar whitelist `ADMIN_EMAIL` akan ditolak seketika (`return false`) dan diarahkan ke error AccessDenied.

### B. Proteksi Route Middleware ([middleware.ts](file:///e:/Portfolio/middleware.ts))
* Seluruh rute administratif `/admin/:path*` (kecuali `/admin/login`) diproteksi oleh JWT NextAuth.
* Pengguna tanpa token sesi secara otomatis diarahkan (*HTTP 307 Temporary Redirect*) kembali ke `/admin/login`.
* Mendukung header pengujian `x-admin-test-token: NEXTAUTH_SECRET` untuk memungkinkan eksekusi test otomatis (*automation testing*) berjalan lancar dan aman.
