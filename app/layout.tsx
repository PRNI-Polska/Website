// file: app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Crimson_Pro, JetBrains_Mono, DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthSessionProvider from "@/components/providers/session-provider";

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
    template: "%s | PRNI",
  },
  description: "Polski Ruch Narodowo-Integralistyczny — Naród Ponad Wszystkim. Ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej Polski.",
  keywords: [
    "PRNI", "Polski Ruch Narodowo-Integralistyczny", "narodowy integralizm",
    "ruch narodowy", "polska polityka", "suwerenność", "tradycja", "naród",
    "integralizm", "manifest", "ruch polityczny", "Poland", "National Integralism",
  ],
  authors: [{ name: "PRNI" }],
  creator: "PRNI",
  publisher: "PRNI",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    alternateLocale: ["en_US", "de_DE"],
    url: "https://prni.org.pl",
    siteName: "PRNI — Polski Ruch Narodowo-Integralistyczny",
    title: "PRNI — Naród Ponad Wszystkim",
    description: "Polski Ruch Narodowo-Integralistyczny — ruch polityczny na rzecz suwerenności, tradycji i integralności narodowej.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "PRNI Logo" }],
  },
  twitter: {
    card: "summary",
    title: "PRNI — Polski Ruch Narodowo-Integralistyczny",
    description: "Naród Ponad Wszystkim — ruch polityczny na rzecz suwerenności i tradycji.",
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
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body
        className={`${fontVariables} antialiased min-h-screen flex flex-col`}
        style={fontStyles}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
