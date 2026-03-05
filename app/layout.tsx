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

// Site metadata - customize these for SEO
export const metadata: Metadata = {
  title: {
    default: "PRNI - Political Party",
    template: "%s | PRNI",
  },
  description: "Building a better future together. Join our movement for positive change in our community and nation.",
  keywords: ["political party", "politics", "community", "change", "manifesto", "elections"],
  authors: [{ name: "PRNI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PRNI Political Party",
    title: "PRNI - Political Party",
    description: "Building a better future together. Join our movement for positive change.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRNI - Political Party",
    description: "Building a better future together. Join our movement for positive change.",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
