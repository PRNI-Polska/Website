// file: app/(public)/about/page.tsx
import type { Metadata } from "next";
import AboutPageClient from "./about-client";

export const metadata: Metadata = {
  title: "O PRNI — Narodowy Integralizm",
  description:
    "O PRNI (Polski Ruch Narodowo-Integralistyczny) — budujemy silną i suwerenną przyszłość. About PRNI — the Polish National-Integralist Movement.",
  alternates: {
    canonical: "https://www.prni.org.pl/about",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
