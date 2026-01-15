// file: app/(public)/manifesto/page.tsx
"use client";

import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function ManifestoPage() {
  const { locale } = useI18n();

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {locale === "pl" ? "Manifest" : locale === "de" ? "Manifest" : "Manifesto"}
        </h1>
      </div>

      <Card className="max-w-xl mx-auto">
        <CardContent className="py-16 text-center">
          <Construction className="mx-auto h-16 w-16 text-primary mb-6" />
          <h2 className="text-2xl font-heading font-semibold mb-4">
            {locale === "pl" ? "W budowie" : locale === "de" ? "Im Aufbau" : "Under Construction"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {locale === "pl" 
              ? "Nasz manifest jest obecnie przygotowywany. Wróć wkrótce." 
              : locale === "de"
                ? "Unser Manifest wird derzeit vorbereitet. Schauen Sie bald wieder vorbei."
                : "Our manifesto is currently being prepared. Check back soon."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
