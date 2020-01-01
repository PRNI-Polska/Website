// file: app/(public)/wings/international/page.tsx
"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  Globe, 
  Users, 
  MessageSquare, 
  Share2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Scale,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { GlobalBackdrop, GlobeDecoration } from "@/components/global-backdrop";
import { useRevealOnScroll, useStaggeredReveal } from "@/hooks/use-reveal-on-scroll";
import { InternationalJoinForm } from "./international-join-form";
import { cn } from "@/lib/utils";

const activityIcons = [Globe, Share2, Users, MessageSquare, Search];

// Reusable reveal wrapper component
function RevealSection({ 
  children, 
  className,
  delay = 0 
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

export default function InternationalWingPage() {
  const { t } = useI18n();
  const { getDelay } = useStaggeredReveal(5, 80);

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
    const formElement = document.getElementById("join-form");
    if (formElement) {
      const headerOffset = 100;
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ====== HERO SECTION ====== */}
      <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
        {/* Background */}
        <GlobalBackdrop variant="hero" showGrid showDots />
        
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
            {/* Globe decoration + Title */}
            <div className="flex items-start gap-6 mb-6">
              <GlobeDecoration className="hidden md:block flex-shrink-0 -mt-2" />
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground">
                  {t("wings.international.title")}
                </h1>
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              {t("wings.international.hero.subtitle")}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="px-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <Globe className="w-4 h-4 mr-2" />
                {t("wings.joinCta")}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="border-2 hover:bg-slate-50"
              >
                <Link href="/contact">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("wings.contactCta")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Subtle bottom gradient fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: "linear-gradient(to top, hsl(var(--background)), transparent)"
          }}
        />
      </section>

      {/* ====== PURPOSE SECTION ====== */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <RevealSection className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-6 text-foreground">
              {t("wings.international.purpose.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("wings.international.purpose.text")}
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ====== ACTIVITIES SECTION ====== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-blue-50/30 to-slate-50/80" />
        
        <div className="container-custom relative z-10">
          <RevealSection>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-4 text-foreground">
              {t("wings.international.activities.title")}
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              {t("wings.international.purpose.text").split('.')[0]}.
            </p>
          </RevealSection>
          
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => {
              const Icon = activityIcons[index % activityIcons.length];
              return (
                <RevealSection key={index} delay={getDelay(index)}>
                  <div className="int-activity-card h-full p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center border border-blue-200/50">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground leading-relaxed font-medium">
                          {activity}
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

      {/* ====== BOUNDARIES SECTION ====== */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <RevealSection className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-3 text-foreground">
              {t("wings.international.boundaries.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("wings.international.boundaries.subtitle")}
            </p>
          </RevealSection>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Can Do */}
            <RevealSection delay={0}>
              <div className="int-boundary-card int-boundary-card-can h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {t("wings.international.boundaries.canTitle")}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {canDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0 text-green-500" />
                      <span className="text-green-900/90 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>

            {/* Cannot Do */}
            <RevealSection delay={100}>
              <div className="int-boundary-card int-boundary-card-cannot h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">
                    {t("wings.international.boundaries.cannotTitle")}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {cannotDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 mt-1 flex-shrink-0 text-red-500" />
                      <span className="text-red-900/90 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealSection>
          </div>

          {/* Disclaimer */}
          <RevealSection delay={200} className="max-w-3xl mx-auto mt-12">
            <div className="int-disclaimer flex items-start gap-4">
              <Scale className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t("wings.international.disclaimer")}
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ====== ENGAGE / FORM SECTION ====== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background */}
        <GlobalBackdrop variant="section" showGrid showDots={false} />
        
        <div className="container-custom relative z-10">
          <RevealSection className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold mb-4 text-foreground">
              {t("wings.international.engage.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("wings.international.engage.text")}
            </p>
          </RevealSection>

          {/* Join Form */}
          <RevealSection delay={100}>
            <div id="join-form" className="max-w-2xl mx-auto scroll-mt-28">
              <div className="int-form-card p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-100 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {t("wings.international.form.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("wings.international.hero.subtitle").split('.')[0]}
                    </p>
                  </div>
                </div>
                <InternationalJoinForm />
              </div>
            </div>
          </RevealSection>
          
          {/* Security note */}
          <RevealSection delay={200} className="max-w-2xl mx-auto mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>{t("wings.international.form.privacyHint")}</span>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
