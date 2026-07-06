import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProviderComponent } from "./providers";
import { TopLoader } from "next-top-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // ✅ Prevent FOIT (Flash of Invisible Text)
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false, // ✅ Serif font tidak critical, lazy load
  adjustFontFallback: true,
});

export const metadata = {
  title: "Galang Arrauf — Web Developer · Open to Internship/Freelance",
  description:
    "Portfolio Galang Arrauf Pramudito — Web Developer (Laravel, PHP, PostgreSQL). AI Integration & Automation. Open to internship & freelance.",
  keywords:
    "web developer, laravel, php, postgresql, ai integration, automation, backend developer, portfolio, galang arrauf, pens, internship, freelance",
  authors: [{ name: "Galang Arrauf Pramudito" }],
  openGraph: {
    title: "Galang Arrauf — Web Developer · Open to Internship/Freelance",
    description:
      "Portfolio Galang Arrauf Pramudito — Web Developer specializing in Laravel & PHP with AI Integration. Open to internship & freelance opportunities.",
    url: "https://portofolang.web.id",
    type: "website",
    siteName: "Portofolang — Galang Arrauf Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galang Arrauf — Full-Stack Dev (Laravel + Next.js)",
    description: "Portfolio Galang Arrauf Pramudito — Open to internship & freelance",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8f9fa" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Remixicon Icon Library */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.1.0/remixicon.min.css"
          fetchPriority="low"
        />
        {/* ✅ PERF: Preconnect ke Supabase storage untuk mempercepat image loading */}
        <link rel="preconnect" href="https://pnaimynitzvxylloknvp.supabase.co" />
        <link rel="dns-prefetch" href="https://pnaimynitzvxylloknvp.supabase.co" />
        {/* ✅ PERF: Preconnect ke CDN Simple Icons untuk tech stack icons */}
        <link rel="preconnect" href="https://cdn.simpleicons.org" />
        <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />

      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProviderComponent>
          <TopLoader color="#4f46e5" showSpinner={false} />
          {children}
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
