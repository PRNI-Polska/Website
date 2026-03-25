"use client";

import Image from "next/image";
import { Download, Mail, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, useCallback } from "react";

type Locale = "en" | "pl" | "de";

const content = {
  heading: {
    en: "Press & Media",
    pl: "Prasa i Media",
    de: "Presse & Medien",
  },
  subtitle: {
    en: "Official press kit and media resources for journalists covering PRNI.",
    pl: "Oficjalny pakiet prasowy i materiały medialne dla dziennikarzy piszących o PRNI.",
    de: "Offizielles Pressepaket und Medienressourcen für Journalisten, die über PRNI berichten.",
  },

  aboutTitle: {
    en: "About PRNI",
    pl: "O PRNI",
    de: "Über PRNI",
  },
  aboutText: {
    en: "The Polish National-Integralist Movement (PRNI) is a political movement founded in 2024, dedicated to national sovereignty, tradition, and the integral unity of Poland. Motto: The future starts now.",
    pl: "Polski Ruch Narodowo-Integralistyczny (PRNI) to ruch polityczny założony w 2024 roku, działający na rzecz suwerenności, tradycji i integralności narodowej Polski. Motto: Przyszłość zaczyna się teraz.",
    de: "Die Polnische National-Integralistische Bewegung (PRNI) ist eine 2024 gegründete politische Bewegung für nationale Souveränität, Tradition und die integrale Einheit Polens. Motto: Die Zukunft beginnt jetzt.",
  },

  keyFactsTitle: {
    en: "Key Facts",
    pl: "Najważniejsze fakty",
    de: "Eckdaten",
  },

  logoTitle: {
    en: "Logo & Brand Assets",
    pl: "Logo i zasoby marki",
    de: "Logo & Markenressourcen",
  },
  logoDownload: {
    en: "Download Logo (PNG)",
    pl: "Pobierz logo (PNG)",
    de: "Logo herunterladen (PNG)",
  },
  brandColors: {
    en: "Brand Colors",
    pl: "Kolory marki",
    de: "Markenfarben",
  },
  logoNote: {
    en: "The logo should be displayed on dark backgrounds for best visibility. Do not alter, recolor, or distort the logo.",
    pl: "Logo powinno być wyświetlane na ciemnych tłach dla najlepszej widoczności. Nie należy zmieniać, przekolorować ani zniekształcać logo.",
    de: "Das Logo sollte auf dunklem Hintergrund angezeigt werden. Bitte nicht verändern, umfärben oder verzerren.",
  },

  descriptionsTitle: {
    en: "Official Descriptions",
    pl: "Oficjalne opisy",
    de: "Offizielle Beschreibungen",
  },
  descShortLabel: {
    en: "Short (1 sentence)",
    pl: "Krótki (1 zdanie)",
    de: "Kurz (1 Satz)",
  },
  descMediumLabel: {
    en: "Medium (2–3 sentences)",
    pl: "Średni (2–3 zdania)",
    de: "Mittel (2–3 Sätze)",
  },
  descLongLabel: {
    en: "Long (paragraph)",
    pl: "Długi (akapit)",
    de: "Lang (Absatz)",
  },
  descShort: {
    en: "PRNI (Polish National-Integralist Movement) is a Polish political movement founded in 2024, advocating for national sovereignty and integral unity.",
    pl: "PRNI (Polski Ruch Narodowo-Integralistyczny) to polski ruch polityczny założony w 2024 roku, działający na rzecz suwerenności i integralności narodowej.",
    de: "PRNI (Polnische National-Integralistische Bewegung) ist eine 2024 gegründete polnische politische Bewegung für nationale Souveränität und integrale Einheit.",
  },
  descMedium: {
    en: "The Polish National-Integralist Movement (PRNI) is a political movement founded in 2024, dedicated to national sovereignty, tradition, and the integral unity of Poland. It advocates for the nation as the highest political value, rejecting liberalism and globalism in favor of a strong, organic state serving the national interest.",
    pl: "Polski Ruch Narodowo-Integralistyczny (PRNI) to ruch polityczny założony w 2024 roku, działający na rzecz suwerenności, tradycji i integralności narodowej Polski. Opowiada się za narodem jako najwyższą wartością polityczną, odrzucając liberalizm i globalizm na rzecz silnego, organicznego państwa służącego interesowi narodowemu.",
    de: "Die Polnische National-Integralistische Bewegung (PRNI) ist eine 2024 gegründete politische Bewegung für nationale Souveränität, Tradition und die integrale Einheit Polens. Sie tritt für die Nation als höchsten politischen Wert ein und lehnt Liberalismus und Globalismus zugunsten eines starken, organischen Staates ab, der dem nationalen Interesse dient.",
  },
  descLong: {
    en: "The Polish National-Integralist Movement (PRNI) is a political movement founded in 2024, dedicated to national sovereignty, tradition, and the integral unity of Poland. Under the motto \"The future starts now,\" PRNI advocates for the nation as the highest political value, the preservation of Polish national identity and cultural unity, and the construction of an organic state that serves the interests of the nation. The movement opposes political liberalism, cultural relativism, and the influence of international corporations on national politics. PRNI's program encompasses economic policy subordinated to the national interest, international cooperation based on sovereignty and self-determination, and a comprehensive approach to state security and defense.",
    pl: "Polski Ruch Narodowo-Integralistyczny (PRNI) to ruch polityczny założony w 2024 roku, działający na rzecz suwerenności, tradycji i integralności narodowej Polski. Pod hasłem 'Przyszłość zaczyna się teraz' PRNI opowiada się za narodem jako najwyższą wartością polityczną, zachowaniem polskiej tożsamości narodowej i jedności kulturowej oraz budową organicznego państwa służącego interesom narodu. Ruch sprzeciwia się liberalizmowi politycznemu, relatywizmowi kulturowemu i wpływowi międzynarodowych korporacji na politykę narodową. Program PRNI obejmuje politykę gospodarczą podporządkowaną interesowi narodowemu, współpracę międzynarodową opartą na suwerenności i samostanowieniu oraz kompleksowe podejście do bezpieczeństwa i obronności państwa.",
    de: "Die Polnische National-Integralistische Bewegung (PRNI) ist eine 2024 gegründete politische Bewegung für nationale Souveränität, Tradition und die integrale Einheit Polens. Unter dem Motto 'Die Zukunft beginnt jetzt' tritt PRNI für die Nation als höchsten politischen Wert ein, für die Bewahrung der polnischen nationalen Identität und kulturellen Einheit sowie den Aufbau eines organischen Staates, der den Interessen der Nation dient. Die Bewegung lehnt politischen Liberalismus, kulturellen Relativismus und den Einfluss internationaler Konzerne auf die nationale Politik ab. Das Programm von PRNI umfasst eine dem nationalen Interesse untergeordnete Wirtschaftspolitik, internationale Zusammenarbeit auf Grundlage von Souveränität und Selbstbestimmung sowie einen umfassenden Ansatz für staatliche Sicherheit und Verteidigung.",
  },

  contactTitle: {
    en: "Press Contact",
    pl: "Kontakt dla mediów",
    de: "Pressekontakt",
  },
  contactNote: {
    en: "For press inquiries, please email us. We aim to respond within 48 hours on business days.",
    pl: "W sprawie zapytań prasowych prosimy o kontakt mailowy. Staramy się odpowiadać w ciągu 48 godzin w dni robocze.",
    de: "Für Presseanfragen kontaktieren Sie uns bitte per E-Mail. Wir bemühen uns, innerhalb von 48 Stunden an Werktagen zu antworten.",
  },
  copySuccess: {
    en: "Copied!",
    pl: "Skopiowano!",
    de: "Kopiert!",
  },
} as const;

const keyFacts = [
  { label: { en: "Founded", pl: "Założony", de: "Gegründet" }, value: "2024" },
  { label: { en: "Full Name", pl: "Pełna nazwa", de: "Vollständiger Name" }, value: "Polski Ruch Narodowo-Integralistyczny" },
  { label: { en: "Abbreviation", pl: "Skrót", de: "Abkürzung" }, value: "PRNI" },
  { label: { en: "Motto", pl: "Motto", de: "Motto" }, value: { en: "The future starts now", pl: "Przyszłość zaczyna się teraz", de: "Die Zukunft beginnt jetzt" } },
  { label: { en: "Website", pl: "Strona", de: "Webseite" }, value: "www.prni.org.pl" },
  { label: { en: "Email", pl: "E-mail", de: "E-Mail" }, value: "prni.official@gmail.com" },
];

const brandColors = [
  { name: "Black", hex: "#090909" },
  { name: "Red", hex: "#dc2626" },
  { name: "White", hex: "#ffffff" },
];

function CopyButton({ text, locale }: { text: string; locale: Locale }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-white/[0.06] transition-colors flex-shrink-0"
      title={copied ? content.copySuccess[locale] : "Copy"}
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function PressPage() {
  const { t, locale } = useI18n();
  const l = locale as Locale;

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <Badge variant="outline" className="mb-4">
          Press Kit
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {content.heading[l]}
        </h1>
        <p className="text-xl text-muted-foreground">
          {content.subtitle[l]}
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* About PRNI */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">{content.aboutTitle[l]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <p className="text-muted-foreground leading-relaxed flex-1">
                {content.aboutText[l]}
              </p>
              <CopyButton text={content.aboutText[l]} locale={l} />
            </div>
          </CardContent>
        </Card>

        {/* Key Facts */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6">{content.keyFactsTitle[l]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyFacts.map((fact, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {fact.label[l]}
                  </p>
                  <p className="font-semibold break-all">
                    {typeof fact.value === "string" ? fact.value : fact.value[l]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Logo & Brand Assets */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6">{content.logoTitle[l]}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-muted/30">
              <CardContent className="pt-6 flex flex-col items-center gap-6">
                <div className="bg-[#090909] rounded-xl p-8 w-full flex items-center justify-center border border-white/[0.06]">
                  <div className="relative h-32 w-32">
                    <Image
                      src="/logo.png"
                      alt="PRNI Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <a href="/logo.png" download="prni-logo.png">
                    <Download className="h-4 w-4 mr-2" />
                    {content.logoDownload[l]}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">{content.brandColors[l]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {brandColors.map((color) => (
                      <div key={color.hex} className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-md border border-white/[0.06] flex-shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="font-medium text-sm">{color.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30 border-white/[0.06]">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {content.logoNote[l]}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Official Descriptions */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-6">{content.descriptionsTitle[l]}</h2>
          <div className="space-y-4">
            {[
              { label: content.descShortLabel, text: content.descShort },
              { label: content.descMediumLabel, text: content.descMedium },
              { label: content.descLongLabel, text: content.descLong },
            ].map((desc, i) => (
              <Card key={i} className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">{desc.label[l]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2">
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      {desc.text[l]}
                    </p>
                    <CopyButton text={desc.text[l]} locale={l} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Press Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Mail className="h-5 w-5 text-primary" />
              {content.contactTitle[l]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="mailto:prni.official@gmail.com"
              className="text-primary hover:underline font-medium text-lg"
            >
              prni.official@gmail.com
            </a>
            <p className="text-sm text-muted-foreground">
              {content.contactNote[l]}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
