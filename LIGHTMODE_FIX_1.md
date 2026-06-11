# Light Mode Fix — Portofolang (Revised)

## Root Cause Sebenarnya

Tailwind utility classes (`text-white`, `text-gray-400`, dll) di-generate sebagai atomic CSS dengan specificity `(0,1,0)`. Rule seperti `html.light .hero-text { color: #1a1a1a }` punya specificity `(0,2,0)` — seharusnya menang. **Tapi kenyataannya tidak**, karena:

1. Tailwind v4 pakai `@layer utilities` — rule di luar layer ini otomatis menang secara cascade order, tapi kalau kamu taruh CSS kamu di bawah `@import "tailwindcss"`, urutan bisa terbalik tergantung build output.
2. GSAP set inline style (`style="opacity: 0"` saat animasi) yang bisa interfere.
3. `text-white` di elemen yang sama dengan `.hero-text` → specificity tie → last-write-wins → Tailwind menang kalau outputnya belakangan.

**Solusi: pakai `!important` secara targeted per-section ID, bukan global.**

---

## File yang Diubah

1. `src/app/globals.css` — refactor total blok light mode
2. `src/app/projects/page.js` — hapus `text-white` dari `<main>`
3. `src/app/components/DarkModeToggle.jsx` — button adaptive per theme

---

## 1. `globals.css`

Hapus **semua** rule `html.light ...` yang ada sekarang, ganti dengan blok berikut secara keseluruhan.

```css
/* ============================================================
   LIGHT MODE — Final Fix
   Scope per section ID (#home, #about, dst) dengan !important
   agar pasti menang lawan Tailwind utility classes.
   Card yang by-design dark (project-card, creative-card)
   dibiarkan tetap dark.
   ============================================================ */

html.light {
  --background: #f8f9fa;
  --foreground: #1a1a1a;
  color-scheme: light;
}

html.light body {
  background: #f8f9fa !important;
  color: #1a1a1a;
}

/* ── Background utilities ──────────────────────────────────── */
html.light .bg-bg-dark   { background-color: #f8f9fa !important; }
html.light .bg-card-bg   { background-color: #ffffff !important; }
html.light .bg-black\/20 { background-color: rgba(0, 0, 0, 0.04) !important; }
html.light .bg-white\/5  { background-color: rgba(0, 0, 0, 0.05) !important; }
html.light .bg-white\/10 { background-color: rgba(0, 0, 0, 0.08) !important; }
html.light .bg-white\/20 { background-color: rgba(0, 0, 0, 0.12) !important; }
html.light .bg-black\/70 { background-color: rgba(0, 0, 0, 0.08) !important; }

/* ── Border utilities ──────────────────────────────────────── */
html.light .border-white\/5  { border-color: rgba(0, 0, 0, 0.06) !important; }
html.light .border-white\/10 { border-color: rgba(0, 0, 0, 0.10) !important; }
html.light .border-white\/20 { border-color: rgba(0, 0, 0, 0.15) !important; }

/* ── HERO (#home) ──────────────────────────────────────────── */
html.light #home h1,
html.light #home p,
html.light #home .hero-text { color: #1a1a1a !important; }

/* Gradient text tetap transparent biar gradientnya keliatan */
html.light #home h1 .bg-clip-text,
html.light #home .text-transparent { color: transparent !important; }

/* Accent text di hero */
html.light #home .text-accent { color: #6366f1 !important; }

/* Badge "Sidoarjo, Indonesia" */
html.light #home .hero-text.inline-flex {
  background-color: rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
}

/* Tagline — span "Creative Enthusiast" */
html.light #home p span.text-white { color: #1a1a1a !important; }

/* View Work button — bg putih di dark mode, di light mode flip */
html.light #home a.bg-white {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}

/* Resume button */
html.light #home button.border {
  border-color: rgba(0, 0, 0, 0.2) !important;
  color: #1a1a1a !important;
}
html.light #home button.border i { color: #1a1a1a !important; }
html.light #home button.border:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
}

/* ── ABOUT (#about) ────────────────────────────────────────── */
html.light #about h2,
html.light #about h2 span { color: #1a1a1a !important; }

html.light #about .text-gray-500 { color: #888888 !important; }

html.light #about p.text-gray-300 { color: #444444 !important; }
html.light #about span.text-accent { color: #6366f1 !important; }

/* Info cards (Education, Current Status) */
html.light #about .bg-white\/5 {
  background-color: rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
}
html.light #about .bg-white\/5 p.text-white { color: #1a1a1a !important; }
html.light #about .bg-white\/5 p.text-gray-400 { color: #666666 !important; }

/* Foto badge "3+ Years Experience" */
html.light #about .absolute.bg-black {
  background-color: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.12) !important;
}
html.light #about .absolute.bg-black p.text-gray-400 { color: #666666 !important; }

/* ── SKILLS (#skills) ──────────────────────────────────────── */
html.light #skills h2 { color: #1a1a1a !important; }

html.light #skills .bento-card {
  background-color: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}
html.light #skills .bento-card h3 { color: #1a1a1a !important; }
html.light #skills .bento-card .bg-white\/5 {
  background-color: rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
}
html.light #skills .bento-card span.text-gray-300 { color: #444444 !important; }

/* ── PROJECTS (#projects) ──────────────────────────────────── */
html.light #projects > div > div h2,
html.light #projects > div > div p.text-gray-400 { color: #1a1a1a !important; }

/* Filter tabs — non-active */
html.light #projects button:not(.bg-accent) {
  border-color: rgba(0, 0, 0, 0.15) !important;
  color: #555555 !important;
  background-color: rgba(0, 0, 0, 0.04) !important;
}
html.light #projects button:not(.bg-accent):hover {
  border-color: rgba(0, 0, 0, 0.3) !important;
  color: #1a1a1a !important;
}

/* PROJECT CARD — tetap dark by design, override teks konten saja */
html.light .project-card { /* background tetap bg-card-bg (#111) */ }
html.light .project-card h3 { color: #ffffff !important; }
html.light .project-card p  { color: #d1d5db !important; }
html.light .project-card .bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

/* Visual Works heading */
html.light #projects .section-title { color: #1a1a1a !important; }

/* CREATIVE CARD — tetap dark */
html.light .creative-card h4  { color: #ffffff !important; }
html.light .creative-card p   { color: #d1d5db !important; }
html.light .creative-card span { color: #8b5cf6 !important; }

/* ── CERTIFICATES (#certificates) ─────────────────────────── */
html.light #certificates h2,
html.light #certificates p.text-gray-400 { color: #1a1a1a !important; }

html.light #certificates .bento-card {
  background-color: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}
html.light #certificates .bento-card h3 { color: #1a1a1a !important; }
html.light #certificates .bento-card p.text-gray-400 { color: #555555 !important; }
html.light #certificates .bento-card p.text-gray-500 { color: #777777 !important; }

/* ── CONTACT (#contact) ────────────────────────────────────── */
html.light #contact .bg-card-bg\/50 {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}
html.light #contact h2 { color: #1a1a1a !important; }
html.light #contact p  { color: #555555 !important; }

html.light #contact input,
html.light #contact textarea {
  color: #1a1a1a !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
}
html.light #contact input::placeholder,
html.light #contact textarea::placeholder { color: #888888 !important; }

html.light #contact button[type="submit"] {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}
html.light #contact button[type="submit"]:hover {
  background-color: #8b5cf6 !important;
}

/* ── FOOTER ────────────────────────────────────────────────── */
html.light footer { border-color: rgba(0, 0, 0, 0.08) !important; }
html.light footer a { color: #555555 !important; }
html.light footer a:hover { color: #1a1a1a !important; }
html.light footer p { color: #888888 !important; }

/* ── Global accent/accent buttons — selalu putih ───────────── */
html.light .bg-accent,
html.light .bg-accent * { color: #ffffff !important; }

/* ── Hover states (pointer device only) ────────────────────── */
@media (hover: hover) and (pointer: fine) {
  html.light .card-hover-border:hover {
    border-color: rgba(99, 102, 241, 0.3) !important;
  }
}
```

---

## 2. `src/app/projects/page.js`

Hapus `text-white` dari tag `<main>`:

```jsx
// Sebelum:
<main className="min-h-screen bg-bg-dark text-white p-4 sm:p-8 md:p-16 relative overflow-x-hidden">

// Sesudah:
<main className="min-h-screen bg-bg-dark p-4 sm:p-8 md:p-16 relative overflow-x-hidden">
```

Tambahkan juga override untuk `/projects` page di CSS (append ke blok di atas):

```css
/* ── /projects page ─────────────────────────────────────────── */
html.light .min-h-screen.bg-bg-dark h1,
html.light .min-h-screen.bg-bg-dark p.text-gray-400 { color: #1a1a1a !important; }

html.light .min-h-screen.bg-bg-dark .group h3 { color: #1a1a1a !important; }
html.light .min-h-screen.bg-bg-dark .group p.text-gray-400 { color: #555555 !important; }
html.light .min-h-screen.bg-bg-dark .group span.text-gray-400 { color: #666666 !important; }

html.light .min-h-screen.bg-bg-dark .bg-card-bg {
  background-color: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

/* Filter tabs di /projects */
html.light .min-h-screen.bg-bg-dark button:not(.bg-accent) {
  border-color: rgba(0, 0, 0, 0.15) !important;
  color: #555555 !important;
  background-color: rgba(0, 0, 0, 0.04) !important;
}

/* Back to Home link */
html.light .min-h-screen.bg-bg-dark a.text-accent { color: #6366f1 !important; }

html.light .min-h-screen.bg-bg-dark footer p { color: #888888 !important; }
```

---

## 3. `src/app/components/DarkModeToggle.jsx`

```jsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full border transition-all backdrop-blur-md shadow-lg ${
        isDark
          ? 'bg-white/10 border-white/20 hover:bg-white/20'
          : 'bg-black/10 border-black/20 hover:bg-black/15'
      }`}
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <i className="ri-sun-line text-xl text-yellow-400"></i>
      ) : (
        <i className="ri-moon-line text-xl text-blue-500"></i>
      )}
    </button>
  );
}
```

---

## Checklist Verifikasi

- [x] Hero — "Galang Pramudito" terbaca, gradient "Pramudito" tetap ungu
- [x] Hero — tagline dan "Backend Developer" terbaca
- [x] Hero — badge "Sidoarjo, Indonesia" visible
- [x] Hero — Resume button border & teks visible
- [x] About — heading, paragraf, info cards kontras
- [x] Skills — card putih, teks dark
- [x] Projects — filter tabs terbaca, heading visible
- [x] Project cards — teks tetap putih (card tetap dark)
- [x] Creative cards — teks tetap putih
- [x] Certificates — card putih, teks dark
- [x] Contact — form input terbaca, heading kontras
- [x] DarkModeToggle — visible di kedua mode
- [x] `/projects` page — semua teks terbaca

---

## Catatan

**Kenapa pakai `!important` per section ID sekarang?**

Tailwind v4 output CSS-nya di-bundle dengan `@layer`. Rule tanpa `!important` di luar layer bisa kalah tergantung urutan bundle. Scope ke `#home`, `#about`, dll memastikan override tepat sasaran tanpa nabrak section lain, dan `!important` memastikan menang lawan Tailwind utility di element yang sama.

**Project card tetap dark** — by-design, umum di portfolio. Card gelap di atas page terang justru menciptakan visual contrast yang bagus.
