// file: app/(public)/wings/main/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Users, Target, Building2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function MainWingPage() {
  const { t } = useI18n();

  const responsibilities = [
    { key: "wings.main.responsibilities.1", icon: Target },
    { key: "wings.main.responsibilities.2", icon: Building2 },
    { key: "wings.main.responsibilities.3", icon: Users },
    { key: "wings.main.responsibilities.4", icon: Megaphone },
  ];

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
              {t("wings.main.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground panel-reveal panel-reveal-2">
              {t("wings.main.tagline")}
            </p>
            <div className="w-24 h-1 bg-primary mt-8 line-reveal" />
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">
              {t("wings.main.purpose.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("wings.main.purpose.text")}
            </p>
          </div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-10">
              {t("wings.main.responsibilities.title")}
            </h2>
            <ul className="space-y-6">
              {responsibilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li 
                    key={item.key}
                    className="flex items-start gap-4 panel-reveal"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg pt-2">{t(item.key)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Engage CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
              {t("wings.main.engage.title")}
            </h2>
            <p className="text-lg opacity-90 mb-8">
              {t("wings.main.engage.text")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">{t("wings.joinCta")}</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white/20"
                asChild
              >
                <Link href="/contact">{t("wings.contactCta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
