import type { Metadata } from "next";
import ContactPageClient from "./contact-client";

export const metadata: Metadata = {
  title: "Kontakt — PRNI",
  description: "Skontaktuj się z nami. Masz pytanie lub chcesz się zaangażować?",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
