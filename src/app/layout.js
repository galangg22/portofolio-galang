import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProviderComponent } from "./providers";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { TopLoader } from "next-top-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
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
        {/* Remixicon Icon Library — fetchPriority low agar tidak memblokir LCP */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.1.0/remixicon.min.css"
          fetchPriority="low"
        />
        {/* FOUC prevention — apply dark class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.add(t==='light'?'light':'dark')}catch(e){document.documentElement.classList.add('dark')}})()`
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProviderComponent>
          <TopLoader color="#4f46e5" showSpinner={false} />
          {children}
          <DarkModeToggle />
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
