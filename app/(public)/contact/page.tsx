// file: app/(public)/contact/page.tsx
import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "./contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with us. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          Kontakt
        </h1>
        <p className="text-xl text-muted-foreground">
          Masz pytanie lub chcesz się zaangażować? Chętnie Cię wysłuchamy.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Contact Information */}
        <div className="lg:col-span-1 animate-fade-in-up animation-delay-100">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:prni.official@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                prni.official@gmail.com
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 animate-fade-in-up animation-delay-200">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Wyślij wiadomość</CardTitle>
              <CardDescription>
                Wypełnij formularz poniżej, a my skontaktujemy się z Tobą najszybciej jak to możliwe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
