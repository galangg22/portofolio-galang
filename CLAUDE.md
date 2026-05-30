# CLAUDE.md — Portofolang Implementation Guide

Dokumen ini adalah panduan implementasi lengkap untuk Claude Code atau siapapun yang mengerjakan codebase ini. Baca seluruh dokumen sebelum menulis kode apapun.

---

## Konteks Project

Portfolio website untuk **Galang Arrauf Pramudito** (Backend Developer & Creative Enthusiast).
- Live: https://galang-arrauf.com
- Stack: Next.js 16.2.4, React 19.2.4, Tailwind CSS v4, Supabase, GSAP

Arsitektur lengkap ada di `ARCHITECTURE.md`. Baca itu dulu sebelum lanjut.

---

## Yang Sudah Ada (Jangan Diubah)

- `src/app/page.js` — homepage one single page, sudah ada animasi GSAP, Dynamic Island navbar, semua section. **Jangan rewrite, hanya extend.**
- `src/app/design/page.js` — galeri design, sudah jalan dengan data statis.
- `src/app/lua-manifest/page.js` — tool generator, tidak perlu disentuh.
- `src/app/layout.js`, `providers.jsx`, `globals.css` — jangan diubah kecuali ada keperluan spesifik.
- `src/app/components/DarkModeToggle.jsx` — jangan diubah.
- `next.config.mjs` — sudah ada security headers, image optimization, React Compiler.
- `supabase_schema.sql` — schema final, sudah dijalankan di Supabase.

---

## Yang Perlu Dibuat (Urutan Prioritas)

### 1. Supabase Client Libraries

**`src/lib/supabase.js`**
Client publik untuk halaman publik (anon key, aman di client):
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**`src/lib/supabase-admin.js`**
Client service-role — HANYA dipakai di server-side (API routes). Jangan pernah import di komponen client:
```js
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

**`src/lib/auth.js`**
Helper cek cookie admin session:
```js
import { cookies } from 'next/headers'

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}
```

---

### 2. Environment Variables

Buat `.env.local` di root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
ADMIN_PASSWORD=password_kuat_kamu
```

Tambahkan semua env yang sama di Vercel Dashboard → Project → Settings → Environment Variables.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` dan `ADMIN_PASSWORD` tidak boleh punya prefix `NEXT_PUBLIC_`.
> Keduanya server-only dan tidak boleh pernah sampai ke browser.

---

### 3. API Routes

#### `src/app/api/admin/login/route.js`

Rate limiter in-memory (5 gagal / 15 menit per IP):

```js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const attempts = new Map() // ip → { count, resetAt }

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const record = attempts.get(ip)

  if (record && now < record.resetAt && record.count >= 5) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many attempts' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    const current = record && now < record.resetAt ? record : { count: 0, resetAt: now + 15 * 60 * 1000 }
    attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt })
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  attempts.delete(ip)
  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
```

#### `src/app/api/admin/logout/route.js`

```js
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return NextResponse.json({ ok: true })
}
```

#### `src/app/api/admin/[table]/route.js`

CRUD generik dengan whitelist tabel. Whitelist yang diizinkan:
`projects`, `project_images`, `designs`, `design_images`, `videos`, `skills`

```js
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/auth'
import { NextResponse } from 'next/server'

const WHITELIST = ['projects', 'project_images', 'designs', 'design_images', 'videos', 'skills']

function notAllowed() {
  return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
}

export async function GET(req, { params }) {
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  let query = supabaseAdmin.from(table).select('*').order('sort_order').order('created_at', { ascending: false })
  if (id) query = query.eq('id', id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req, { params }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const body = await req.json()
  const { data, error } = await supabaseAdmin.from(table).insert(body).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req, { params }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const { id, ...body } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from(table).update(body).eq('id', id).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table } = await params
  if (!WHITELIST.includes(table)) return notAllowed()

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

#### `src/app/api/upload/route.js`

Upload gambar ke Supabase Storage bucket `thumbnails`:

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

---

### 4. Auth Guard (Proxy)

**`src/proxy.js`** — konvensi Next.js 16, pengganti `middleware.js`:

```js
import { NextResponse } from 'next/server'

export function proxy(req) {
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage) {
    const session = req.cookies.get('admin_session')?.value
    if (session !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

> Cek dokumentasi Next.js 16 untuk konvensi proxy yang benar — mungkin ada perbedaan dari Next.js 15.

---

### 5. Admin Panel

#### `src/app/admin/login/layout.js`
Layout kosong — override admin layout agar login page tidak kena auth guard:
```js
export default function LoginLayout({ children }) {
  return <>{children}</>
}
```

#### `src/app/admin/layout.js`
Passthrough — auth sudah ditangani proxy:
```js
export default function AdminLayout({ children }) {
  return <>{children}</>
}
```

#### `src/app/admin/login/page.js`
Form login sederhana. Behavior:
- Input password (type="password")
- POST ke `/api/admin/login`
- Sukses → redirect ke `/admin`
- Gagal → tampil pesan error
- Rate limited (429) → tampil "Terlalu banyak percobaan, coba lagi dalam X menit"

Style: ikuti design system yang sudah ada (dark mode, warna primary ungu, accent hijau neon dari `globals.css`).

#### `src/app/admin/page.js`
Dashboard ringkasan. Fetch dari API dan tampilkan:
- Jumlah projects (total, breakdown per type: web/bot/android)
- Jumlah designs
- Jumlah videos
- Tombol logout (POST ke `/api/admin/logout` → redirect ke `/admin/login`)
- Link navigasi ke `/admin/projects`, `/admin/design`, `/admin/video`

---

#### `src/app/admin/CrudManager.jsx`

Komponen reusable client untuk semua CRUD page. Props:
- `table` — nama tabel
- `fields` — definisi field form (lihat field config di bawah)
- `columns` — kolom yang ditampilkan di tabel list
- `relatedSection` — opsional, config untuk child images (lihat RelatedImages)

**Field config shape:**
```js
{
  key: 'title',
  label: 'Judul',
  type: 'text',       // lihat tipe di bawah
  required: false,
  options: [],        // untuk type: 'select'
  showWhen: (formData) => formData.type === 'android', // conditional render
}
```

**Tipe field yang didukung:**

| type | Behavior |
|------|---------|
| `text` | Input teks biasa |
| `textarea` | Textarea multiline |
| `url` | Input URL, ada tombol buka link di sebelahnya |
| `number` | Input angka |
| `select` | Dropdown dari `options[]` |
| `checkbox` | Toggle boolean |
| `tags` | Input comma-separated → disimpan sebagai `text[]`. Tampil sebagai tag chips, bisa hapus per chip |
| `image` | Upload file gambar → POST `/api/upload` → simpan URL. **Tampil preview gambar** setelah upload. Ada tombol hapus/ganti. **Ini untuk thumbnail/cover — bukan screenshot.** |

**Behavior form secara umum:**
- State form dikelola lokal dengan `useState`
- Tambah baru → POST ke `/api/admin/[table]`
- Edit → klik row di list → form terisi otomatis → PUT ke `/api/admin/[table]`
- Hapus → tombol delete di row list → konfirmasi dialog → DELETE ke `/api/admin/[table]`
- Setelah save/delete → refresh list otomatis
- Field dengan `showWhen` hanya render bila kondisi terpenuhi — field yang hidden tidak ikut di-submit

---

#### RelatedImages — Sub-komponen untuk child gallery

Dipakai di projects (screenshots Android) dan designs (galeri gambar). Muncul di bawah form utama **setelah row parent berhasil disimpan** dan ada `id`.

**Untuk `project_images` (Android screenshots):**

Setiap baris screenshot punya:
- **Gambar** — upload via `/api/upload`, tampil preview thumbnail kecil setelah upload
- **Caption** — input text singkat, wajib diisi (contoh: "Halaman Pembayaran")
- **Deskripsi** — textarea, deskripsi panjang (contoh: "Mendukung GoPay, OVO, QRIS via Midtrans")
- **Urutan** — input angka `sort_order`
- **Tombol Hapus** — hapus baris screenshot dengan konfirmasi

UI layout per baris screenshot:
```
┌─────────────────────────────────────────────────────┐
│ [preview 80x80] │ Caption: ______________________   │
│                 │ Deskripsi: ____________________ │  │
│                 │ Urutan: [0]    [Simpan] [Hapus]   │
└─────────────────────────────────────────────────────┘
```

- Tombol **"+ Tambah Screenshot"** di bawah list untuk tambah baris baru
- Baris baru langsung muncul dengan form kosong, belum tersimpan sampai klik Simpan
- Upload gambar di baris baru langsung POST ke `/api/upload`, URL langsung masuk ke field `image_url`
- Simpan baris → POST ke `/api/admin/project_images` dengan `project_id` dari parent
- Edit baris yang sudah ada → PUT ke `/api/admin/project_images`
- Hapus → DELETE ke `/api/admin/project_images`

**Untuk `design_images` (galeri design):**

Lebih simpel — tidak ada caption/deskripsi, hanya:
- **Gambar** — upload + preview
- **Urutan** — sort_order
- **Tombol Hapus**

UI layout per baris:
```
┌──────────────────────────────────────┐
│ [preview 80x80] │ Urutan: [0] [Hapus]│
└──────────────────────────────────────┘
```

- Tombol **"+ Tambah Gambar"** di bawah list
- Flow sama seperti project_images tapi POST ke `/api/admin/design_images` dengan `design_id`

---

#### `src/app/admin/projects/page.js`

CRUD projects dengan form conditional berdasarkan `type`.

**Field config:**
```js
const fields = [
  { key: 'title',          label: 'Judul',         type: 'text',     required: true },
  { key: 'description',    label: 'Deskripsi',     type: 'textarea' },
  { key: 'tags',           label: 'Tags',          type: 'tags' },
  { key: 'type',           label: 'Tipe Project',  type: 'select',   required: true,
    options: ['web', 'bot', 'android', 'other'] },
  { key: 'thumbnail_url',  label: 'Thumbnail',     type: 'image' },

  // Selalu tampil
  { key: 'github_url',     label: 'GitHub URL',    type: 'url' },

  // Hanya tampil kalau type === 'web'
  { key: 'demo_url',       label: 'Demo URL (Web)', type: 'url',
    showWhen: (f) => f.type === 'web' },

  // Hanya tampil kalau type === 'android'
  { key: 'play_store_url', label: 'Play Store URL', type: 'url',
    showWhen: (f) => f.type === 'android' },
  { key: 'apk_url',        label: 'Download APK URL', type: 'url',
    showWhen: (f) => f.type === 'android' },

  { key: 'status',         label: 'Status',        type: 'select',
    options: ['completed', 'wip', 'private'] },
  { key: 'featured',       label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order',     label: 'Urutan',        type: 'number' },
]
```

**Section Screenshots** muncul di bawah form **hanya kalau `type === 'android'`** dan project sudah punya `id` (sudah tersimpan). Pakai `RelatedImages` dengan config `project_images`.

Kalau type diganti dari `android` ke tipe lain, section screenshots disembunyikan (data di DB tidak dihapus otomatis — biarkan saja).

**Kolom tabel list:**
```js
const columns = ['title', 'type', 'status', 'featured', 'sort_order']
```

Tampilkan badge warna per type di kolom list:
- `web` → biru
- `bot` → hijau
- `android` → hijau tua / emerald
- `other` → abu

---

#### `src/app/admin/design/page.js`

CRUD designs dengan galeri gambar.

**Field config:**
```js
const fields = [
  { key: 'title',           label: 'Judul',     type: 'text',     required: true },
  { key: 'category',        label: 'Kategori',  type: 'text' },
  { key: 'cover_image_url', label: 'Cover Image (tampil di grid homepage)', type: 'image' },
  { key: 'description',     label: 'Deskripsi', type: 'textarea' },
  { key: 'featured',        label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order',      label: 'Urutan',    type: 'number' },
]
```

**Section Galeri Gambar** muncul di bawah form setelah design punya `id`. Pakai `RelatedImages` dengan config `design_images` (tanpa caption/deskripsi).

> Penting: `cover_image_url` adalah gambar yang tampil di grid — berbeda dari gambar-gambar di galeri lightbox. Keduanya terpisah dan harus jelas labelnya di UI.

**Kolom tabel list:**
```js
const columns = ['title', 'category', 'featured', 'sort_order']
```

---

#### `src/app/admin/video/page.js`

CRUD videos.

**Field config:**
```js
const fields = [
  { key: 'title',         label: 'Judul',       type: 'text',   required: true },
  { key: 'video_url',     label: 'URL Video',   type: 'url',    required: true },
  { key: 'platform',      label: 'Platform',    type: 'select',
    options: ['youtube', 'drive', 'vimeo'] },
  { key: 'thumbnail_url', label: 'Thumbnail',   type: 'image' },
  { key: 'description',   label: 'Deskripsi',   type: 'textarea' },
  { key: 'featured',      label: 'Featured di Homepage', type: 'checkbox' },
  { key: 'sort_order',    label: 'Urutan',      type: 'number' },
]
```

**Kolom tabel list:**
```js
const columns = ['title', 'platform', 'featured', 'sort_order']
```

---

### 6. Halaman Publik — Refactor ke Supabase

#### Pola fetch yang dipakai

Karena semua halaman publik pakai `'use client'` (GSAP + state), fetch dilakukan di `useEffect` dengan Supabase client (anon key). Pattern fallback:

```js
useEffect(() => {
  async function fetchData() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // gunakan data statis fallback
      setProjects(DEV_PROJECTS)
      return
    }
    const { data } = await supabase.from('projects').select('*')
      .neq('status', 'private')
      .order('sort_order')
      .order('created_at', { ascending: false })
    setProjects(data?.length ? data : DEV_PROJECTS)
  }
  fetchData()
}, [])
```

Query selalu pakai tiebreaker: `.order('sort_order').order('created_at', { ascending: false })`

#### `src/app/page.js` — perubahan yang diperlukan

Tambah state dan fetch untuk:
- `projects` dari tabel `projects` (group by `type` untuk render section Web/Bot/Android)
- `skills` dari tabel `skills`
- `featuredDesigns` dari tabel `designs` where `featured = true`
- `featuredVideos` dari tabel `videos` where `featured = true`

Untuk Android projects, fetch juga `project_images` berdasarkan project id yang type-nya `android`.

Section **Projects** di homepage render 3 sub-section:
```
Web & Fullstack   → projects.filter(p => p.type === 'web')
Bot & Automation  → projects.filter(p => p.type === 'bot')
Android Apps      → projects.filter(p => p.type === 'android')
                    → tiap app punya screenshot gallery (lightbox dari project_images)
```

Section **Design Works** → hanya `featured = true`, ada tombol "Lihat Semua" → `/design`
Section **Video Works** → hanya `featured = true`, ada tombol "Lihat Semua" → `/video`

Tampilan tombol project berdasarkan tipe:
```
web     → demo_url ada: tombol "Live Demo" | github_url ada: tombol "GitHub"
bot     → github_url ada: tombol "GitHub"
android → play_store_url ada: tombol "Play Store"
          apk_url ada: tombol "Download APK"
          github_url ada: tombol "GitHub"
```

#### `src/app/design/page.js` — perubahan yang diperlukan

Fetch `designs` + untuk setiap design fetch `design_images`. Tampilkan semua (bukan hanya featured).
Klik design → lightbox slide semua gambar dari `design_images`.

#### `src/app/video/page.js` — file baru

Fetch semua `videos`. Grid thumbnail → klik → embed player.

Helper embed URL:
```js
function getEmbedUrl(videoUrl, platform) {
  if (platform === 'youtube') {
    const url = new URL(videoUrl)
    const id = url.searchParams.get('v') ?? url.pathname.split('/').pop()
    return `https://www.youtube.com/embed/${id}`
  }
  if (platform === 'drive') {
    const id = videoUrl.match(/\/d\/([^/]+)/)?.[1]
    return `https://drive.google.com/file/d/${id}/preview`
  }
  if (platform === 'vimeo') {
    const id = videoUrl.split('/').pop()
    return `https://player.vimeo.com/video/${id}`
  }
  return videoUrl
}
```

---

### 7. Update `robots.js`

Tambahkan `/admin` ke disallow:

```js
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
    sitemap: 'https://galang-arrauf.com/sitemap.xml',
  }
}
```

### 8. Update `sitemap.js`

Tambahkan `/video`:

```js
export default function sitemap() {
  return [
    { url: 'https://galang-arrauf.com',        lastModified: new Date(), priority: 1 },
    { url: 'https://galang-arrauf.com/design', lastModified: new Date(), priority: 0.9 },
    { url: 'https://galang-arrauf.com/video',  lastModified: new Date(), priority: 0.8 },
  ]
}
```

---

## Aturan Penting Saat Coding

1. **Jangan install library baru** tanpa pertimbangan — cek dulu apakah bisa dilakukan dengan yang sudah ada.
2. **`supabase-admin.js` server-only** — jangan pernah import di file yang ada `'use client'`.
3. **Semua query publik** selalu filter `.neq('status', 'private')` untuk tabel `projects`.
4. **Sort order** selalu pakai dua level: `.order('sort_order').order('created_at', { ascending: false })`.
5. **Fallback statis** harus tetap berjalan — jangan hapus konstanta `DEV_PROJECTS`, `GALLERY_DATA`, dll.
6. **Style** ikuti design system yang sudah ada di `globals.css`: dark mode default, primary ungu (`--color-primary`), accent hijau neon (`--color-accent`). Admin panel boleh lebih plain tapi tetap konsisten.
7. **Jangan ubah** animasi GSAP yang sudah ada di `page.js` — extend saja.
8. **Cascade delete** sudah diset di schema — hapus `designs` otomatis hapus `design_images`, hapus `projects` otomatis hapus `project_images`.

---

## Urutan Implementasi yang Disarankan

```
[ ] 1. npm install @supabase/supabase-js
[ ] 2. Buat .env.local
[ ] 3. src/lib/supabase.js
[ ] 4. src/lib/supabase-admin.js
[ ] 5. src/lib/auth.js
[ ] 6. src/app/api/admin/login/route.js
[ ] 7. src/app/api/admin/logout/route.js
[ ] 8. src/app/api/admin/[table]/route.js
[ ] 9. src/app/api/upload/route.js
[ ] 10. src/proxy.js
[ ] 11. src/app/admin/login/layout.js
[ ] 12. src/app/admin/layout.js
[ ] 13. src/app/admin/login/page.js
[ ] 14. src/app/admin/page.js (dashboard)
[ ] 15. src/app/admin/CrudManager.jsx
[ ] 16. src/app/admin/projects/page.js
[ ] 17. src/app/admin/design/page.js
[ ] 18. src/app/admin/video/page.js
[ ] 19. Refactor src/app/page.js (connect Supabase)
[ ] 20. Refactor src/app/design/page.js (connect Supabase)
[ ] 21. Buat src/app/video/page.js
[ ] 22. Update src/app/robots.js
[ ] 23. Update src/app/sitemap.js
[ ] 24. Test semua route di localhost
[ ] 25. Set env di Vercel dashboard
[ ] 26. Deploy & verifikasi
[ ] 27. Isi data via admin panel (/admin/projects, /admin/design, /admin/video)
[ ] 28. Upload thumbnail via admin panel
```

---

## Referensi Cepat

| Kebutuhan | File |
|-----------|------|
| Tambah project baru | `/admin/projects` |
| Upload screenshot Android | `/admin/projects` → edit project → section Screenshots |
| Tambah design | `/admin/design` |
| Upload gambar design | `/admin/design` → edit design → section Galeri |
| Tambah video | `/admin/video` |
| Lihat semua project publik | `/` (homepage, scroll ke section Projects) |
| Lihat semua design | `/design` |
| Lihat semua video | `/video` |
| Schema database | `supabase_schema.sql` |
| Arsitektur lengkap | `ARCHITECTURE.md` |

---

*Dokumen ini dibuat Mei 2026. Update bila ada perubahan arsitektur atau penambahan fitur.*
