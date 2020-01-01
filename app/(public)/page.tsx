// file: app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Wing panel data - Main in center, International left, Female right
const wings = [
  {
    id: "international",
    href: "/wings/international",
    titleKey: "wings.international.title",
    taglineKey: "wings.international.tagline",
    disabled: false,
    isMain: false,
  },
  {
    id: "main",
    href: "/wings/main",
    titleKey: "wings.main.title",
    taglineKey: "wings.main.tagline",
    disabled: false,
    isMain: true,
  },
  {
    id: "female",
    href: "/wings/female",
    titleKey: "wings.female.title",
    taglineKey: "wings.female.tagline",
    disabled: false, // ENABLED
    isMain: false,
  },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handlePanelClick = useCallback((wing: typeof wings[0], index: number) => {
    if (isNavigating || wing.disabled) return;
    
    setSelectedPanel(wing.id);
    setIsNavigating(true);
    
    setTimeout(() => {
      router.push(wing.href);
    }, 700);
  }, [router, isNavigating]);

  const scrollToContent = () => {
    document.getElementById("mission-section")?.scrollIntoView({ 
      behavior: "smooth" 
    });
  };

  const gatewayText = {
    eyebrow: t("party.name.full"),
    title: locale === "pl" ? "Skrzydła" : locale === "de" ? "Flügel" : "Wings",
    subtitle: locale === "pl" 
      ? "Trzy ramiona. Jeden ruch." 
      : locale === "de" 
      ? "Drei Arme. Eine Bewegung." 
      : "Three branches. One movement.",
    enter: locale === "pl" ? "Wejdź" : locale === "de" ? "Eintreten" : "Enter",
  };

  return (
    <div className="wings-gateway">
      {/* Hero Gateway Section */}
      <section className="wings-gateway-hero relative">
        {/* STAGE: Anchoring surface */}
        <div className="wings-stage">
          {/* Hero Header */}
          <header className="text-center mb-8">
            {/* Logo */}
            <div className="hero-reveal hero-reveal-1 mb-4">
              <div className="relative w-12 h-12 md:w-14 md:h-14 mx-auto">
                <Image
                  src="/logo.png"
                  alt="PRNI"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            {/* Eyebrow */}
            <p className="hero-reveal hero-reveal-2 text-[10px] md:text-[11px] font-medium tracking-[0.25em] uppercase text-foreground/55 mb-2">
              {gatewayText.eyebrow}
            </p>
            
            {/* H1: Wings */}
            <h1 className="hero-reveal hero-reveal-2 text-7xl md:text-8xl lg:text-[6.5rem] font-heading font-bold tracking-[0.025em] text-foreground mb-2">
              {gatewayText.title}
            </h1>
            
            {/* Subtitle */}
            <p className="hero-reveal hero-reveal-3 text-base md:text-lg text-foreground/68">
              {gatewayText.subtitle}
            </p>
          </header>

          {/* Wing Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-stretch">
            {wings.map((wing, index) => {
              const isSelected = selectedPanel === wing.id;
              const isFading = selectedPanel && selectedPanel !== wing.id;
              const isMainPanel = wing.isMain;
              
              return (
                <button
                  key={wing.id}
                  ref={(el) => { panelRefs.current[index] = el; }}
                  onClick={() => handlePanelClick(wing, index)}
                  disabled={isNavigating && !isSelected}
                  className={cn(
                    "wing-panel text-left flex flex-col",
                    `panel-entrance panel-entrance-${index + 1}`,
                    isMainPanel ? "md:col-span-6 wing-panel-main" : "md:col-span-3 wing-panel-side",
                    // Wing-specific backgrounds
                    wing.id === "international" && "wing-panel-international",
                    wing.id === "main" && "wing-panel-poland",
                    wing.id === "female" && "wing-panel-female",
                    isSelected && "is-selected",
                    isFading && (index === 0 ? "is-fading-left" : "is-fading-right")
                  )}
                  aria-label={t(wing.titleKey)}
                >
                  {/* Title */}
                  <h2 className={cn(
                    "wing-panel-title",
                    isMainPanel ? "text-xl md:text-2xl" : "text-lg md:text-xl"
                  )}>
                    {t(wing.titleKey)}
                  </h2>
                  
                  {/* Description */}
                  <p className={cn(
                    "wing-panel-desc",
                    isMainPanel ? "text-sm md:text-base" : "text-[13px] md:text-sm"
                  )}>
                    {t(wing.taglineKey)}
                  </p>
                  
                  {/* Spacer - pushes footer to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Divider */}
                  <div className="wing-panel-divider" />
                  
                  {/* Footer with CTA */}
                  <div className="wing-panel-footer">
                    <span className={cn(
                      "wing-panel-cta",
                      isMainPanel && "text-[15px]"
                    )}>
                      {gatewayText.enter}
                      <ArrowRight className="wing-panel-cta-arrow" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="scroll-indicator"
          aria-label={locale === "pl" ? "Przewiń w dół" : locale === "de" ? "Nach unten scrollen" : "Scroll down"}
        >
          <ChevronDown />
        </button>
      </section>

      {/* Mission Section */}
      <section id="mission-section" className="py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="reveal-section reveal-delay-1 text-2xl md:text-3xl font-heading font-semibold mb-5 text-foreground">
              {t("mission.title")}
            </h2>
            <p className="reveal-section reveal-delay-2 text-muted-foreground leading-relaxed mb-8">
              {t("mission.summary")}
            </p>
            
            <div className="reveal-section reveal-delay-3 flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" asChild className="hover-lift">
                <Link href="/manifesto">{t("nav.manifesto")}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hover-lift">
                <Link href="/about">{t("nav.about")}</Link>
              </Button>
              <Button size="sm" asChild className="hover-lift">
                <Link href="/contact">
                  {t("nav.join")}
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
