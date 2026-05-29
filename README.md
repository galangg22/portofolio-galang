# Portofolang - Backend Developer & Creative Enthusiast Portfolio

Modern portfolio website built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **GSAP** animations. Showcase your development projects, creative works, and UI/UX designs.

**Live Demo:** https://galang-arrauf.com

## 🚀 Features

- ✅ **Responsive Design** - Mobile-first, fully responsive layout
- ✅ **Modern Animations** - GSAP ScrollTrigger for smooth scroll animations
- ✅ **Dynamic Island Navigation** - macOS-inspired animated navbar (hover on desktop, tap on mobile)
- ✅ **Project Showcase** - Grid layout for development projects
- ✅ **Design Gallery** - Dedicated `/design` (images) and `/video` (videos) pages
- ✅ **Supabase CMS + Admin Panel** - Manage projects, designs, videos & skills at `/admin` (no code edits)
- ✅ **Contact Form** - Integrated with Formspree for email submissions
- ✅ **SEO Optimized** - Meta tags, sitemap, robots.txt, Open Graph
- ✅ **PWA Ready** - Web app manifest and mobile support
- ✅ **Error Handling** - Custom 404 and error pages
- ✅ **Performance** - Image optimization, compression, lazy loading

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.4 | React framework |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.x | Styling |
| GSAP | 3.15.0 | Animations |
| Remixicon | 4.1.0 | Icons |

## 📋 Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values in `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_FORMSPREE_ID=YOUR_FORMSPREE_ID
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourname
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourname
NEXT_PUBLIC_EMAIL=your-email@example.com

# Supabase CMS + Admin (lihat bagian "Content Management")
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_strong_password
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
portofolang/
├── public/
│   ├── image/              # Project images & thumbnails
│   ├── cv-galang.pdf       # CV file served by /api/cv
│   ├── favicon.ico         # Website icon
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO robots file
├── src/
│   ├── proxy.js            # Auth guard for /admin/* (Next.js 16 proxy convention)
│   ├── lib/
│   │   ├── supabase.js         # Public Supabase client (anon key, null-safe)
│   │   ├── supabase-admin.js   # Service-role client (server-only)
│   │   └── auth.js             # Admin session cookie helper
│   └── app/
│       ├── api/
│       │   ├── cv/route.js         # CV download endpoint (local PDF)
│       │   ├── upload/route.js     # Image upload to Supabase Storage
│       │   └── admin/
│       │       ├── login/route.js  # Admin login (rate-limited)
│       │       ├── logout/route.js # Admin logout
│       │       └── [table]/route.js# Generic CRUD for whitelisted tables
│       ├── admin/              # Admin panel (login, dashboard, CRUD pages)
│       ├── design/page.js      # Design gallery page
│       ├── video/page.js       # Video gallery page
│       ├── lua-manifest/page.js# Lua manifest generator tool
│       ├── globals.css         # Global styles & Tailwind config
│       ├── layout.js           # Root layout with metadata
│       ├── page.js             # Home page (main portfolio)
│       ├── not-found.js        # 404 error page
│       ├── error.js            # Global error handler
│       ├── sitemap.js          # Dynamic sitemap for SEO
│       └── robots.js           # Dynamic robots.txt for SEO
├── supabase_schema.sql     # Supabase tables, RLS policies & seed data
├── .env.example            # Environment variables template
├── eslint.config.mjs       # ESLint configuration
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.mjs      # PostCSS configuration
└── jsconfig.json           # JavaScript/Babel config
```

## 🎨 Customization

### Update Portfolio Data

Content is managed two ways:

1. **Via Supabase + Admin Panel (recommended)** — go to `/admin`, log in with `ADMIN_PASSWORD`,
   and manage projects, designs, videos & skills through CRUD forms. See **Content Management** below.
2. **Via static fallback** — when Supabase env vars are not set, the site falls back to the
   hardcoded constants in `src/app/page.js` (`SKILLS_DATA`, `DEV_PROJECTS`, `FEATURED_CREATIVE`)
   and `src/app/design/page.js` (`GALLERY_DATA`). Editing these still works for a no-backend setup.

### Modify Colors

Edit `src/app/globals.css`:

```css
@theme {
  --color-bg-dark: #0a0a0a;      /* Background */
  --color-card-bg: #111111;       /* Card background */
  --color-primary: #8a2be2;       /* Primary color */
  --color-accent: #4fffa3;        /* Accent color */
}
```

### Add Your CV

The CV is served from a **local PDF** at `public/cv-galang.pdf` via the `/api/cv` endpoint.
To update it, simply replace that file — no environment variable needed.

## 🗄️ Content Management (Supabase CMS + Admin)

The portfolio can be powered by [Supabase](https://supabase.com) so you can manage content
without editing code. If Supabase env vars are absent, the site safely falls back to static data.

### Setup

1. Create a project at [supabase.com](https://supabase.com) and copy the Project URL, anon key, and service_role key.
2. In **SQL Editor**, run `supabase_schema.sql` (creates `projects`, `designs`, `videos`, `skills` tables,
   RLS policies, and seed data).
3. In **Storage**, create a public bucket named `thumbnails` (for uploaded images).
4. Fill the Supabase + `ADMIN_PASSWORD` values in `.env.local` (and in Vercel env for production).

### Admin Panel

- Visit `/admin` and log in with `ADMIN_PASSWORD`.
- Manage **Dev Projects**, **Design Gallery**, and **Video Gallery** via CRUD forms with image upload.
- Routes under `/admin/*` are protected by `src/proxy.js` (cookie-based auth guard).
- The login endpoint is **rate-limited** (5 failed attempts per IP / 15 minutes).

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` are **server-only** — never expose them to the client.

## 📊 Build & Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy automatically on git push

```bash
vercel
```

### Deploy on Netlify

```bash
npm run build
# Upload 'out' directory to Netlify
```

## 🔍 SEO Configuration

- **Meta Tags** - Update in `src/app/layout.js`
- **Sitemap** - Auto-generated at `/sitemap.xml`
- **Robots.txt** - Auto-generated at `/robots.txt`
- **Open Graph** - Update OG tags in metadata

## 📝 Form Submission

Uses [Formspree](https://formspree.io) for contact form:

1. Create account at formspree.io
2. Get your form endpoint ID
3. Update `src/app/page.js` form action

## 📱 Mobile Support

- Fully responsive (mobile, tablet, desktop)
- PWA manifest for app-like experience
- Touch-friendly navigation
- Optimized for all devices

## 🎬 Adding Videos

Videos live on the dedicated `/video` page, backed by the Supabase `videos` table.

- **Via Admin Panel:** go to `/admin/video`, add a video with its URL, pick the platform
  (`youtube`, `drive`, or `vimeo`), and optionally upload a thumbnail. Embed URLs are derived automatically.
- **Via static fallback:** when Supabase is not configured, `GALLERY_DATA` in
  `src/app/design/page.js` and the fallback array in `src/app/video/page.js` are used.

```javascript
// Supabase "videos" row shape
{
  title: "Your Video Title",
  video_url: "https://drive.google.com/file/d/FILE_ID/preview",
  platform: "drive",        // youtube | drive | vimeo
  thumbnail_url: "https://...",
  description: "Video description",
  sort_order: 0
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not showing | Check `/public/image/` paths, or the `thumbnail_url`/`image_url` in Supabase |
| Icons not displaying | Verify Remixicon CDN link in layout.js |
| CV download fails | Ensure `public/cv-galang.pdf` exists |
| Form not sending | Check Formspree ID and endpoint in page.js |
| Admin login fails / locked out | Verify `ADMIN_PASSWORD`; rate limit resets after 15 min |
| Content not updating from CMS | Confirm Supabase env vars are set and SQL schema was run |

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GSAP Documentation](https://gsap.com)
- [Remixicon Icons](https://remixicon.com)

## 🧰 Changelog (Recent Updates)

### UI Fixes
- **Mobile navbar** — Dynamic Island navbar is now tap-to-toggle on touch devices (previously hover-only, unusable on mobile). Nav link clicks stop propagation so the island doesn't reopen.
- **Lua Manifest page** — layout switched from a forced 2-column grid to `auto-fit` so it collapses to a single column on small screens (no more horizontal overflow).
- **`scroll-behavior: smooth`** — added `data-scroll-behavior="smooth"` to `<html>` to silence the Next.js route-transition warning.
- **Lint cleanups** — escaped apostrophe in "Let's Connect", `error.js` now uses `<Link>` instead of `<a>`, and false-positive `set-state-in-effect` warnings suppressed where intentional.

### Supabase CMS + Admin Migration
- Added **Supabase** integration (`@supabase/supabase-js`) with public + service-role clients (`src/lib/`), all **null-safe** so the site falls back to static data when env vars are absent.
- New **admin panel** at `/admin` (dashboard, login, and CRUD for projects/designs/videos) using a reusable `CrudManager` component.
- New API routes: `api/admin/login` (rate-limited), `api/admin/logout`, generic `api/admin/[table]` CRUD (auth + table whitelist), and `api/upload` (image → Supabase Storage).
- **Auth guard** via `src/proxy.js` (Next.js 16 *proxy* convention, replacing deprecated *middleware*) protecting `/admin/*` except `/admin/login` — avoids the redirect loop a layout-based guard would cause.
- **Login rate limiting** — 5 failed attempts per IP / 15 minutes, returns `429` with `Retry-After`.
- New public **`/video`** gallery page (Supabase-backed with static fallback); homepage and `/design` now hydrate from Supabase with static fallback.
- Added `supabase_schema.sql` (tables, RLS policies, seed data) and updated `.env.example`.
- `robots.js` now disallows `/admin/` in addition to `/api/`.

### Docs
- Updated `README.md` and `ARCHITECTURE.md` to reflect the CMS/admin architecture and corrected the CV source (served from local `public/cv-galang.pdf`, not Google Drive).

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: your-email@example.com
- LinkedIn: https://linkedin.com/in/your-profile

---

**Made with ❤️ by Galang Arrauf | Built with Next.js & Tailwind CSS**

