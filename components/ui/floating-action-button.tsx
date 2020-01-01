// components/ui/floating-action-button.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { locale } = useI18n();

  useEffect(() => {
    // Show FAB after user scrolls down a bit
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Also show after 3 seconds even without scroll
    const timer = setTimeout(() => setIsVisible(true), 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (isDismissed || !isVisible) return null;

  const labels = {
    pl: "Dołącz do nas",
    en: "Join us",
    de: "Mitmachen",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip */}
      <div className="animate-fade-in bg-white dark:bg-gray-900 rounded-lg shadow-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
        <span>{labels[locale]}</span>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={locale === "pl" ? "Zamknij" : locale === "de" ? "Schließen" : "Close"}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* FAB Button */}
      <Link
        href="/contact"
        className="fab"
        aria-label={labels[locale]}
      >
        <UserPlus className="h-6 w-6" />
      </Link>
    </div>
  );
}
