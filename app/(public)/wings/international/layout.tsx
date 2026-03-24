import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skrzydło Międzynarodowe PRNI",
  description:
    "Skrzydło Międzynarodowe PRNI (Polski Ruch Narodowo-Integralistyczny). International Wing of PRNI — the Polish National-Integralist Movement. Internationale Abteilung der PRNI.",
  alternates: {
    canonical: "https://www.prni.org.pl/wings/international",
  },
};

export default function InternationalWingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
