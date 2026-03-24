// file: app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Crimson_Pro, JetBrains_Mono, DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Classic theme fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

// Modern theme fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

// Monospace font for code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prni.org.pl"),
  title: {
    default: "PRNI — Polski Ruch Narodowo-Integralistyczny",
    template: "%s | PRNI — Polski Ruch Narodowo-Integralistyczny",
  },
  description: "PRNI (Polski Ruch Narodowo-Integralistyczny) — Naród Ponad Wszystkim. Ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej Polski.",
  keywords: [
    "PRNI", "Polski Ruch Narodowo-Integralistyczny",
    "PRNI Polska", "PRNI Poland", "PRNI Polen",
    "narodowy integralizm", "National Integralism", "Nationaler Integralismus",
    "ruch narodowy", "polska polityka", "suwerenność", "tradycja", "naród",
    "integralizm", "manifest", "ruch polityczny",
    "Polish National-Integralist Movement", "Polnische National-Integralistische Bewegung",
  ],
  authors: [{ name: "PRNI" }],
  creator: "PRNI",
  publisher: "PRNI",
  icons: {
    icon: [
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/icon-32.png",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    alternateLocale: ["en_US", "de_DE"],
    url: "https://prni.org.pl",
    siteName: "PRNI",
    title: "PRNI — Polski Ruch Narodowo-Integralistyczny",
    description: "PRNI (Polski Ruch Narodowo-Integralistyczny) — Naród Ponad Wszystkim. Ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej Polski.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "PRNI — Polski Ruch Narodowo-Integralistyczny" }],
  },
  twitter: {
    card: "summary",
    title: "PRNI — Polski Ruch Narodowo-Integralistyczny",
    description: "PRNI (Polski Ruch Narodowo-Integralistyczny) — Naród Ponad Wszystkim. Ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej Polski.",
    images: ["/logo.png"],
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
  verification: {},
  alternates: {
    canonical: "https://prni.org.pl",
    languages: {
      "pl": "https://prni.org.pl",
      "en": "https://prni.org.pl",
      "de": "https://prni.org.pl",
      "x-default": "https://prni.org.pl",
    },
  },
};

// Get theme from environment variable or default to "classic"
const theme = process.env.NEXT_PUBLIC_THEME || "classic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PRNI" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#090909" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "PoliticalParty",
                  "@id": "https://prni.org.pl/#organization",
                  name: "PRNI — Polski Ruch Narodowo-Integralistyczny",
                  alternateName: ["PRNI", "Polski Ruch Narodowo-Integralistyczny", "Polish National-Integralist Movement"],
                  url: "https://prni.org.pl",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://prni.org.pl/logo.png",
                    width: 512,
                    height: 512,
                  },
                  image: "https://prni.org.pl/logo.png",
                  description: "PRNI (Polski Ruch Narodowo-Integralistyczny) — Naród Ponad Wszystkim. Ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej Polski.",
                  foundingDate: "2024",
                  slogan: "Naród Ponad Wszystkim",
                  areaServed: { "@type": "Country", name: "Poland" },
                  knowsLanguage: ["pl", "en", "de"],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://prni.org.pl/#website",
                  url: "https://prni.org.pl",
                  name: "PRNI",
                  alternateName: "Polski Ruch Narodowo-Integralistyczny",
                  description: "Oficjalna strona PRNI — Polskiego Ruchu Narodowo-Integralistycznego",
                  publisher: { "@id": "https://prni.org.pl/#organization" },
                  inLanguage: ["pl", "en", "de"],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${fontVariables} antialiased min-h-screen flex flex-col`}
        style={fontStyles}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
