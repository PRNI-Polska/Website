// file: app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, FileText, Users, Shield, Flag, Scale, Building, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

const ideologyIcons = [Shield, Flag, Scale, Building, Landmark];

export default function HomePage() {
  const { t, locale } = useI18n();

  const ideologySections = [
    { titleKey: "ideology.s1.title", textKey: "ideology.s1.text" },
    { titleKey: "ideology.s2.title", textKey: "ideology.s2.text" },
    { titleKey: "ideology.s3.title", textKey: "ideology.s3.text" },
    { titleKey: "ideology.s4.title", textKey: "ideology.s4.text" },
    { titleKey: "ideology.s5.title", textKey: "ideology.s5.text" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        
        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 animate-fade-in">
              <Image
                src="/logo.png"
                alt="PRNI Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
            
            {/* Party Name */}
            <div className="mb-6 animate-fade-in animation-delay-100">
              <h2 className="text-lg md:text-xl text-primary font-semibold tracking-widest uppercase mb-2">
                {locale === "pl" 
                  ? "Polski Ruch Narodowo-Integralistyczny" 
                  : "Polish National-Integralist Movement"}
              </h2>
            </div>
            
            <h1 className="text-display-lg md:text-display-xl font-heading font-bold tracking-tight mb-6 animate-fade-in animation-delay-200">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in animation-delay-300">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
              <Button size="xl" asChild>
                <Link href="/manifesto">
                  {t("hero.cta.manifesto")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/contact">{t("hero.cta.join")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">
              {t("mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("mission.text")}
            </p>
          </div>
        </div>
      </section>

      {/* Ideology Declaration */}
      <section className="section-spacing">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {locale === "pl" ? "Deklaracja Ideowa" : "Declaration of Ideology"}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              {t("ideology.title")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideologySections.map((section, index) => {
              const Icon = ideologyIcons[index];
              return (
                <Card 
                  key={section.titleKey} 
                  className={`card-hover animate-fade-in ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {t(section.titleKey)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(section.textKey)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Manifesto Highlights */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
              {t("section.manifesto")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("section.manifesto.subtitle")}
            </p>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/manifesto">
                {t("hero.cta.manifesto")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        {/* Very subtle flag stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
        
        <div className="container-custom text-center relative">
          <Users className="mx-auto h-12 w-12 mb-6 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            {t("cta.text")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">{t("cta.contact")}</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/about">{t("cta.learn")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
