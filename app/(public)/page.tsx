// file: app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Users, Shield, Flag, Scale, Building, Landmark, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useParallax } from "@/lib/use-scroll-animation";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { formatDate } from "@/lib/utils";

const ideologyIcons = [Shield, Flag, Scale, Building, Landmark];

interface Announcement {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const parallaxRef = useParallax(0.3);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Fetch recent announcements
    fetch("/api/admin/announcements?limit=3&status=PUBLISHED")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnnouncements(data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const ideologySections = [
    { titleKey: "ideology.s1.title", textKey: "ideology.s1.text" },
    { titleKey: "ideology.s2.title", textKey: "ideology.s2.text" },
    { titleKey: "ideology.s3.title", textKey: "ideology.s3.text" },
    { titleKey: "ideology.s4.title", textKey: "ideology.s4.text" },
    { titleKey: "ideology.s5.title", textKey: "ideology.s5.text" },
  ];

  const categoryLabels: Record<string, { pl: string; en: string; de: string }> = {
    NEWS: { pl: "Wiadomość", en: "News", de: "Nachricht" },
    PRESS_RELEASE: { pl: "Komunikat", en: "Press Release", de: "Pressemitteilung" },
    POLICY: { pl: "Polityka", en: "Policy", de: "Politik" },
    CAMPAIGN: { pl: "Kampania", en: "Campaign", de: "Kampagne" },
    COMMUNITY: { pl: "Społeczność", en: "Community", de: "Gemeinschaft" },
    OTHER: { pl: "Inne", en: "Other", de: "Sonstiges" },
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden grain-overlay">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo with parallax and glow */}
            <div 
              ref={parallaxRef}
              className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 z-10"
            >
              {/* Radial pulse behind logo */}
              <div className="radial-pulse" />
              
              <div className="animate-scale-in relative z-10">
                <Image
                  src="/logo.png"
                  alt="PRNI Logo"
                  fill
                  className="object-contain logo-glow animate-float"
                  priority
                />
              </div>
            </div>
            
            {/* Party Name */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-lg md:text-xl text-primary font-semibold tracking-widest uppercase mb-2">
                {locale === "pl" 
                  ? "Polski Ruch Narodowo-Integralistyczny" 
                  : locale === "de"
                  ? "Polnische National-Integralistische Bewegung"
                  : "Polish National-Integralist Movement"}
              </h2>
            </div>
            
            <h1 
              className="text-display-lg md:text-display-xl font-heading font-bold tracking-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              {t("hero.title")}
            </h1>
            
            <p 
              className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              {t("hero.subtitle")}
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
              style={{ animationDelay: "500ms" }}
            >
              <Button size="xl" asChild className="btn-glow group">
                <Link href="/manifesto">
                  {t("hero.cta.manifesto")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="hover-lift">
                <Link href="/contact">{t("hero.cta.join")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Mission Statement */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <AnimatedSection className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">
              {t("mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("mission.text")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <section className="section-spacing">
          <div className="container-custom">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Megaphone className="w-3 h-3 mr-1" aria-hidden="true" />
                {locale === "pl" ? "Aktualności" : locale === "de" ? "Aktuelles" : "Latest"}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold">
                {t("section.news")}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t("section.news.subtitle")}
              </p>
            </AnimatedSection>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {announcements.map((announcement, index) => (
                <AnimatedSection key={announcement.id} delay={index * 100}>
                  <Link href={`/announcements/${announcement.slug}`}>
                    <Card className="h-full hover-lift cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[announcement.category]?.[locale] || announcement.category}
                          </Badge>
                          {announcement.publishedAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(new Date(announcement.publishedAt))}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {announcement.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {announcement.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="text-center">
              <Button variant="outline" asChild className="group">
                <Link href="/announcements">
                  {t("common.viewAll")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Ideology Declaration */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {locale === "pl" ? "Deklaracja Ideowa" : locale === "de" ? "Ideologische Erklärung" : "Declaration of Ideology"}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              {t("ideology.title")}
            </h2>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideologySections.map((section, index) => {
              const Icon = ideologyIcons[index];
              return (
                <AnimatedSection 
                  key={section.titleKey}
                  delay={index * 100}
                  animation="scale"
                >
                  <Card 
                    className={`card-hover hover-lift h-full ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
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
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Manifesto Highlights */}
      <section className="section-spacing">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
              {t("section.manifesto")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("section.manifesto.subtitle")}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200} className="text-center">
            <Button size="lg" asChild className="btn-glow group">
              <Link href="/manifesto">
                {t("hero.cta.manifesto")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Subtle decorative elements with animation */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: "4s" }} aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} aria-hidden="true" />
        {/* Very subtle flag stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" aria-hidden="true" />
        
        <div className="container-custom text-center relative">
          <AnimatedSection animation="scale">
            <Users className="mx-auto h-12 w-12 mb-6 opacity-80" aria-hidden="true" />
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              {t("cta.text")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="hover-lift">
                <Link href="/contact">{t("cta.contact")}</Link>
              </Button>
              <Button 
                size="lg" 
                className="border-2 border-white text-white bg-transparent hover:bg-white/20 hover-lift"
                asChild
              >
                <Link href="/about">{t("cta.learn")}</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
