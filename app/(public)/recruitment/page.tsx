"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecruitmentForm } from "./recruitment-form";
import { useI18n } from "@/lib/i18n";

const PUBLIC_CONTACT_EMAIL = "prni.official@gmail.com";

export default function RecruitmentPage() {
  const { t } = useI18n();

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl lg:max-w-5xl mx-auto text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          {t("recruitment.title")}
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {t("recruitment.title")}
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          {t("recruitment.subtitle")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-5">
        {/* Instructions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t("recruitment.instructions.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("recruitment.instructions.desc")}
            </p>

            <div className="space-y-1.5 text-sm">
              <div className="text-muted-foreground">{t("recruitment.instructions.emailLabel")}</div>
              <a
                className="font-medium text-foreground hover:text-primary transition-colors"
                href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              >
                {PUBLIC_CONTACT_EMAIL}
              </a>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="text-muted-foreground">{t("recruitment.instructions.subjectLabel")}</div>
              <div className="font-medium text-foreground">
                {t("recruitment.instructions.subjectValue")}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{t("recruitment.instructions.includeLabel")}</div>
              <ul className="text-sm text-foreground/90 space-y-1 list-disc pl-5">
                <li>{t("recruitment.instructions.include.1")}</li>
                <li>{t("recruitment.instructions.include.2")}</li>
                <li>{t("recruitment.instructions.include.3")}</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">{t("nav.contact")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">{t("recruitment.form.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecruitmentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

