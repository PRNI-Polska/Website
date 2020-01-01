// file: app/(public)/wings/main/page.tsx
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Flag,
  Users,
  Megaphone,
  MapPin,
  CalendarDays,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { SectionDivider } from "@/components/global-backdrop";
import { cn } from "@/lib/utils";

// Activity icons for the grid
const activityIcons = [Flag, MapPin, Megaphone, Users, CalendarDays, Wrench];

// Reusable reveal wrapper
function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn("int-reveal", isVisible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function MainWingPage() {
  const { t } = useI18n();

  const activities = [
    { key: "wings.main.activities.1", icon: activityIcons[0] },
    { key: "wings.main.activities.2", icon: activityIcons[1] },
    { key: "wings.main.activities.3", icon: activityIcons[2] },
    { key: "wings.main.activities.4", icon: activityIcons[3] },
    { key: "wings.main.activities.5", icon: activityIcons[4] },
    { key: "wings.main.activities.6", icon: activityIcons[5] },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* ====== HERO SECTION ====== */}
      <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
        {/* Subtle background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(148,163,184,0.12), transparent 70%)",
          }}
        />

        <div className="container-custom relative z-10">
          {/* Back Link */}
          <Link
            href="/wings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t("wings.back")}
          </Link>

          <div className="max-w-4xl">
            {/* Overline */}
            <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-4">
              {t("wings.main.overline")}
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              {t("wings.main.title")}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl">
              {t("wings.main.tagline")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="px-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Link href="/recruitment">
                  <Users className="w-4 h-4 mr-2" />
                  {t("nav.recruitment")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 transition-all hover:-translate-y-0.5"
              >
                <Link href="/contact">
                  {t("wings.contactCta")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--background)), transparent)",
          }}
        />
      </section>

      {/* ====== PURPOSE SECTION ====== */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <RevealSection className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-6 text-foreground tracking-tight">
              {t("wings.main.purpose.title")}
            </h2>
            {t("wings.main.purpose.text")
              .split("\n")
              .filter(Boolean)
              .map((paragraph, i) => (
                <p
                  key={i}
                  className="text-lg text-muted-foreground leading-[1.8] max-w-prose mb-4 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
          </RevealSection>
        </div>
      </section>

      <SectionDivider className="my-4" />

      {/* ====== AFTER JOINING SECTION ====== */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        {/* Subtle tinted background */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(145deg, rgba(148,163,184,0.04) 0%, transparent 60%)",
          }}
        />

        <div className="container-custom relative z-10">
          <RevealSection className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground tracking-tight">
                {t("wings.main.afterJoin.title")}
              </h2>
            </div>
            <p className="text-lg text-muted-foreground leading-[1.8] max-w-prose">
              {t("wings.main.afterJoin.text")}
            </p>
          </RevealSection>
        </div>
      </section>

      <SectionDivider className="my-4" />

      {/* ====== ACTIVITIES GRID ====== */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <RevealSection className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground tracking-tight">
              {t("wings.main.activities.title")}
            </h2>
          </RevealSection>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {activities.map((item, index) => {
              const Icon = item.icon;
              return (
                <RevealSection key={item.key} delay={index * 80}>
                  <div className="relative bg-card border border-border rounded-xl p-6 h-full transition-all hover:shadow-md hover:-translate-y-1 hover:border-primary/20"
                    style={{
                      transitionDuration: "var(--dur-2)",
                      transitionTimingFunction: "var(--ease-out)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground leading-relaxed font-medium">
                          {t(item.key)}
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider className="my-4" />

      {/* ====== ENGAGE / CTA SECTION ====== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(148,163,184,0.08), transparent 70%)",
          }}
        />

        <div className="container-custom relative z-10">
          <RevealSection className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-4 text-foreground tracking-tight">
              {t("wings.main.engage.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("wings.main.engage.text")}
            </p>
          </RevealSection>

          <RevealSection delay={100} className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="px-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Link href="/recruitment">
                {t("nav.recruitment")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 transition-all hover:-translate-y-0.5"
            >
              <Link href="/contact">{t("wings.contactCta")}</Link>
            </Button>
          </RevealSection>

          {/* Security note */}
          <RevealSection delay={200} className="max-w-2xl mx-auto mt-8">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>{t("recruitment.form.requiredHint")}</span>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
