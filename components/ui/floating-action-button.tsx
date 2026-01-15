// components/ui/floating-action-button.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false);
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

  if (!isVisible) return null;

  const labels = {
    pl: "Dołącz do nas",
    en: "Join us",
    de: "Mitmachen",
  };

  return (
    <Link
      href="/contact"
      className="fab fixed bottom-6 right-6 z-50"
      aria-label={labels[locale]}
    >
      <UserPlus className="h-6 w-6" />
    </Link>
  );
}
