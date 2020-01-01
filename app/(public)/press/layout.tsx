import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prasa i Media — PRNI",
  description: "Materiały prasowe PRNI (Polski Ruch Narodowo-Integralistyczny). Press kit, logo, and media resources for PRNI — the Polish National-Integralist Movement.",
  alternates: { canonical: "https://www.prni.org.pl/press" },
};

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
