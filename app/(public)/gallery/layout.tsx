import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria — PRNI",
  description:
    "Galeria zdjęć z akcji, marszów, wydarzeń i inicjatyw PRNI — Polskiego Ruchu Narodowo-Integralistycznego. Photo gallery of PRNI events, marches, and initiatives.",
  keywords: [
    "PRNI galeria",
    "PRNI zdjęcia",
    "narodowo integralistyczny galeria",
    "marsz PRNI",
    "akcje PRNI",
    "PRNI gallery",
    "PRNI photos",
  ],
  alternates: { canonical: "https://www.prni.org.pl/gallery" },
  openGraph: {
    title: "Galeria PRNI",
    description: "Zdjęcia z akcji, marszów i wydarzeń PRNI.",
    url: "https://www.prni.org.pl/gallery",
    type: "website",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
