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
  title: "Galang Arrauf - Backend Developer & Creative Enthusiast",
  description:
    "Portfolio of Galang Arrauf Pramudito. Backend Developer, IT Automation specialist, and Creative Enthusiast. Showcasing development projects, design work, and video production.",
  keywords:
    "backend developer, node.js, laravel, react, next.js, ui/ux design, video editing, portfolio, galang arrauf, pens",
  authors: [{ name: "Galang Arrauf Pramudito" }],
  openGraph: {
    title: "Galang Arrauf - Backend Developer & Creative Enthusiast",
    description:
      "Portfolio of Galang Arrauf Pramudito showcasing development projects, design work, and video production.",
    url: "https://galang-arrauf.vercel.app",
    type: "website",
    siteName: "Galang Arrauf Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galang Arrauf - Backend Developer & Creative Enthusiast",
    description: "Portfolio of Galang Arrauf Pramudito",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning // Required by next-themes to avoid hydration mismatch
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
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProviderComponent>
          <TopLoader color="#8b5cf6" showSpinner={false} />
          {children}
          <DarkModeToggle />
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
