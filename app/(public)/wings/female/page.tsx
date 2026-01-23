// file: app/(public)/wings/female/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bell, Mail } from "lucide-react";
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
    
    // Simulate subscription (connect to actual service)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const messages = {
      pl: { title: "Zapisano!", desc: "Powiadomimy Cię, gdy Skrzydło Kobiece zostanie uruchomione." },
      en: { title: "Subscribed!", desc: "We'll notify you when the Female Wing launches." },
      de: { title: "Angemeldet!", desc: "Wir benachrichtigen Sie, wenn der Frauenflügel startet." },
    };
    
    toast({
      title: messages[locale].title,
      description: messages[locale].desc,
    });
    
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container-custom relative">
          {/* Back link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("wings.back")}
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-6 panel-reveal panel-reveal-1">
              {t("wings.female.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground panel-reveal panel-reveal-2">
              {t("wings.female.tagline")}
            </p>
            <div className="w-24 h-1 bg-primary mt-8 line-reveal" />
          </div>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm mb-8">
              <Bell className="w-4 h-4" />
              {t("wings.female.comingSoon")}
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              {t("wings.female.purpose.text")}
            </p>

            {/* Notification Form */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={locale === "pl" ? "Twój email" : locale === "de" ? "Ihre E-Mail" : "Your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (locale === "pl" ? "Zapisywanie..." : locale === "de" ? "Anmelden..." : "Subscribing...")
                    : t("wings.female.notify")
                  }
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground mb-6">
              {locale === "pl" 
                ? "Chcesz dowiedzieć się więcej? Skontaktuj się z nami." 
                : locale === "de"
                ? "Möchten Sie mehr erfahren? Kontaktieren Sie uns."
                : "Want to learn more? Get in touch with us."}
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">{t("wings.contactCta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
