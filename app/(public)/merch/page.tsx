"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export default function MerchPage() {
  const { t } = useI18n();

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl lg:max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {t("merch.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("merch.subtitle")}
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardContent className="py-12 text-center">
          <Badge variant="secondary" className="mb-4">
            {t("merch.comingSoon")}
          </Badge>
          <p className="text-muted-foreground">{t("merch.subtitle")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

