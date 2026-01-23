// file: app/(public)/wings/female/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";

export default function FemaleWingPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const messages = {
      pl: { title: "Zapisano", desc: "Powiadomimy Cię, gdy Skrzydło Kobiece zostanie uruchomione." },
      en: { title: "Subscribed", desc: "We'll notify you when the Female Wing launches." },
      de: { title: "Angemeldet", desc: "Wir benachrichtigen Sie, wenn der Frauenflügel startet." },
    };
    
    toast({
      title: messages[locale].title,
      description: messages[locale].desc,
    });
    
    setEmail("");
    setIsSubmitting(false);
  };

  const backText = locale === "pl" ? "Powrót" : locale === "de" ? "Zurück" : "Back";
  const comingSoonText = locale === "pl" ? "Wkrótce" : locale === "de" ? "Demnächst" : "Coming soon";
  const notifyText = locale === "pl" ? "Powiadom mnie" : locale === "de" ? "Benachrichtigen" : "Notify me";
  const emailPlaceholder = locale === "pl" ? "Twój email" : locale === "de" ? "Ihre E-Mail" : "Your email";
  const submittingText = locale === "pl" ? "Zapisywanie..." : locale === "de" ? "Speichern..." : "Subscribing...";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container-custom max-w-3xl">
          {/* Back */}
          <Link 
            href="/"
            className="reveal-section reveal-delay-1 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" style={{ transitionDuration: 'var(--dur-2)', transitionTimingFunction: 'var(--ease-out)' }} />
            {backText}
          </Link>

          <h1 className="reveal-section reveal-delay-2 text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground mb-4">
            {t("wings.female.title")}
          </h1>
          <p className="reveal-section reveal-delay-3 text-lg text-muted-foreground">
            {t("wings.female.tagline")}
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 border-t border-border">
        <div className="container-custom max-w-3xl">
          {/* Badge */}
          <div className="reveal-section reveal-delay-1 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-muted text-muted-foreground text-xs font-medium mb-6">
            {comingSoonText}
          </div>
          
          <p className="reveal-section reveal-delay-2 text-lg text-foreground leading-relaxed mb-10">
            {t("wings.female.purpose.text")}
          </p>

          {/* Notification Form */}
          <div className="reveal-section reveal-delay-3 max-w-sm">
            <form onSubmit={handleNotifySubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="hover-lift">
                {isSubmitting ? submittingText : notifyText}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="container-custom max-w-3xl">
          <p className="reveal-section reveal-delay-1 text-muted-foreground mb-6">
            {locale === "pl" 
              ? "Masz pytania? Skontaktuj się z nami." 
              : locale === "de"
              ? "Haben Sie Fragen? Kontaktieren Sie uns."
              : "Have questions? Get in touch with us."}
          </p>
          <Button variant="outline" asChild className="reveal-section reveal-delay-2 hover-lift">
            <Link href="/contact">{t("wings.contactCta")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
