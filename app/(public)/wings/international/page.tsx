// file: app/(public)/wings/international/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Users, MessageSquare, Share2, Search, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { InternationalJoinForm } from "./international-join-form";

const activityIcons = [Globe, Share2, Users, MessageSquare, Search];

export default function InternationalWingPage() {
  const { t } = useI18n();

  const activities = [
    t("wings.international.activities.1"),
    t("wings.international.activities.2"),
    t("wings.international.activities.3"),
    t("wings.international.activities.4"),
    t("wings.international.activities.5"),
  ];

  const canDo = [
    t("wings.international.boundaries.can.1"),
    t("wings.international.boundaries.can.2"),
    t("wings.international.boundaries.can.3"),
    t("wings.international.boundaries.can.4"),
  ];

  const cannotDo = [
    t("wings.international.boundaries.cannot.1"),
    t("wings.international.boundaries.cannot.2"),
    t("wings.international.boundaries.cannot.3"),
    t("wings.international.boundaries.cannot.4"),
  ];

  const scrollToForm = () => {
    document.getElementById("join-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-blue-50/50 to-background">
        <div className="container-custom">
          {/* Back Link */}
          <Link 
            href="/wings" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("wings.back")}
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
              {t("wings.international.title")}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {t("wings.international.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={scrollToForm}>
                {t("wings.joinCta")}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t("wings.contactCta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">
              {t("wings.international.purpose.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("wings.international.purpose.text")}
            </p>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-10">
            {t("wings.international.activities.title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => {
              const Icon = activityIcons[index % activityIcons.length];
              return (
                <Card key={index} className="border-0 shadow-sm bg-card">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground leading-relaxed pt-1.5">
                      {activity}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Boundaries Section */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-10">
            {t("wings.international.boundaries.title")}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Can Do */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {t("wings.international.boundaries.canTitle")}
                </h3>
                <ul className="space-y-3">
                  {canDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-green-900">
                      <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Cannot Do */}
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  {t("wings.international.boundaries.cannotTitle")}
                </h3>
                <ul className="space-y-3">
                  {cannotDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-red-900">
                      <XCircle className="w-4 h-4 mt-1 flex-shrink-0 text-red-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-5 bg-muted/50 border border-border rounded-lg flex items-start gap-4">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              {t("wings.international.disclaimer")}
            </p>
          </div>
        </div>
      </section>

      {/* Engage Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-4">
              {t("wings.international.engage.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("wings.international.engage.text")}
            </p>
          </div>

          {/* Join Form */}
          <div id="join-form" className="max-w-2xl mx-auto scroll-mt-24">
            <Card className="shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6 text-center">
                  {t("wings.international.form.title")}
                </h3>
                <InternationalJoinForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
