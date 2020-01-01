import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka Prywatności PRNI",
  description:
    "Polityka prywatności PRNI (Polski Ruch Narodowo-Integralistyczny): zasady przetwarzania danych osobowych, pliki cookie, newsletter i Twoje prawa w świetle RODO.",
  alternates: {
    canonical: "https://www.prni.org.pl/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
