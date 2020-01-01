// file: app/(public)/about/about-client.tsx
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function AboutPageClient() {
  const { t } = useI18n();

  const values = ["nationalism", "integralism", "sovereignty", "order"];

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/sword-banner.png')",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 95vh",
          opacity: 0.08,
        }}
      />

      <div className="relative z-10 container-custom py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            {t("about.title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Mission & Vision */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>{t("about.mission.title")}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {t("about.mission.text").split("\n").map((paragraph, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : ""}>
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("about.vision.title")}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {t("about.vision.text").split("\n").map((paragraph, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : ""}>
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-8">
            {t("about.values.title")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((key) => (
              <Card key={key} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t(`about.value.${key}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t(`about.value.${key}.text`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Photo gallery */}
        <section className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: "/photos/flag-sea-1.png", alt: "PRNI flag by the sea" },
              { src: "/photos/flag-sea-2.png", alt: "PRNI flag at the coast" },
              { src: "/photos/flag-beach.png", alt: "PRNI flag on the beach" },
              { src: "/photos/flag-march.png", alt: "PRNI march with the flag" },
            ].map((photo) => (
              <div
                key={photo.src}
                className="relative rounded-lg overflow-hidden aspect-[3/4]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  style={{ filter: "brightness(1.3) contrast(1.15)" }}
                />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
