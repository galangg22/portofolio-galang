# Portofolang — Migration Plan
> Migrasi dari static in-code constants → Supabase + Admin Panel

---

## Status Arsitektur Saat Ini

| Aspek | Kondisi | Catatan |
|-------|---------|---------|
| Data storage | Konstanta hardcoded di `page.js` | Perlu edit kode tiap tambah konten |
| Halaman galeri | `/design` (design + video digabung) | Akan dipisah |
| Backend | Stateless, tidak ada DB | Akan ditambah Supabase |
| Auth admin | Belum ada | Akan pakai env-based password |
| CV endpoint | `/api/cv` baca PDF lokal | Tetap, tidak berubah |
| README vs impl | Tidak sinkron (CV) | Fix di akhir |

---

## Target Arsitektur Baru

```
src/app/
├── page.js                  ← fetch projects + skills dari Supabase
├── design/
│   └── page.js              ← fetch designs dari Supabase
├── video/                   ← NEW
│   └── page.js              ← fetch videos dari Supabase
├── admin/
│   ├── layout.js            ← cek cookie admin_session
│   ├── page.js              ← dashboard (ringkasan semua data)
│   ├── login/
│   │   └── page.js          ← form login password
│   ├── projects/
│   │   └── page.js          ← CRUD dev projects
│   ├── design/
│   │   └── page.js          ← CRUD design gallery
│   └── video/
│       └── page.js          ← CRUD video gallery
└── api/
    ├── cv/route.js          ← existing, tidak berubah
    ├── admin/
    │   ├── login/route.js   ← POST: cek password, set cookie
    │   └── logout/route.js  ← POST: hapus cookie
    └── upload/route.js      ← POST: upload gambar ke Supabase Storage
```

---

## Fase 1 — Supabase Setup

### 1.1 Buat Project di Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Catat:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (hanya di server)

### 1.2 SQL Schema

Jalankan di **Supabase → SQL Editor**:

```sql
-- ============================================================
-- TABLE: projects (dev work)
-- ============================================================
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  tags        text[] default '{}',
  thumbnail_url text,
  github_url  text,
  demo_url    text,
  status      text default 'completed' check (status in ('completed', 'wip', 'private')),
  featured    boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE: designs (galeri design)
-- ============================================================
create table public.designs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text default 'design',
  image_url   text,
  description text,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE: videos (galeri video)
-- ============================================================
create table public.videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  thumbnail_url text,
  video_url     text not null,
  platform      text default 'youtube' check (platform in ('youtube', 'drive', 'vimeo')),
  description   text,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

-- ============================================================
-- TABLE: skills (bento grid di homepage)
-- ============================================================
create table public.skills (
  id       uuid primary key default gen_random_uuid(),
  category text not null,
  icon     text,
  items    text[] default '{}',
  span     text default 'col-span-1',
  color    text,
  sort_order integer default 0
);

-- ============================================================
-- RLS: izinkan read publik, write hanya via service_role
-- ============================================================
alter table public.projects enable row level security;
alter table public.designs  enable row level security;
alter table public.videos   enable row level security;
alter table public.skills   enable row level security;

-- Policy: siapa pun boleh baca
create policy "public read projects" on public.projects for select using (true);
create policy "public read designs"  on public.designs  for select using (true);
create policy "public read videos"   on public.videos   for select using (true);
create policy "public read skills"   on public.skills   for select using (true);

-- Write hanya dari service_role (dipakai di API routes server-side)
-- Tidak perlu policy tambahan — service_role bypass RLS by default
```

### 1.3 Storage Bucket

Di **Supabase → Storage → New Bucket**:
- Bucket name: `thumbnails`
- Public: ✅ (centang)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

---

## Fase 2 — Environment Variables

### `.env.local` (lokal)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# Admin
ADMIN_PASSWORD=ganti_dengan_password_kuat_kamu
```

### Vercel Dashboard

Tambahkan semua env di atas di:
**Vercel → Project → Settings → Environment Variables**

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` dan `ADMIN_PASSWORD` jangan pernah di-expose ke client.
> Keduanya hanya dipakai di server-side (API routes).

---

## Fase 3 — Install Dependencies

```bash
npm install @supabase/supabase-js
```

Tidak perlu library auth tambahan — kita pakai cookie sederhana via Next.js `cookies()`.

---

## Fase 4 — File Baru yang Perlu Dibuat

### 4.1 Supabase Client Helper

**`src/lib/supabase.js`** — client untuk halaman publik (anon key):
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**`src/lib/supabase-admin.js`** — client untuk API routes (service role):
```js
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### 4.2 Auth Helper

**`src/lib/auth.js`**:
```js
import { cookies } from 'next/headers'

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}
```

### 4.3 API: Login & Logout

**`src/app/api/admin/login/route.js`**:
```js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
```

**`src/app/api/admin/logout/route.js`**:
```js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ ok: true })
}
```

### 4.4 API: Upload Gambar

**`src/app/api/upload/route.js`**:
```js
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from('thumbnails')
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from('thumbnails').getPublicUrl(filename)
  return NextResponse.json({ url: data.publicUrl })
}
```

### 4.5 Admin Layout (Auth Guard)

**`src/app/admin/layout.js`**:
```js
import { isAdminAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) redirect('/admin/login')
  return <>{children}</>
}
```

> ⚠️ Layout ini **tidak** melindungi `/admin/login` itu sendiri.
> Buat `src/app/admin/login/layout.js` yang kosong (tanpa auth check) untuk override.

**`src/app/admin/login/layout.js`**:
```js
export default function LoginLayout({ children }) {
  return <>{children}</>
}
```

---

## Fase 5 — Refactor Halaman Publik

### 5.1 Homepage (`page.js`)

Ganti konstanta hardcoded dengan fetch Supabase:

```js
// Sebelum
const DEV_PROJECTS = [ ... ]

// Sesudah — di luar komponen (Server Component fetch)
async function getProjects() {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'completed') // atau tampilkan semua kecuali 'private'
    .order('featured', { ascending: false })
    .order('sort_order')
  return data ?? []
}
```

> Karena `page.js` saat ini pakai `'use client'` (karena GSAP + state),
> fetch data harus dipindah ke **Server Component wrapper** atau pakai
> `useEffect` + Supabase client-side. Rekomendasi: pisahkan data fetching
> ke Server Component, passing data sebagai props ke Client Component.

### 5.2 Halaman `/design` (refactor)

```js
async function getDesigns() {
  const { data } = await supabase
    .from('designs')
    .select('*')
    .order('sort_order')
  return data ?? []
}
```

### 5.3 Halaman `/video` (baru)

Buat `src/app/video/page.js` dengan fetch dari tabel `videos`.
Support embed YouTube, Google Drive, dan Vimeo via `video_url` + `platform` field.

```js
// Helper embed URL
function getEmbedUrl(videoUrl, platform) {
  if (platform === 'youtube') {
    const id = new URL(videoUrl).searchParams.get('v')
    return `https://www.youtube.com/embed/${id}`
  }
  if (platform === 'drive') {
    const id = videoUrl.match(/\/d\/([^/]+)/)?.[1]
    return `https://drive.google.com/file/d/${id}/preview`
  }
  return videoUrl
}
```

---

## Fase 6 — Admin Panel UI

### Halaman Login (`/admin/login`)

Form sederhana: input password + tombol masuk.
Fetch `POST /api/admin/login`, redirect ke `/admin` jika berhasil.

### Dashboard (`/admin`)

Tampilkan ringkasan:
- Jumlah projects, designs, videos
- Tombol logout
- Link ke masing-masing CRUD page

### CRUD Projects (`/admin/projects`)

Form fields:
| Field | Input | Wajib |
|-------|-------|-------|
| title | text | ✅ |
| description | textarea | |
| tags | text (comma separated) | |
| thumbnail | file upload | |
| github_url | url | |
| demo_url | url | |
| status | select (completed/wip/private) | ✅ |
| featured | checkbox | |
| sort_order | number | |

### CRUD Designs (`/admin/design`)

Form fields: title, category, image upload, description, sort_order

### CRUD Videos (`/admin/video`)

Form fields: title, video_url, platform (select), thumbnail upload, description, sort_order

---

## Fase 7 — Migrasi Data Lama

Setelah schema siap, pindahkan data dari konstanta ke Supabase.
Bisa pakai SQL INSERT langsung atau form admin.

### Contoh INSERT projects:

```sql
insert into public.projects (title, description, tags, github_url, status, featured)
values
  ('Bot WA Reminder Absensi', 'Sistem automasi backend untuk memonitor jadwal dan mengirimkan pengingat absensi secara otomatis via WhatsApp.', '{"Node.js","Baileys API","Automation"}', 'https://github.com/galangg22/bot-presensi', 'completed', true),
  ('Sistem Web TPQ Al-Hikmah', 'Platform sistem informasi manajemen untuk digitalisasi administrasi santri dan guru.', '{"Web Dev","HTML","CSS"}', 'https://github.com/galangg22/alhikmah', 'completed', false),
  ('ThriftyFinds E-Commerce', 'Katalog e-commerce modern untuk produk thrifting.', '{"React/Next.js","Tailwind","E-Commerce"}', 'https://github.com/galangg22/thriftyfinds', 'completed', true),
  ('HeartHorizon / Online Class', 'Aplikasi e-learning interaktif.', '{"LMS","Fullstack","Database"}', 'https://github.com/galangg22/hearthorizon', 'completed', false);
```

---

## Fase 8 — Fix yang Perlu Dilakukan

| # | Masalah | Fix |
|---|---------|-----|
| 1 | README bilang CV dari Google Drive, kode baca PDF lokal | Update README — implementasinya sudah benar (lokal lebih reliable) |
| 2 | `/design` gabung design + video | Pisah jadi `/design` dan `/video` |
| 3 | Data hardcoded di `page.js` | Pindah ke Supabase (ini seluruh fase 1-5) |
| 4 | `GALLERY_DATA` coupling di `design/page.js` | Resolve otomatis setelah pindah ke Supabase |
| 5 | Versi Next.js di dokumen disebut "tidak exist" | Next.js 16 valid, update catatan arsitektur |

---

## Urutan Pengerjaan (Checklist)

```
Fase 1 — Supabase
[ ] Buat project di Supabase
[ ] Jalankan SQL schema
[ ] Buat storage bucket "thumbnails"

Fase 2 — Environment
[ ] Isi .env.local
[ ] Tambah env di Vercel dashboard

Fase 3 — Dependencies
[ ] npm install @supabase/supabase-js

Fase 4 — File baru (lib + api)
[ ] src/lib/supabase.js
[ ] src/lib/supabase-admin.js
[ ] src/lib/auth.js
[ ] src/app/api/admin/login/route.js
[ ] src/app/api/admin/logout/route.js
[ ] src/app/api/upload/route.js
[ ] src/app/admin/layout.js
[ ] src/app/admin/login/layout.js

Fase 5 — Refactor halaman publik
[ ] Refactor page.js (homepage)
[ ] Refactor design/page.js
[ ] Buat video/page.js

Fase 6 — Admin panel UI
[ ] admin/login/page.js
[ ] admin/page.js (dashboard)
[ ] admin/projects/page.js
[ ] admin/design/page.js
[ ] admin/video/page.js

Fase 7 — Migrasi data lama
[ ] INSERT projects ke Supabase
[ ] INSERT designs ke Supabase
[ ] INSERT videos ke Supabase
[ ] Upload thumbnail lama ke Storage

Fase 8 — Fix & cleanup
[ ] Update README (CV section)
[ ] Update ARCHITECTURE.md
[ ] Update robots.js (tambah /admin ke disallow)
[ ] Test semua route
[ ] Push & deploy ke Vercel
```

---

## Catatan Penting

- **`SUPABASE_SERVICE_ROLE_KEY`** bypass RLS — jangan pernah dipakai di client-side atau expose ke browser.
- **`sort_order`** field memungkinkan kamu atur urutan tampil project dari admin panel tanpa harus drag-drop (cukup ubah angka).
- **Status `private`** bisa dipakai untuk project yang belum siap ditampilkan — filter di query publik cukup `.neq('status', 'private')`.
- Karena `page.js` pakai `'use client'` (GSAP), pertimbangkan pisahkan menjadi Server Component untuk data fetching + Client Component untuk animasi. Ini meningkatkan performa dan menghindari fetch di client.
- Tambahkan `/admin` ke `disallow` di `robots.js` agar tidak diindex crawler.

---

*Dokumen ini adalah rencana migrasi Portofolang — Mei 2026.*
