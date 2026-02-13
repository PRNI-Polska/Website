// file: app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Crimson_Pro, JetBrains_Mono, DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Classic theme fonts
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin", "latin-ext"],
  variable: "--font-crimson",
  display: "swap",
});

// Modern theme fonts
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  display: "swap",
});

// Monospace font for code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

// Site metadata - Polish SEO optimized
export const metadata: Metadata = {
  title: {
    default: "PRNI - Polski Ruch Narodowo-Integralistyczny",
    template: "%s | PRNI",
  },
  description: "Polski Ruch Narodowo-Integralistyczny (PRNI) - Budujemy silną i suwerenną przyszłość opartą na odpowiedzialności, porządku oraz lojalności wobec wspólnoty narodowej. Dołącz do ruchu na rzecz Polski.",
  keywords: [
    "PRNI",
    "Polski Ruch Narodowo-Integralistyczny",
    "integralizm",
    "nacjonalizm",
    "Polska",
    "ruch polityczny",
    "suwerenność",
    "narodowy integralizm",
    "patriotyzm",
    "tożsamość narodowa",
  ],
  authors: [{ name: "PRNI - Polski Ruch Narodowo-Integralistyczny" }],
  creator: "PRNI",
  publisher: "Polski Ruch Narodowo-Integralistyczny",
  metadataBase: new URL("https://prni.org.pl"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://prni.org.pl",
    siteName: "PRNI - Polski Ruch Narodowo-Integralistyczny",
    title: "PRNI - Polski Ruch Narodowo-Integralistyczny",
    description: "Budujemy silną i suwerenną przyszłość opartą na odpowiedzialności, porządku oraz lojalności wobec wspólnoty narodowej.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PRNI - Polski Ruch Narodowo-Integralistyczny",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@PRNI_official",
    creator: "@PRNI_official",
    title: "PRNI - Polski Ruch Narodowo-Integralistyczny",
    description: "Budujemy silną i suwerenną przyszłość opartą na odpowiedzialności, porządku oraz lojalności wobec wspólnoty narodowej.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

// Get theme from environment variable or default to "classic"
const theme = process.env.NEXT_PUBLIC_THEME || "classic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the per-request CSP nonce set by the middleware.
  // Next.js 13.4.20+ automatically applies this nonce to its own inline scripts.
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? "";

  // Set CSS variables based on theme
  const fontVariables = theme === "modern"
    ? `${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable}`
    : `${crimson.variable} ${playfair.variable} ${jetbrainsMono.variable}`;

  const fontStyles = theme === "modern"
    ? { "--font-sans": "'DM Sans', system-ui, sans-serif", "--font-heading": "'Syne', sans-serif" } as React.CSSProperties
    : { "--font-sans": "'Crimson Pro', Georgia, serif", "--font-heading": "'Playfair Display', Georgia, serif" } as React.CSSProperties;

  return (
    <html lang="pl" data-theme={theme} suppressHydrationWarning>
      <head>
        {/* Additional meta tags for Polish locale */}
        <meta name="geo.region" content="PL" />
        <meta name="geo.placename" content="Polska" />
        <meta name="content-language" content="pl" />
      </head>
      <body
        className={`${fontVariables} antialiased min-h-screen flex flex-col`}
        style={fontStyles}
      >
        <a href="#main-content" className="skip-link">
          Przejdź do głównej treści
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
