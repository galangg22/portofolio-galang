# Arsitektur Project — Portofolang

> Portfolio website untuk **Galang Arrauf Pramudito** (Backend Developer & Creative Enthusiast).
> Live: https://portofolang.web.id

---

## 1. Gambaran Umum

Portofolang adalah aplikasi web portfolio berbasis **Next.js 16 (App Router)**. Arsitekturnya **hybrid**: konten dikelola lewat **Supabase (CMS + Postgres)** dengan **admin panel** di `/admin`, namun bila env Supabase tidak diset, seluruh halaman publik **fallback otomatis ke data statis** (konstanta in-code).

Halaman utama adalah **one single page** — semua section (hero, about, skills, projects, design, video, contact) ada dalam satu halaman scroll. Halaman `/design` dan `/video` tersedia sebagai halaman terpisah untuk menampilkan semua konten bila di homepage hanya featured yang ditampilkan.

Filosofi desain:
- **CMS opsional, fallback aman** → bisa jalan tanpa backend; aktifkan Supabase untuk kelola konten tanpa edit kode.
- **One single page** → semua section dalam satu halaman, navigasi via scroll.
- **Featured-first** → homepage menampilkan konten featured; halaman terpisah untuk semua konten.
- **Server-only secrets** → service-role key & admin password tidak pernah ke client.

---

## 2. Tech Stack

| Layer | Teknologi | Versi | Tanggung Jawab |
|-------|-----------|-------|----------------|
| Framework | Next.js | 16.2.4 | Routing, rendering, API |
| UI Library | React | 19.2.4 | Komponen & state lokal |
| Styling | Tailwind CSS | v4 | Utility-first styling |
| Theming | next-themes | 0.4.6 | Dark/light mode |
| Animasi | GSAP + ScrollTrigger | 3.15.0 | Scroll & entrance animation |
| Loader | next-top-loader | 1.0.4 | Progress bar navigasi |
| Ikon | Remixicon | 4.1.0 | Icon set (via CDN) |
| CMS / DB | @supabase/supabase-js | latest | Postgres, Storage, RLS |
| Compiler | babel-plugin-react-compiler | 1.0.0 | React Compiler (auto-memo) |
| Lint | ESLint + eslint-config-next | 9 / 16.2.4 | Code quality |

Integrasi eksternal: **Supabase** (database, storage, CMS), **Formspree** (form kontak), **Google Drive / YouTube / Vimeo** (embed video), **Remixicon CDN** (ikon).

---

## 3. Struktur Direktori

```
portofolang/
├── public/
│   ├── image/                 # Gambar statis fallback, foto profil
│   ├── cv-galang.pdf          # File CV (dibaca oleh /api/cv)
│   ├── favicon.ico
│   ├── manifest.json          # PWA manifest
│   └── robots.txt
├── supabase_schema.sql        # Schema tabel + RLS + seed data
├── src/
│   ├── proxy.js               # Auth guard /admin/* (konvensi proxy Next.js 16)
│   ├── lib/
│   │   ├── supabase.js        # Client publik (anon key, null-safe)
│   │   ├── supabase-admin.js  # Client service-role (server-only)
│   │   └── auth.js            # Helper cek cookie admin_session
│   └── app/
│       ├── layout.js          # Root layout: font, metadata, <head>, provider
│       ├── providers.jsx      # ThemeProvider (next-themes)
│       ├── globals.css        # Tailwind + CSS variables + light/dark overrides
│       ├── page.js            # Beranda one-single-page (semua section)
│       ├── components/
│       │   └── DarkModeToggle.jsx
│       ├── design/page.js     # Semua design works (fetch Supabase, fallback statis)
│       ├── video/page.js      # Semua video works (fetch Supabase, fallback statis)
│       ├── lua-manifest/page.js
│       ├── admin/
│       │   ├── layout.js      # Passthrough (auth di proxy.js)
│       │   ├── page.js        # Dashboard ringkasan
│       │   ├── CrudManager.jsx# Komponen CRUD generik (client)
│       │   ├── login/         # Halaman + layout login (tanpa guard)
│       │   ├── projects/      # CRUD projects (web, bot, android)
│       │   ├── design/        # CRUD design + design_images
│       │   └── video/         # CRUD video gallery
│       └── api/
│           ├── cv/route.js            # GET serve PDF lokal
│           ├── upload/route.js        # POST upload gambar ke Storage (auth)
│           └── admin/
│               ├── login/route.js     # POST login (rate-limited)
│               ├── logout/route.js    # POST logout
│               └── [table]/route.js   # CRUD generik tabel whitelist (auth)
```

---

## 4. Diagram Layer

```
┌────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                            │
│  PWA · Remixicon CDN · GSAP animations · Theme persistence   │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼─────────────────────────────────┐
│  EDGE / PROXY  (src/proxy.js)                                │
│  Guard /admin/* (kecuali /admin/login) via cookie session    │
├──────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER  (src/app/*)                             │
│  ┌──────────────┬──────────┬───────┬───────────────────────┐│
│  │ page.js      │ design/  │ video/│ admin/ (CRUD)          ││
│  │ (one page)   │ (semua)  │(semua)│ + login / dashboard    ││
│  └──────────────┴──────────┴───────┴───────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│  CROSS-CUTTING                                               │
│  layout.js · providers.jsx · DarkModeToggle · globals.css    │
├──────────────────────────────────────────────────────────────┤
│  API / SERVER LAYER                                          │
│  api/cv            → serve CV PDF                            │
│  api/admin/login   → set cookie (rate-limited 5x/15 menit)  │
│  api/admin/logout  → hapus cookie                            │
│  api/admin/[table] → CRUD generik (whitelist + auth)         │
│  api/upload        → upload ke Supabase Storage (auth)       │
├──────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                  │
│  Supabase Postgres:                                          │
│    projects · project_images · designs · design_images       │
│    videos · skills  — semua dengan RLS                       │
│  ↳ FALLBACK statis bila env Supabase kosong                  │
├──────────────────────────────────────────────────────────────┤
│  STATIC ASSETS  (public/)                                    │
│  image/ · cv-galang.pdf · manifest.json · favicon            │
└──────────────────────────────────────────────────────────────┘
        │                    │                      │
        ▼                    ▼                      ▼
┌───────────────┐   ┌─────────────────┐   ┌──────────────────────┐
│  Formspree    │   │  Supabase        │   │ Drive/YouTube/Vimeo  │
│ (submit form) │   │ (DB · Storage)   │   │ (embed video iframe) │
└───────────────┘   └─────────────────┘   └──────────────────────┘
```

---

## 5. Routing & Halaman

| Route | File | Fungsi |
|-------|------|--------|
| `/` | `page.js` | One single page: hero → about → skills → projects (web/bot/android) → design featured → video featured → contact |
| `/design` | `design/page.js` | Semua design works — grid + lightbox multi-image |
| `/video` | `video/page.js` | Semua video — grid thumbnail + embed player |
| `/lua-manifest` | `lua-manifest/page.js` | Generator file manifest.lua |
| `/admin` | `admin/page.js` | Dashboard (terproteksi proxy) |
| `/admin/login` | `admin/login/page.js` | Form login (dikecualikan dari guard) |
| `/admin/projects` | `admin/projects/page.js` | CRUD projects semua tipe |
| `/admin/design` | `admin/design/page.js` | CRUD design + upload multi-image |
| `/admin/video` | `admin/video/page.js` | CRUD video |
| `/api/cv` | `api/cv/route.js` | Serve cv-galang.pdf |
| `/api/admin/login` | `api/admin/login/route.js` | Login + set cookie |
| `/api/admin/logout` | `api/admin/logout/route.js` | Hapus cookie |
| `/api/admin/[table]` | `api/admin/[table]/route.js` | CRUD generik (whitelist tabel) |
| `/api/upload` | `api/upload/route.js` | Upload gambar ke Storage |

---

## 6. Homepage — Section Structure

```
/ (one single page)
│
├── Hero
├── About
├── Skills (bento grid — dari tabel skills)
│
├── Projects
│   ├── 🌐 Web & Fullstack   (type = 'web')
│   ├── 🤖 Bot & Automation  (type = 'bot')
│   └── 📱 Android Apps      (type = 'android')
│       └── Screenshot gallery per app (annotated, dari project_images)
│
├── Design Works             (featured = true, dari tabel designs)
│   └── Grid → klik → lightbox (gambar dari design_images)
│   └── Tombol "Lihat Semua" → /design
│
├── Video Works              (featured = true, dari tabel videos)
│   └── Grid thumbnail → klik → embed player
│   └── Tombol "Lihat Semua" → /video
│
└── Contact (Formspree)
```

---

## 7. Data Model

### Tabel Supabase

#### `projects`
| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| title | text | Nama project |
| description | text | Deskripsi |
| tags | text[] | Tech stack |
| type | text | `web` / `bot` / `android` / `other` |
| thumbnail_url | text | URL dari Supabase Storage bucket `thumbnails` |
| github_url | text | Link repo |
| demo_url | text | Link live demo (web) |
| play_store_url | text | Link Play Store (android, opsional) |
| apk_url | text | Link download APK (android, opsional) |
| status | text | `completed` / `wip` / `private` |
| featured | boolean | Tampil di homepage |
| sort_order | integer | Urutan tampil |
| created_at | timestamptz | — |
| updated_at | timestamptz | Auto-update via trigger |

#### `project_images`
Annotated screenshots — utamanya untuk Android apps.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| project_id | uuid | FK → projects.id (cascade delete) |
| image_url | text | URL screenshot |
| caption | text | Judul singkat: "Halaman Pembayaran" |
| description | text | Deskripsi: "Mendukung GoPay, OVO, QRIS..." |
| sort_order | integer | Urutan slide |
| created_at | timestamptz | — |

#### `designs`
| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| title | text | Nama project design |
| category | text | Kategori bebas: `branding`, `ui`, dll |
| cover_image_url | text | Gambar cover untuk grid |
| description | text | Deskripsi singkat |
| featured | boolean | Tampil di homepage |
| sort_order | integer | Urutan tampil |
| created_at / updated_at | timestamptz | — |

#### `design_images`
Simple gallery per project design, tanpa caption.

| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| design_id | uuid | FK → designs.id (cascade delete) |
| image_url | text | URL gambar |
| sort_order | integer | Urutan di lightbox |
| created_at | timestamptz | — |

#### `videos`
| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| title | text | Judul video |
| thumbnail_url | text | URL thumbnail |
| video_url | text | URL video asli |
| platform | text | `youtube` / `drive` / `vimeo` |
| description | text | Deskripsi |
| featured | boolean | Tampil di homepage |
| sort_order | integer | Urutan tampil |
| created_at / updated_at | timestamptz | — |

#### `skills`
| Field | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| category | text | Nama kategori skill |
| icon | text | Nama icon (Remixicon) |
| items | text[] | List skill dalam kategori |
| span | text | CSS span untuk bento grid |
| color | text | Warna aksen |
| sort_order | integer | Urutan bento grid |
| created_at / updated_at | timestamptz | — |

### RLS Policy

Semua tabel: `enable row level security` + policy `public read` (`select using (true)`).
Operasi write hanya lewat **service_role** di API routes server-side (bypass RLS by default).

### Fallback Statis

Bila env Supabase tidak diset, halaman publik fallback ke konstanta in-code:

| Konstanta | Dipakai di |
|-----------|------------|
| `SKILLS_DATA` | `page.js` |
| `DEV_PROJECTS` | `page.js` |
| `FEATURED_CREATIVE` | `page.js` |
| `GALLERY_DATA` | `design/page.js` |
| `FALLBACK_VIDEOS` | `video/page.js` |

---

## 8. Tampilan Project per Tipe

### Web & Bot
- Thumbnail + judul + tags
- Tombol **GitHub** (bila `github_url` ada)
- Tombol **Live Demo** (bila `demo_url` ada)

### Android
- Thumbnail + judul + tags
- Annotated screenshot gallery (lightbox dari `project_images`)
  - Setiap gambar: caption + deskripsi
- Tombol **GitHub** (bila `github_url` ada)
- Tombol **Play Store** (bila `play_store_url` ada)
- Tombol **Download APK** (bila `apk_url` ada)

### Design
- Cover image di grid
- Klik → lightbox slide semua gambar dari `design_images`

---

## 9. Autentikasi & Admin Panel

- **Login:** `POST /api/admin/login` — bandingkan dengan `ADMIN_PASSWORD` env, set cookie `admin_session` (`httpOnly`, `secure`, `sameSite=strict`, 7 hari).
- **Rate limit:** in-memory per-IP, 5 gagal / 15 menit → `429 Retry-After`. *(Single instance; multi-instance perlu Upstash Redis.)*
- **Guard:** `src/proxy.js` memblokir semua `/admin/*` kecuali `/admin/login`.
- **CRUD:** `api/admin/[table]` (GET/POST/PUT/DELETE) dengan whitelist tabel: `projects, project_images, designs, design_images, videos, skills`.
- **Upload:** `api/upload` → Supabase Storage bucket `thumbnails` (public), kembalikan public URL.

---

## 10. Konfigurasi Build & Keamanan

- **React Compiler** aktif → auto-memoization.
- **Image optimization**: AVIF/WebP, cache 24 jam, `remotePatterns` izinkan semua HTTPS.
- **Security headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`.
- **Kompresi** aktif.

---

## 11. SEO & PWA

- Metadata lengkap: title, description, OG, Twitter Card.
- Sitemap: `/` (priority 1), `/design` (0.9), `/video` (0.8).
- Robots: disallow `/api/`, `/admin/`.
- PWA: manifest.json, theme-color, apple-mobile-web-app.

---

## 12. Trade-off & Catatan

| Aspek | Catatan |
|-------|---------|
| Client-side fetch | Halaman publik fetch via `useEffect` karena `'use client'` (GSAP). Untuk SEO data CMS pertimbangkan Server Component wrapper. |
| Rate limiter | In-memory, hanya andal di single instance. Scale → Upstash Redis. |
| Auth | Single password + cookie — cukup untuk satu pemilik. |
| `sort_order` tiebreaker | Query publik selalu `order by sort_order asc, created_at desc`. |
| Cascade delete | `project_images` dan `design_images` auto-delete saat project/design dihapus. |

---

## 13. Deployment

```bash
npm install
npm run dev        # localhost:3000
npm run build
npm start
npm run lint
```

**Env wajib untuk CMS** (`.env.local` & Vercel Dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

**Setup awal Supabase:**
1. Jalankan `supabase_schema.sql` di SQL Editor
2. Buat bucket publik `thumbnails` di Storage
3. Set semua env di Vercel

Tanpa env Supabase, situs tetap berjalan dengan data statis (fallback).

---

*Dokumen ini mendeskripsikan arsitektur Portofolang per Mei 2026. Perbarui bila struktur folder, routing, atau integrasi eksternal berubah.*