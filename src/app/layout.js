import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProviderComponent } from "./providers";
import { TopLoader } from "next-top-loader";
import { SmoothScroll } from "./components/SmoothScroll";

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

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL("https://galangpramudito.web.id"),
  title: {
    default: "Galang Arrauf Pramudito — Web Developer",
    template: "%s — Galang Arrauf Pramudito",
  },
  description:
    "Portfolio Galang Arrauf Pramudito — Web Developer (Laravel, PHP, PostgreSQL). AI Integration & Automation. Open to internship & freelance.",
  keywords:
    "web developer, laravel, php, postgresql, ai integration, automation, backend developer, portfolio, galang arrauf, pens, internship, freelance",
  authors: [{ name: "Galang Arrauf Pramudito" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: {
      default: "Galang Arrauf Pramudito — Web Developer",
      template: "%s — Galang Arrauf Pramudito",
    },
    description:
      "Portfolio Galang Arrauf Pramudito — Web Developer specializing in Laravel & PHP with AI Integration. Open to internship & freelance opportunities.",
    url: "/",
    type: "website",
    siteName: "Galang Arrauf Pramudito Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Galang Arrauf Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galang Arrauf Pramudito — Full-Stack Dev (Laravel + Next.js)",
    description: "Portfolio Galang Arrauf Pramudito — Open to internship & freelance",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: '/favicon.ico?v=2',
    apple: '/apple-icon.png'
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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

        {/* ✅ SEO: Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Galang Arrauf Pramudito",
                givenName: "Galang",
                familyName: "Pramudito",
                url: "https://galangpramudito.web.id",
                image: "https://galangpramudito.web.id/image/gambar%20galang%202.jpg",
                jobTitle: "Web Developer",
                description:
                  "Web developer spesialis Laravel, PHP, dan PostgreSQL dengan keahlian AI Integration & Automation. Terbuka untuk internship dan freelance.",
                knowsAbout: [
                  "Laravel",
                  "PHP",
                  "PostgreSQL",
                  "Next.js",
                  "React",
                  "Tailwind CSS",
                  "AI Integration",
                  "Automation",
                  "GitHub Actions",
                  "Docker",
                ],
                sameAs: [
                  "https://www.linkedin.com/in/galang-pramudito/",
                  "https://github.com/galangg22",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                url: "https://galangpramudito.web.id",
                name: "Galang Arrauf — Portfolio",
                description:
                  "Portfolio Galang Arrauf Pramudito — Web Developer. Laravel, PHP, PostgreSQL, AI Integration.",
                author: {
                  "@type": "Person",
                  name: "Galang Arrauf Pramudito",
                },
              },
            ]),
          }}
        />

      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProviderComponent>
          <SmoothScroll>
            <TopLoader color="#4f46e5" showSpinner={false} />
            {children}
          </SmoothScroll>
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
