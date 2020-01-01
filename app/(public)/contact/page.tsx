import type { Metadata } from "next";
import ContactPageClient from "./contact-client";

export const metadata: Metadata = {
  title: "Kontakt PRNI",
  description:
    "Skontaktuj się z PRNI (Polski Ruch Narodowo-Integralistyczny). Masz pytanie lub chcesz się zaangażować? Contact PRNI.",
  alternates: {
    canonical: "https://prni.org.pl/contact",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
