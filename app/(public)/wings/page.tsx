// file: app/(public)/wings/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
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
    disabled: false,
    isMain: false,
  },
];

export default function WingsPage() {
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

  const gatewayText = {
    title: locale === "pl" ? "Skrzydła" : locale === "de" ? "Flügel" : "Wings",
    subtitle: locale === "pl" 
      ? "Trzy ramiona. Jeden ruch." 
      : locale === "de" 
      ? "Drei Arme. Eine Bewegung." 
      : "Three branches. One movement.",
    enter: locale === "pl" ? "Wejdź" : locale === "de" ? "Eintreten" : "Enter",
  };

  return (
    <div className="wings-page">
      <section className="wings-page-hero">
        <div className="wings-stage">
          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="hero-reveal hero-reveal-1 text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-[0.02em] text-foreground mb-3">
              {gatewayText.title}
            </h1>
            <p className="hero-reveal hero-reveal-2 text-lg md:text-xl text-foreground/65">
              {gatewayText.subtitle}
            </p>
          </header>

          {/* Wing Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-stretch">
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
                    isMainPanel ? "text-xl md:text-2xl" : "text-lg md:text-xl",
                    wing.id === "female" && "text-white drop-shadow-md"
                  )}>
                    {t(wing.titleKey)}
                  </h2>
                  
                  {/* Description */}
                  <p className={cn(
                    "wing-panel-desc",
                    isMainPanel ? "text-sm md:text-base" : "text-[13px] md:text-sm",
                    wing.id === "female" && "text-white/90 drop-shadow-sm"
                  )}>
                    {t(wing.taglineKey)}
                  </p>
                  
                  {/* Spacer */}
                  <div className="flex-grow" />
                  
                  {/* Divider */}
                  <div className={cn(
                    "wing-panel-divider",
                    wing.id === "female" && "bg-white/30"
                  )} />
                  
                  {/* Footer with CTA */}
                  <div className="wing-panel-footer">
                    <span className={cn(
                      "wing-panel-cta",
                      isMainPanel && "text-[15px]",
                      wing.id === "female" && "text-white"
                    )}>
                      {gatewayText.enter}
                      <ArrowRight className={cn(
                        "wing-panel-cta-arrow",
                        wing.id === "female" && "text-white"
                      )} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
