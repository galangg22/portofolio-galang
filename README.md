# Portofolang

Modern portfolio website built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **GSAP** animations. Full CMS via Supabase + admin panel — manage everything without touching code.

**Live:** https://portofolang.vercel.app/

---

## Features

- **Dynamic Island Navbar** — macOS-inspired animated navigation (hover on desktop, tap on mobile)
- **Typed Projects** — Web, Bot, Android apps in one place with type-specific UI (screenshots, Play Store links, etc.)
- **Design Gallery** — Masonry grid with per-design image slideshow lightbox
- **Video Gallery** — YouTube, Google Drive, Vimeo embed with auto-detected URLs
- **Certificates Showcase** — Interactive certificate gallery, supporting custom detail lightbox popups and external credential verification links
- **Supabase CMS + Admin Panel** — Full CRUD at `/admin` with image upload, conditional fields, child galleries
- **Static Fallback** — Works without Supabase; falls back to hardcoded data
- **GSAP Animations** — ScrollTrigger entrance animations, smooth scroll
- **SEO** — Dynamic sitemap, robots.txt, Open Graph, meta tags
- **PWA Ready** — Web app manifest, mobile-optimized
- **Security & Performance** — Rate-limited login, httpOnly cookies, security headers, server-only secrets, lightweight IntersectionObserver page scroll tracking
- **Dark/Light Mode** — Premium high-contrast layout transition with a modular scoping approach (keeping dark elements readable while flipping main UI theme colors)

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | Framework (App Router) |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.x | Styling |
| Supabase | latest | Database, Storage, CMS |
| GSAP | 3.15.0 | Animations |
| next-themes | 0.4.6 | Dark/light mode |
| Remixicon | 4.1.0 | Icons (CDN) |

## Quick Start

```bash
# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values (see below)

# Run dev server
npm run dev
```

Open http://localhost:3000

## Environment Variables

```env
# Public
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourname
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourname
NEXT_PUBLIC_EMAIL=your-email@example.com

# Server-only (NEVER prefix with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_strong_password
```

## Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in the SQL Editor — creates 6 tables with RLS, triggers, cascade deletes, and seed data
3. Create a public Storage bucket named `thumbnails`
4. Set env vars in `.env.local` and Vercel dashboard

### Schema Overview

| Table | Purpose |
|-------|---------|
| `projects` | Dev projects (typed: web/bot/android/other) |
| `project_images` | Screenshots per project (FK, cascade delete) |
| `designs` | Design portfolio entries |
| `design_images` | Gallery images per design (FK, cascade delete) |
| `videos` | Video entries (YouTube/Drive/Vimeo) |
| `skills` | Skills bento grid data |
| `certificates` | Certificates entries (featured, sort_order, credential_link) |

All tables have public read (RLS) — writes only via service_role in API routes.

## Admin Panel

Visit `/admin` and log in with `ADMIN_PASSWORD`.

**Features:**
- CRUD for projects, designs, videos with image upload
- Conditional fields — `demo_url` only for web, `play_store_url`/`apk_url` only for android
- Android screenshot gallery — upload, caption, description, reorder per project
- Design image gallery — upload, reorder per design
- Image preview (80×80) with replace/delete buttons
- Multi-column list with type badges (color-coded)
- Rate-limited login (5 attempts / 15 min per IP)

Routes protected by `src/proxy.js` (cookie-based auth guard).

## Project Structure

```
portofolang/
├── public/
│   ├── image/              # Static images
│   ├── cv-galang.pdf       # CV (served by /api/cv)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── proxy.js            # Auth guard (/admin/*)
│   ├── lib/                # supabase.js, supabase-admin.js, auth.js
│   └── app/
│       ├── page.js         # Homepage (typed projects, skills, visual works)
│       ├── design/         # Design gallery + lightbox
│       ├── video/          # Video gallery + embed player
│       ├── admin/          # Admin panel (CrudManager, CRUD pages)
│       ├── api/            # Route handlers (login, logout, CRUD, upload, cv)
│       ├── sitemap.js      # Dynamic sitemap
│       └── robots.js       # Dynamic robots.txt
├── supabase_schema.sql     # Full schema (drop + create + seed)
├── ARCHITECTURE.md         # Detailed architecture documentation
└── CLAUDE.md               # Implementation guide
```

## Customization

### Colors

Edit `src/app/globals.css`:

```css
@theme {
  --color-bg-dark: #0a0a0a;
  --color-card-bg: #111111;
  --color-primary: #8a2be2;
  --color-accent: #4fffa3;
}
```

### CV

Replace `public/cv-galang.pdf` — served automatically via `/api/cv`.

### Content

Without Supabase: edit the fallback constants in `page.js` (`SKILLS_DATA`, `DEV_PROJECTS`, `FEATURED_CREATIVE`) and `design/page.js` (`GALLERY_DATA`).

With Supabase: use the admin panel at `/admin`.

## Build & Deploy

```bash
npm run build    # Production build
npm start        # Run production server
npm run lint     # ESLint check
```

### Vercel (Recommended)

```bash
vercel
```

Or connect your GitHub repo to Vercel for auto-deploy on push. Set all env vars in Vercel dashboard.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not showing | Check `thumbnail_url`/`cover_image_url` in Supabase, or `/public/image/` paths |
| Admin login locked | Rate limit resets after 15 min; verify `ADMIN_PASSWORD` |
| Content not updating | Confirm Supabase env vars are set and schema was run |
| CV download fails | Ensure `public/cv-galang.pdf` exists |
| Video not embedding | Check `video_url` format and `platform` value |

## License

MIT

---

**Built by Galang Arrauf Pramudito** — Next.js + Tailwind CSS + Supabase
