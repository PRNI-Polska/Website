// file: app/(public)/wings/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
      ? "Dwa ramiona. Jeden ruch." 
      : locale === "de" 
      ? "Zwei Arme. Eine Bewegung." 
      : "Two branches. One movement.",
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
                    isMainPanel ? "md:col-span-7 wing-panel-main" : "md:col-span-5 wing-panel-side",
                    wing.id === "international" && "wing-panel-international",
                    wing.id === "main" && "wing-panel-poland",
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
                  
                  <p className={cn(
                    "wing-panel-desc",
                    isMainPanel ? "text-sm md:text-base" : "text-[13px] md:text-sm"
                  )}>
                    {t(wing.taglineKey)}
                  </p>
                  
                  <div className="flex-grow" />
                  
                  <div className="wing-panel-divider" />
                  
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
      </section>
    </div>
  );
}
