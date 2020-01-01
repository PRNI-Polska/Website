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

// Minimal monochrome SVG icons with consistent stroke weight
const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Wing panel data
const wings = [
  {
    id: "main",
    href: "/wings/main",
    titleKey: "wings.main.title",
    taglineKey: "wings.main.tagline",
    Icon: ShieldIcon,
    disabled: false,
  },
  {
    id: "international",
    href: "/wings/international",
    titleKey: "wings.international.title",
    taglineKey: "wings.international.tagline",
    Icon: GlobeIcon,
    disabled: false,
  },
  {
    id: "female",
    href: "/wings/female",
    titleKey: "wings.female.title",
    taglineKey: "wings.female.tagline",
    Icon: UsersIcon,
    disabled: true,
  },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle panel click with takeover animation
  const handlePanelClick = useCallback((wing: typeof wings[0], index: number) => {
    if (isNavigating) return;
    
    if (wing.disabled) {
      // Show tooltip for disabled panel
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }
    
    setSelectedPanel(wing.id);
    setIsNavigating(true);
    
    // Navigate after transition completes
    setTimeout(() => {
      router.push(wing.href);
    }, 700); // matches --dur-3
  }, [router, isNavigating]);

  // Scroll to content below fold
  const scrollToContent = () => {
    document.getElementById("mission-section")?.scrollIntoView({ 
      behavior: "smooth" 
    });
  };

  // i18n for gateway text
  const gatewayText = {
    eyebrow: t("party.name.full"),
    title: locale === "pl" ? "Skrzydła" : locale === "de" ? "Flügel" : "Wings",
    subtitle: locale === "pl" 
      ? "Trzy ramiona. Jeden ruch." 
      : locale === "de" 
      ? "Drei Arme. Eine Bewegung." 
      : "Three branches. One movement.",
    enter: locale === "pl" ? "Wejdź" : locale === "de" ? "Eintreten" : "Enter",
    comingSoon: locale === "pl" ? "Wkrótce" : locale === "de" ? "Demnächst" : "Coming soon",
  };

  return (
    <div className="wings-gateway">
      {/* Hero Gateway Section */}
      <section className="wings-gateway-hero relative">
        <div className="w-full max-w-5xl mx-auto">
          {/* Hero Header */}
          <header className="text-center mb-16">
            {/* Logo */}
            <div className="hero-reveal hero-reveal-1 mb-8">
              <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto">
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
            <p className="hero-reveal hero-reveal-2 text-[10px] md:text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground mb-4">
              {gatewayText.eyebrow}
            </p>
            
            {/* H1: Wings */}
            <h1 className="hero-reveal hero-reveal-2 text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-foreground mb-4">
              {gatewayText.title}
            </h1>
            
            {/* Subtitle */}
            <p className="hero-reveal hero-reveal-3 text-base md:text-lg text-muted-foreground">
              {gatewayText.subtitle}
            </p>
          </header>

          {/* Wing Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {wings.map((wing, index) => {
              const isSelected = selectedPanel === wing.id;
              const isFading = selectedPanel && selectedPanel !== wing.id;
              const isDisabledPanel = wing.disabled;
              
              return (
                <button
                  key={wing.id}
                  ref={(el) => { panelRefs.current[index] = el; }}
                  onClick={() => handlePanelClick(wing, index)}
                  disabled={isNavigating && !isSelected}
                  className={cn(
                    "wing-panel text-left",
                    `panel-entrance panel-entrance-${index + 1}`,
                    isDisabledPanel && "wing-panel-disabled",
                    isSelected && "is-selected",
                    isFading && (index === 0 ? "is-fading-left" : "is-fading-right")
                  )}
                  aria-label={t(wing.titleKey)}
                  aria-disabled={isDisabledPanel}
                >
                  {/* Tooltip for disabled panel */}
                  {isDisabledPanel && showTooltip && (
                    <span className="wing-tooltip" role="tooltip">
                      {gatewayText.comingSoon}
                    </span>
                  )}
                  
                  {/* Icon */}
                  <wing.Icon className="wing-panel-icon" />
                  
                  {/* Title */}
                  <h2 className="wing-panel-title">
                    {t(wing.titleKey)}
                  </h2>
                  
                  {/* Description */}
                  <p className="wing-panel-desc">
                    {t(wing.taglineKey)}
                  </p>
                  
                  {/* CTA */}
                  <span className="wing-panel-cta">
                    {isDisabledPanel ? gatewayText.comingSoon : gatewayText.enter}
                    {!isDisabledPanel && <ArrowRight />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator - minimal, pinned to bottom */}
        <button 
          onClick={scrollToContent}
          className="scroll-indicator"
          aria-label={locale === "pl" ? "Przewiń w dół" : locale === "de" ? "Nach unten scrollen" : "Scroll down"}
        >
          <ChevronDown />
        </button>
      </section>

      {/* Mission Section - Below Fold */}
      <section id="mission-section" className="py-24 md:py-32">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="reveal-section reveal-delay-1 text-2xl md:text-3xl font-heading font-semibold mb-6 text-foreground">
              {t("mission.title")}
            </h2>
            <p className="reveal-section reveal-delay-2 text-muted-foreground leading-relaxed mb-10">
              {t("mission.summary")}
            </p>
            
            {/* Quick Links */}
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
