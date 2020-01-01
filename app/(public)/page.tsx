// file: app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

// Ideology sections data
const ideologySections = [
  {
    id: "s1",
    title: "§ 1. Naród jako najwyższa wartość polityczna",
    text: "Uznajemy naród za najwyższą wartość polityczną. Naród pojmujemy jako byt historyczny i kulturowy, stojący ponad interesami jednostek oraz grup społecznych."
  },
  {
    id: "s2",
    title: "§ 2. Jedność ideowa i kulturowa",
    text: "Opowiadamy się za zachowaniem jedności ideowej i kulturowej wspólnoty narodowej. Uznajemy konieczność obrony jednej, polskiej tradycji narodowej jako fundamentu tożsamości i ciągłości narodu."
  },
  {
    id: "s3",
    title: "§ 3. Antyliberalizm",
    text: "Odrzucamy liberalizm polityczny, oparty na skrajnym pluralizmie i indywidualizmie, jak również liberalizm kulturowy, prowadzący do relatywizacji wartości i osłabienia więzi narodowych."
  },
  {
    id: "s4",
    title: "§ 4. Degeneracja moralna współczesnego społeczeństwa",
    text: "Sprzeciwiamy się ogarniającym świat globalizmowi oraz międzynarodowym korporacjom wspierającym liberalne i progresywne inicjatywy mające na celu destabilizację i kontrolę narodów, w wyniku których współczesne społeczeństwa poddawane są procesowi głębokiej erozji moralnej i aksjologicznej — jeśli proces ten nie zostanie powstrzymany, doprowadzi on do destrukcji ładu społecznego i tożsamości narodowej."
  },
  {
    id: "s5",
    title: "§ 5. Gospodarka podporządkowana narodowi",
    text: "Uznajemy, że gospodarka powinna służyć narodowi. Nie opowiadamy się ani za skrajnym wolnym rynkiem, ani za socjalizmem. Dopuszczamy interwencję państwa tam, gdzie wymaga tego interes narodowy lub stabilność społeczna."
  },
  {
    id: "s6",
    title: "§ 6. Zasady współpracy międzynarodowej",
    text: "Opowiadamy się za współpracą międzynarodową opartą na poszanowaniu suwerenności, samostanowienia oraz pełnej niezależności politycznej i gospodarczej państw. Wszelkie formy integracji ponadnarodowej uznajemy za dopuszczalne wyłącznie wówczas, gdy nie naruszają one nadrzędności interesu narodowego, nie ograniczają kompetencji państwa w kluczowych obszarach oraz pozostają oparte na dobrowolności i równoprawności uczestników."
  },
  {
    id: "s7",
    title: "§ 7. Bezpieczeństwo i obronność państwa",
    text: "Uznajemy, że bezpieczeństwo państwa powinno opierać się na zdolności do samodzielnej obrony oraz na współpracy międzynarodowej o wyłącznie obronnym charakterze. Sprzeciwiamy się polityce ekspansji militarnej, wykorzystywaniu sojuszy wojskowych jako narzędzi presji politycznej oraz działaniom prowadzącym do destabilizacji ładu międzynarodowego. Trwałe bezpieczeństwo może być budowane jedynie w oparciu o równowagę sił, odpowiedzialność państw oraz poszanowanie ich suwerenności."
  },
  {
    id: "s8",
    title: "§ 8. Państwo organiczne",
    text: "Uznajemy państwo za organiczny wyraz woli narodu. Państwo nie jest neutralnym arbitrem pomiędzy konkurującymi interesami, lecz narzędziem realizacji interesu narodowego."
  },
];

export default function HomePage() {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col">
      {/* Hero Section with Polish Flag Background */}
      <section className="relative py-20 md:py-32 overflow-hidden hero-flag-bg">
        <div className="container-custom relative z-10">
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
                  : locale === "de"
                  ? "Polnische National-Integralistische Bewegung"
                  : "Polish National-Integralist Movement"}
              </h2>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-6 animate-fade-in animation-delay-200">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in animation-delay-300">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
              <Button size="lg" asChild>
                <Link href="/manifesto">
                  {t("hero.cta.manifesto")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
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
              {locale === "pl" ? "Deklaracja Ideowa" : locale === "de" ? "Ideologische Erklärung" : "Declaration of Ideology"}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              {locale === "pl" ? "Deklaracja Ideowa Narodowego Integralizmu" : locale === "de" ? "Erklärung der nationalen Integralismus-Ideologie" : "Declaration of National Integralism Ideology"}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {ideologySections.map((section, index) => (
              <Card 
                key={section.id} 
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg leading-tight text-primary">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {section.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto CTA */}
      <section className="section-spacing bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-8">
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
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
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
              className="border-2 border-white text-white bg-transparent hover:bg-white/20"
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
