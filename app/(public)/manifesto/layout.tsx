import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifest PRNI",
  description:
    "Manifest PRNI (Polski Ruch Narodowo-Integralistyczny) — fundamenty ideologiczne ruchu. The manifesto of PRNI — the Polish National-Integralist Movement.",
  alternates: {
    canonical: "https://www.prni.org.pl/manifesto",
  },
};

export default function ManifestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
