import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skrzydło Główne PRNI",
  description:
    "Skrzydło Główne PRNI (Polski Ruch Narodowo-Integralistyczny). Main Wing of PRNI — the Polish National-Integralist Movement.",
  alternates: {
    canonical: "https://prni.org.pl/wings/main",
  },
};

export default function MainWingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
