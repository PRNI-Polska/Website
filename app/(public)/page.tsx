// file: app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ArrowRight, Shield, Globe, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Wing panel data
const wings = [
  {
    id: "main",
    href: "/wings/main",
    titleKey: "wings.main.title",
    taglineKey: "wings.main.tagline",
    ctaKey: "wings.main.cta",
    icon: Shield,
    disabled: false,
    accent: "from-primary/20 to-primary/5",
  },
  {
    id: "international",
    href: "/wings/international",
    titleKey: "wings.international.title",
    taglineKey: "wings.international.tagline",
    ctaKey: "wings.international.cta",
    icon: Globe,
    disabled: false,
    accent: "from-secondary/20 to-secondary/5",
  },
  {
    id: "female",
    href: "/wings/female",
    titleKey: "wings.female.title",
    taglineKey: "wings.female.tagline",
    ctaKey: "wings.female.cta",
    icon: Heart,
    disabled: true,
    accent: "from-muted to-muted/50",
  },
];

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle panel click with takeover animation
  const handlePanelClick = useCallback((wing: typeof wings[0]) => {
    if (wing.disabled || isNavigating) return;
    
    setSelectedPanel(wing.id);
    setIsNavigating(true);
    
    // Navigate after animation completes
    setTimeout(() => {
      router.push(wing.href);
    }, 450);
  }, [router, isNavigating]);

  // Smooth scroll to content section
  const scrollToContent = () => {
    document.getElementById("content-section")?.scrollIntoView({ 
      behavior: "smooth" 
    });
  };

  return (
    <div className="wings-gateway">
      {/* Hero Gateway Section - Full Viewport */}
      <section className="wings-gateway-hero relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 pointer-events-none" />
        
        <div className="container-custom relative z-10 w-full max-w-6xl">
          {/* Logo + Party Name */}
          <div className="text-center mb-16 panel-reveal panel-reveal-1">
            <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="PRNI"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-primary mb-2">
              {t("party.name.full")}
            </h2>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight">
              {t("wings.gateway.title")}
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              {t("wings.gateway.subtitle")}
            </p>
          </div>

          {/* Wings Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {wings.map((wing, index) => {
              const Icon = wing.icon;
              const isSelected = selectedPanel === wing.id;
              const isFading = selectedPanel && selectedPanel !== wing.id;
              
              return (
                <button
                  key={wing.id}
                  onClick={() => handlePanelClick(wing)}
                  disabled={wing.disabled || isNavigating}
                  className={cn(
                    "wing-panel rounded-2xl p-8 md:p-10 text-left",
                    "panel-reveal",
                    `panel-reveal-${index + 1}`,
                    wing.disabled && "wing-panel-disabled",
                    isSelected && "is-selected",
                    isFading && (index === 0 ? "is-fading-left" : index === 2 ? "is-fading-right" : "is-fading-left")
                  )}
                  aria-label={t(wing.titleKey)}
                >
                  {/* Gradient accent */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500",
                    "bg-gradient-to-br",
                    wing.accent,
                    !wing.disabled && "group-hover:opacity-100"
                  )} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
                      "bg-primary/10 transition-colors duration-300",
                      !wing.disabled && "group-hover:bg-primary/20"
                    )}>
                      <Icon className={cn(
                        "w-7 h-7",
                        wing.disabled ? "text-muted-foreground" : "text-primary"
                      )} />
                    </div>
                    
                    {/* Title */}
                    <h3 className={cn(
                      "panel-title text-2xl md:text-3xl font-heading font-bold mb-3",
                      wing.disabled && "text-muted-foreground"
                    )}>
                      {t(wing.titleKey)}
                    </h3>
                    
                    {/* Tagline */}
                    <p className="panel-description text-muted-foreground mb-6 min-h-[3rem]">
                      {t(wing.taglineKey)}
                    </p>
                    
                    {/* CTA */}
                    <div className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium",
                      wing.disabled 
                        ? "text-muted-foreground" 
                        : "text-primary"
                    )}>
                      <span>{t(wing.ctaKey)}</span>
                      {!wing.disabled && (
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scroll indicator */}
          <button 
            onClick={scrollToContent}
            className="mx-auto mt-16 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll to content"
          >
            <span className="text-xs uppercase tracking-wider">
              {t("common.readMore")}
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Content Section - Below Fold */}
      <section id="content-section" className="py-24 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            {/* Mission Summary */}
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">
              {t("mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              {t("mission.summary")}
            </p>
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/manifesto">{t("nav.manifesto")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">{t("nav.about")}</Link>
              </Button>
              <Button asChild>
                <Link href="/contact">
                  {t("nav.join")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News Teaser (minimal) */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Link 
              href="/announcements" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <span className="text-sm uppercase tracking-wider">
                {t("section.news")}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
