# Dokumentasi Resmi Portofolio Dinamis & CMS Pribadi
### Zola Dimas Firmansyah — Systems Architect & Backend Engineer

Selamat datang di direktori dokumentasi teknis resmi untuk proyek **Portofolio Dinamis & Content Management System (CMS) Pribadi Zola Dimas Firmansyah**.

Dokumentasi ini dirancang secara terstruktur dan mendalam untuk memberikan pemahaman arsitektur penuh, panduan pemeliharaan, serta acuan pengembangan lebih lanjut bagi pengembang dan sistem AI.

---

## 📚 Indeks Dokumen

| No | Dokumen | Fokus Utama |
| :--- | :--- | :--- |
| **00** | [00_OVERVIEW_AND_ARCHITECTURE.md](./00_OVERVIEW_AND_ARCHITECTURE.md) | Visi sistem, diagram alur (Mermaid), tech stack, arsitektur hybrid, & variabel `.env`. |
| **01** | [01_FRONTEND_ARCHITECTURE.md](./01_FRONTEND_ARCHITECTURE.md) | Next.js 14 App Router, RSC vs Client Components, antarmuka publik, antarmuka CMS, & desain Obsidian Precision. |
| **02** | [02_BACKEND_AND_API_REFERENCE.md](./02_BACKEND_AND_API_REFERENCE.md) | Seluruh Route Handlers (`/api/*`), NextAuth Google OAuth, proteksi Middleware, pipeline telemetri, & Supabase Storage upload. |
| **03** | [03_DATABASE_AND_STORAGE.md](./03_DATABASE_AND_STORAGE.md) | Skema Prisma ORM, konfigurasi Dual-Connection (Pooler 6543 vs Direct 5432), PostgreSQL Supabase, relasi, & bucket storage. |
| **04** | [04_DEVELOPER_GUIDE_AND_OPERATIONS.md](./04_DEVELOPER_GUIDE_AND_OPERATIONS.md) | Panduan instalasi, pemahaman alur kode, eksekusi test otomatis (38 skenario), CLI Prisma, & panduan deploy Vercel. |

---

## 🚀 Ringkasan Arsitektur Cepat

* **Framework Utama**: Next.js 14.2+ (App Router, React Server Components, TypeScript).
* **Styling & UI**: Tailwind CSS murni dengan palet gelap bertema *Obsidian Precision* (`#030712`, `#0b0f17`, aksen emerald `#10b981` dan cyan `#06b6d4`), ikon Lucide React.
* **Database & ORM**: PostgreSQL (Supabase AWS ap-southeast-1) dikelola menggunakan Prisma ORM v5 dengan *Dual-Connection Architecture*.
* **Autentikasi**: NextAuth.js v4 dengan Google OAuth restricted (hanya email admin `zoladimas32@gmail.com`).
* **Object Storage**: Supabase Storage bucket `portofolio` (Public, upload s/d 10MB untuk PDF, SRS specs, cover, dan galeri).
* **Telemetri**: Pelacakan klik asinkron (*fire-and-forget*) melalui `navigator.sendBeacon` dan `/api/track-click`.
* **Testing Otomatis**: 38 skenario pengujian komprehensif (21 skenario frontend/viewport + 17 skenario backend/API).
