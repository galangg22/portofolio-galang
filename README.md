# Portofolang

Website portofolio modern, interaktif, dan berkinerja tinggi yang dibangun dengan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, dan **GSAP Animations**. Dilengkapi sistem **Full Dynamic CMS** berbasis **Supabase** dan **Admin Panel** terproteksi untuk mengelola seluruh konten, proyek, sertifikat, hingga riwayat perjalanan karir (*Timeline & About Me*) tanpa perlu menyentuh kode.

🌐 **Live Website:** [https://galangpramudito.web.id/](https://galangpramudito.web.id/)

---

## ✨ Fitur Utama

- 🧭 **Dynamic Island Navbar** — Navigasi melayang terinspirasi macOS/iOS dengan animasi ekspansi saat di-hover/tap.
- 👨‍💻 **Halaman About & Timeline Karir Dinamis (`/about`)** — Riwayat pendidikan (SMKN 2 Buduran, PENS) dan pengalaman kerja (Disnaker Prov. Jatim, Freelance, Retail POS) dilengkapi galeri dokumentasi foto interaktif dan modal lightbox.
- 💻 **Typed Projects Showcase** — Manajemen proyek terstruktur berdasarkan kategori (Web Apps, Discord/Telegram Bot, Android Apps, dan Custom Systems) dengan link demo, repo, Play Store, dan screenshot galeri.
- 🏆 **Certificates & Achievements** — Galeri sertifikasi interaktif dengan modal preview, verifikasi link kredensial eksternal, dan auto-generate thumbnail dari file PDF.
- 🎨 **Design & Video Gallery** — Showcase karya desain visual dalam grid responsif dan embed video player (YouTube, Google Drive, Vimeo).
- ⚙️ **Modern Supabase CMS & Admin Panel (`/admin`)** — Manajemen CRUD lengkap dengan fitur:
  - Form grouping terstruktur (*Informasi Utama*, *Konten & Cerita*, *Galeri Penunjang*).
  - Drag-and-drop reordering urutan tampilan (*sort order*).
  - Multi-line tag / deskripsi fleksibel dengan pemisah pipa (`|`).
  - Auto-fallback caption dan instant photo upload ke Supabase Storage.
- ⚡ **Performa & SEO Tingkat Lanjut (Google Search Console Ready)**:
  - **Schema.org JSON-LD Structured Data** (`ProfilePage`, `Person`, `WebSite`, `BreadcrumbList`) tervalidasi 100% Google Rich Results.
  - **ISR (Incremental Static Regeneration)** untuk muat halaman instan dan konten selalu segar.
  - **Dynamic Sitemap (`/sitemap.xml`)** & **Robots.txt** otomatis terindeks.
  - OpenGraph & Twitter Card metadata di setiap halaman.
- 🌓 **Dark / Light Mode Modular** — Transisi tema mulus dengan mempertahankan kontras tinggi dan keterbacaan elemen antarmuka.
- 🛡️ **Keamanan & Autentikasi** — Proteksi admin berbasis cookie sesi HTTP-only terenkripsi HMAC-SHA256, rate limiting login (5 percobaan / 15 menit), sanitasi input XSS, dan Row Level Security (RLS) Supabase.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Versi | Kegunaan |
|----------|-----------|-------|----------|
| **Framework** | Next.js (Turbopack) | 16.2.4 | React Framework & App Router |
| **UI Library** | React | 19.2.4 | Komponen UI Reaktif |
| **Styling** | Tailwind CSS | 4.x | Utilitas CSS & Desain Modern |
| **Database & Auth** | Supabase | latest | Database PostgreSQL, Storage, API |
| **Animasi** | GSAP & Lenis | 3.15.0 | ScrollTrigger & Smooth Scrolling |
| **Theme** | next-themes | 0.4.6 | Manajemen Dark & Light Mode |
| **Ikon** | Remixicon | 4.1.0 | Ikon Vektor Antarmuka |

---

## 🚀 Panduan Memulai Cepat

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/galangpramudito/portofolio-galang.git
cd portofolio-galang
npm install
```

### 2. Konfigurasi Environment Variables
Salin file template `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel berikut di `.env.local`:
```env
# URL Dasar Website
NEXT_PUBLIC_BASE_URL=https://galangpramudito.web.id

# Formspree Endpoint (Kontak Form)
NEXT_PUBLIC_FORMSPREE_ID=your_formspree_id

# Profil Sosial Media
NEXT_PUBLIC_GITHUB_URL=https://github.com/galangg22
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/in/galang-pramudito/
NEXT_PUBLIC_EMAIL=galangarrauf22@gmail.com

# Supabase Database (CMS)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Rahasia Server (Jangan pernah expose ke sisi client)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=your_super_secret_admin_password
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🗄️ Konfigurasi Database Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di Dashboard Supabase.
3. Jalankan script [`supabase_schema.sql`](file:///z:/PROJECTS/VsCode/portofolang/portofolang/supabase_schema.sql) (atau [`supabase_timeline_migration.sql`](file:///z:/PROJECTS/VsCode/portofolang/portofolang/supabase_timeline_migration.sql) jika memperbarui timeline).
4. Pastikan Storage Bucket bernama `thumbnails` dan `certificates` berstatus **Public**.

### 📋 Ringkasan Tabel Database

| Tabel | Deskripsi & Relasi |
|---|---|
| `profile` | Data profil utama (nama, bio, avatar, status ketersediaan, tautan CV ID & EN). |
| `timeline` | Riwayat milestone pendidikan & karir (periode, peran, instansi, kategori, ringkasan, deskripsi, keahlian, pencapaian). |
| `timeline_images` | Foto dokumentasi penunjang per milestone timeline (`timeline_id` foreign key cascade delete). |
| `projects` | Daftar proyek pengembangan (tipe: web/bot/android/other, slug, repo_url, demo_url, sort_order). |
| `project_images` | Screenshot/mockup galeri per proyek. |
| `project_types` | Kategori jenis proyek. |
| `certificates` | Daftar sertifikasi dan penghargaan (issuer, tanggal, credential_link, verify_url). |
| `designs` | Galeri karya desain grafis & UI/UX. |
| `design_images` | Gambar detail untuk setiap karya desain. |
| `videos` | Portofolio video (YouTube, Vimeo, Google Drive video embed). |
| `skills` | Data keterampilan dan keahlian untuk bento grid beranda. |

---

## 🔐 Panel Admin CMS (`/admin`)

Akses panel admin melalui `/admin` dan masuk menggunakan password yang disetel pada `ADMIN_PASSWORD`.

- **Timeline Manager (`/admin/timeline`)**: Tambah/edit riwayat karir, susun urutan tampilan, tulis cerita dengan pemisah `|`, dan unggah foto dokumentasi kegiatan.
- **Projects Manager (`/admin/projects`)**: Atur proyek aktif, upload thumbnail, tambah galeri screenshot, dan sembunyikan proyek privat.
- **Certificates Manager (`/admin/certificates`)**: Unggah sertifikat (JPG/PNG/PDF), fitur auto-thumbnail dari dokumen PDF, dan kelola badge featured.
- **Profile & CV Manager (`/admin/profile`)**: Ganti foto avatar profil, perbarui ringkasan bio, kelola status ketersediaan kerja (*Available / Busy*), dan upload file CV dwibahasa (ID & EN).

---

## 📁 Struktur Direktori

```
portofolang/
├── public/
│   ├── image/                   # Aset gambar statis & fallback foto
│   └── manifest.json            # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.js            # Root layout, font loader, meta base
│   │   ├── page.js              # Server fetcher beranda
│   │   ├── HomeClient.jsx       # Client UI beranda & interaksi GSAP
│   │   ├── about/               # Halaman About & Timeline Karir
│   │   │   ├── page.js          # Server fetching & JSON-LD Structured Data
│   │   │   └── AboutClient.jsx  # Interactive timeline & lightbox gallery
│   │   ├── projects/            # Galeri & detail proyek
│   │   ├── certificates/        # Galeri sertifikat
│   │   ├── admin/               # Panel CMS (CrudManager & Admin Pages)
│   │   │   ├── timeline/        # CRUD timeline karir & foto
│   │   │   ├── projects/        # CRUD proyek
│   │   │   ├── certificates/    # CRUD sertifikat
│   │   │   └── profile/         # CRUD profil & CV
│   │   ├── api/                 # API Route Handlers (Admin, Auth, Upload, CV)
│   │   ├── sitemap.js           # Dynamic XML sitemap generator
│   │   └── robots.js            # Search engine crawler rules
│   ├── lib/                     # Supabase clients, auth, utility helpers
│   └── proxy.js                 # Middleware auth guard (/admin/*)
├── supabase_schema.sql          # Schema SQL lengkap database
├── supabase_timeline_migration.sql # Script migrasi tabel timeline
└── README.md                    # Dokumentasi proyek
```

---

## 📦 Build & Deployment

### Build untuk Produksi
```bash
npm run build
npm start
```

### Deploy ke Vercel
1. Hubungkan repository GitHub ini ke [Vercel Dashboard](https://vercel.com).
2. Konfigurasikan seluruh variabel lingkungan (*Environment Variables*) di dashboard Vercel.
3. Deploy akan berjalan otomatis setiap kali Anda melakukan `git push` ke branch `main`.

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi [MIT License](LICENSE).

---

**Dibuat oleh [Galang Arrauf Pramudito](https://galangpramudito.web.id/)** • Web Developer & Software Engineering Student
