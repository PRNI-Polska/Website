// file: app/(public)/manifesto/page.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { manifestoContent } from "@/content/manifesto";
import { useI18n } from "@/lib/i18n";

export default function ManifestoPage() {
  const { locale } = useI18n();
  const content = manifestoContent[locale];

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl lg:max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {content.title}
        </h1>
      </div>

      <Card className="max-w-4xl lg:max-w-5xl mx-auto">
        <CardContent className="py-10 md:py-12">
          <div className="space-y-6 md:space-y-7 text-left">
            {content.paragraphs.map((p, idx) => (
              <p key={idx} className="text-foreground/95 text-lg md:text-xl leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

