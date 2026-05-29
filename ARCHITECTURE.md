# Arsitektur Project — Portofolang

> Portfolio website untuk **Galang Arrauf Pramudito** (Backend Developer & Creative Enthusiast).
> Live: https://galang-arrauf.com

---

## 1. Gambaran Umum

Portofolang adalah aplikasi web portfolio berbasis **Next.js 16 (App Router)**. Arsitekturnya **hybrid**: konten dikelola lewat **Supabase (CMS + Postgres)** dengan **admin panel** di `/admin`, namun bila env Supabase tidak diset, seluruh halaman publik **fallback otomatis ke data statis** (konstanta in-code). Halaman interaktif dirender sebagai **Client Components**, sementara endpoint server (auth, upload, CRUD, CV) memakai **Route Handlers**.

Filosofi desain:
- **CMS opsional, fallback aman** → bisa jalan tanpa backend; aktifkan Supabase untuk kelola konten tanpa edit kode.
- **Progressive enhancement** → mobile-first, PWA-ready, SEO-first.
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

Integrasi eksternal: **Supabase** (database, storage, CMS), **Formspree** (form kontak), **Google Drive/YouTube/Vimeo** (embed video), **Remixicon CDN** (ikon).

---

## 3. Struktur Direktori

```
portofolang/
├── public/
│   ├── image/                 # Gambar proyek, thumbnail, foto profil
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
│       ├── page.js            # Beranda (fetch projects+skills, fallback statis)
│       ├── components/
│       │   └── DarkModeToggle.jsx
│       ├── design/page.js     # Galeri desain (fetch designs, fallback statis)
│       ├── video/page.js      # Galeri video (fetch videos, fallback statis)
│       ├── lua-manifest/page.js
│       ├── admin/             # Admin panel
│       │   ├── layout.js      # Passthrough (auth di proxy.js)
│       │   ├── page.js        # Dashboard
│       │   ├── CrudManager.jsx# Komponen CRUD generik (client)
│       │   ├── login/         # Halaman + layout login (tanpa guard)
│       │   ├── projects/      # CRUD dev projects
│       │   ├── design/        # CRUD design gallery
│       │   └── video/         # CRUD video gallery
│       ├── api/
│       │   ├── cv/route.js            # GET serve PDF lokal
│       │   ├── upload/route.js        # POST upload gambar ke Storage (auth)
│       │   └── admin/
│       │       ├── login/route.js     # POST login (rate-limited)
│       │       ├── logout/route.js    # POST logout
│       │       └── [table]/route.js   # CRUD generik tabel whitelist (auth)
│       ├── not-found.js · error.js
│       ├── sitemap.js · robots.js
├── next.config.mjs
├── postcss.config.mjs · eslint.config.mjs · jsconfig.json
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
│  Guard /admin/* (kecuali /admin/login) via cookie session   │
├──────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER  (src/app/*)  — Client Components        │
│  ┌────────┬────────┬───────┬──────────────┬───────────────┐ │
│  │ page.js│ design/│ video/│ lua-manifest/│ admin/ (CRUD)  │ │
│  │ (home) │(galeri)│(galeri)│ (tool)      │ + login/dash   │ │
│  └────────┴────────┴───────┴──────────────┴───────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  CROSS-CUTTING                                               │
│  layout.js · providers.jsx (ThemeProvider) ·                 │
│  DarkModeToggle · TopLoader · globals.css                    │
├──────────────────────────────────────────────────────────────┤
│  API / SERVER LAYER  (Route Handlers)                        │
│  api/cv         → serve public/cv-galang.pdf                 │
│  api/admin/login (rate-limited) · logout · [table] (CRUD)    │
│  api/upload     → Supabase Storage (auth-guarded)            │
│  lib: supabase (anon) · supabase-admin (service) · auth      │
├──────────────────────────────────────────────────────────────┤
│  SEO LAYER                                                   │
│  sitemap.js → /sitemap.xml   ·   robots.js → /robots.txt     │
├──────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                  │
│  Supabase Postgres (projects·designs·videos·skills) + RLS    │
│  ↳ FALLBACK statis bila env Supabase kosong                  │
│    (SKILLS_DATA · DEV_PROJECTS · FEATURED_CREATIVE · GALLERY)│
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

| Route | Tipe | File | Rendering | Fungsi |
|-------|------|------|-----------|--------|
| `/` | Page | `page.js` | Client | Beranda: hero, about, skills, projects, visual works, contact |
| `/design` | Page | `design/page.js` | Client | Galeri masonry desain (fetch Supabase, fallback statis) |
| `/video` | Page | `video/page.js` | Client | Galeri video + embed (fetch Supabase, fallback statis) |
| `/lua-manifest` | Page | `lua-manifest/page.js` | Client | Generator file `manifest.lua` + template |
| `/admin` | Page | `admin/page.js` | Client | Dashboard (terproteksi proxy) |
| `/admin/login` | Page | `admin/login/page.js` | Client | Form login (dikecualikan dari guard) |
| `/admin/{projects,design,video}` | Page | `admin/*/page.js` | Client | CRUD via `CrudManager` (terproteksi) |
| `/api/cv` | Route Handler | `api/cv/route.js` | Server | Serve `cv-galang.pdf` (inline) |
| `/api/admin/login` | Route Handler | `api/admin/login/route.js` | Server | Login + set cookie (rate-limited) |
| `/api/admin/logout` | Route Handler | `api/admin/logout/route.js` | Server | Hapus cookie |
| `/api/admin/[table]` | Route Handler | `api/admin/[table]/route.js` | Server | CRUD generik (auth, whitelist tabel) |
| `/api/upload` | Route Handler | `api/upload/route.js` | Server | Upload gambar ke Storage (auth) |
| `/sitemap.xml` | Metadata | `sitemap.js` | Server | Sitemap (home + design) |
| `/robots.txt` | Metadata | `robots.js` | Server | Robots (disallow `/api/`, `/admin/`) |
| `*` (tidak ditemukan) | Page | `not-found.js` | Client | 404 kustom |

---

## 6. Komponen Utama (`/` — page.js)

State lokal (React Hooks):
- `activeSection` — section aktif untuk highlight navbar (di-update via scroll listener).
- `isIslandHovered` — buka/tutup Dynamic Island navbar (hover di desktop, tap di mobile).
- `selectedVideo` — URL video aktif untuk modal player.
- `isCvModalOpen` — modal konfirmasi unduh/buka CV.

Section: **Hero** → **About** → **Skills** (bento grid) → **Projects** (dev cards) → **Visual Works** (2 featured) → **Contact** (form Formspree) → **Footer**.

Animasi GSAP di-scope dengan `gsap.context()` di dalam `useEffect`, dan dibersihkan via `ctx.revert()` saat unmount untuk mencegah memory leak.

---

## 7. Data Model

Sumber data utama adalah **Supabase Postgres**. Bila env Supabase kosong, halaman publik fallback ke konstanta in-code.

### Tabel Supabase (`supabase_schema.sql`)

| Tabel | Field utama | Dipakai oleh |
|-------|-------------|--------------|
| `projects` | `title, description, tags[], thumbnail_url, github_url, demo_url, status, featured, sort_order` | `/` (dev cards) |
| `designs` | `title, category, image_url, description, sort_order` | `/design` |
| `videos` | `title, video_url, platform, thumbnail_url, description, sort_order` | `/video` |
| `skills` | `category, icon, items[], span, color, sort_order` | `/` (bento grid) |

**RLS:** keempat tabel `enable row level security` dengan policy **public read** (`select using (true)`).
Operasi tulis hanya lewat **service_role** (di API routes server-side) yang **bypass RLS** — tidak ada policy write untuk anon.

### Fallback statis (bila Supabase off)

| Konstanta | Lokasi | Field utama |
|-----------|--------|-------------|
| `SKILLS_DATA` | `page.js` | `category, icon, items[], span, color` |
| `DEV_PROJECTS` | `page.js` | `title, image, gradient, icon, tags[], desc, link, ...` |
| `FEATURED_CREATIVE` | `page.js` | `id, title, category, image, desc, type, videoUrl?` |
| `GALLERY_DATA` | `design/page.js` | `id, title, category, image, desc, videoUrl?` |
| `FALLBACK_VIDEOS` | `video/page.js` | `id, title, thumbnail_url, video_url, platform, description` |

> Halaman publik memetakan baris Supabase → bentuk yang dipakai JSX (mis. `thumbnail_url`→`image`,
> `demo_url/github_url`→`link`) di dalam `useEffect`, lalu fallback bila hasil kosong/null.

---

## 7b. Autentikasi & CMS

- **Login:** `POST /api/admin/login` membandingkan password dengan `ADMIN_PASSWORD`; jika cocok set
  cookie `admin_session` (`httpOnly`, `sameSite=strict`, `secure` di produksi, masa berlaku 7 hari).
- **Rate limit:** in-memory per-IP, **5 percobaan gagal / 15 menit**, balas `429` dengan `Retry-After`.
  (Single-instance; untuk multi-instance gunakan store eksternal seperti Upstash Redis.)
- **Guard:** `src/proxy.js` (konvensi *proxy* Next.js 16, pengganti *middleware*) memblokir `/admin/*`
  kecuali `/admin/login`, redirect ke login bila cookie tak valid. Memakai proxy (bukan layout redirect)
  untuk menghindari infinite redirect loop pada halaman login.
- **CRUD:** `api/admin/[table]` (GET/POST/PUT/DELETE) dengan **whitelist** tabel (`projects, designs,
  videos, skills`) dan cek auth untuk operasi tulis. UI memakai komponen reusable `CrudManager`.
- **Upload:** `api/upload` mengunggah gambar ke bucket Storage publik `thumbnails` (auth-guarded),
  mengembalikan public URL.

---

## 8. Styling & Theming

- **Tailwind CSS v4** dengan custom theme di `@theme` (`globals.css`):
  `--color-bg-dark`, `--color-card-bg`, `--color-primary` (ungu), `--color-accent` (hijau neon).
- **Dark mode default**, light mode via class `html.light` dengan override CSS variabel + utility (`bg-white/5`, `text-gray-400`, dll) demi kontras yang terbaca.
- **next-themes** (`attribute="class"`, `defaultTheme="dark"`) menyimpan preferensi tema; `DarkModeToggle` melakukan switch.
- **Hover cerdas**: `@media (hover: hover) and (pointer: fine)` memastikan efek hover hanya aktif di perangkat berkursor, bukan layar sentuh.

---

## 9. API: `/api/cv`

```
GET /api/cv
 ├─ baca public/cv-galang.pdf (readFileSync)
 ├─ sukses → response PDF (Content-Type: application/pdf, inline, cache 1 jam)
 └─ gagal  → redirect ke /cv-galang.pdf (fallback)
```

Endpoint stateless, tidak butuh autentikasi (file publik). Diblokir dari crawler via `robots.txt` (`disallow: /api/`).

---

## 10. Konfigurasi Build & Keamanan (`next.config.mjs`)

- **React Compiler** aktif (`reactCompiler: true`) → auto-memoization.
- **Image optimization**: format AVIF/WebP, cache 24 jam, device/image sizes terdefinisi, `remotePatterns` izinkan semua host HTTPS.
- **Security headers** (semua route):
  `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  `X-DNS-Prefetch-Control: on`.
- **Kompresi** respons aktif (`compress: true`).

---

## 11. SEO & PWA

- **Metadata** lengkap di `layout.js`: title, description, keywords, Open Graph, Twitter Card.
- **Sitemap** dinamis (`/sitemap.xml`) — home (priority 1) & design (0.9).
- **Robots** (`/robots.txt`) — allow semua kecuali `/api/` dan `/admin/`.
- **PWA** — `manifest.json`, theme-color (dark/light), apple-mobile-web-app meta.

---

## 12. Karakteristik & Trade-off

**Kelebihan**
- **CMS via admin panel** — kelola konten tanpa edit kode/redeploy.
- **Fallback statis** — situs tetap jalan tanpa Supabase (resilient, mudah demo).
- Secrets server-only; security headers aktif; login rate-limited.
- SEO & performa kuat (image optimization, compress, React Compiler).

**Keterbatasan / catatan**
- Rate limiter in-memory hanya andal di **single instance**; serverless multi-instance perlu store eksternal (mis. Upstash).
- Ketergantungan eksternal: Supabase (DB/Storage), Formspree (kuota free tier), Drive/YouTube/Vimeo (ketersediaan video).
- Auth admin berbasis single password + cookie — cukup untuk satu pemilik, bukan multi-user/role.
- Halaman publik fetch di client (`useEffect`); untuk SEO data CMS pertimbangkan Server Component fetch.

---

## 13. Deployment

```bash
npm install        # install dependency
npm run dev        # development (localhost:3000)
npm run build      # build produksi
npm start          # jalankan hasil build
npm run lint       # cek kualitas kode
```

Target deploy utama: **Vercel** (otomatis di setiap git push).

**Env wajib untuk CMS** (set di `.env.local` & Vercel): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`.
Setup awal: jalankan `supabase_schema.sql` di SQL Editor + buat bucket publik `thumbnails`.
Tanpa env ini, situs tetap berjalan dengan data statis (fallback).

---

*Dokumen ini mendeskripsikan arsitektur Portofolang per Mei 2026. Perbarui bila struktur folder, routing, atau integrasi eksternal berubah.*
