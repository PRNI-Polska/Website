import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skrzydła PRNI",
  description:
    "Skrzydła organizacyjne PRNI (Polski Ruch Narodowo-Integralistyczny). Organizational wings of PRNI — the Polish National-Integralist Movement.",
  alternates: {
    canonical: "https://prni.org.pl/wings",
  },
};

export default function WingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
