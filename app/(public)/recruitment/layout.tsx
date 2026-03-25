import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rekrutacja — Dołącz do PRNI",
  description:
    "Dołącz do PRNI (Polski Ruch Narodowo-Integralistyczny). Join PRNI — the Polish National-Integralist Movement. Przyszłość zaczyna się teraz.",
  alternates: {
    canonical: "https://www.prni.org.pl/recruitment",
  },
};

export default function RecruitmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
