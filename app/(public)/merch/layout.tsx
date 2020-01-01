import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merch PRNI",
  description:
    "Oficjalny merch PRNI (Polski Ruch Narodowo-Integralistyczny). Official PRNI merchandise — support the movement. Offizielles PRNI-Merchandise.",
  alternates: {
    canonical: "https://prni.org.pl/merch",
  },
};

export default function MerchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
