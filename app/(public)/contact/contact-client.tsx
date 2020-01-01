"use client";

import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "./contact-form";
import { useI18n } from "@/lib/i18n";

export default function ContactPageClient() {
  const { t } = useI18n();

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {t("contact.title")}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t("contact.email.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:prni.official@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                prni.official@gmail.com
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("contact.form.title")}</CardTitle>
              <CardDescription>
                {t("contact.form.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
