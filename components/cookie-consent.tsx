// file: components/cookie-consent.tsx
// GDPR-compliant cookie consent banner.
//
// - Analytics tracking is blocked until the user explicitly accepts.
// - Consent preference is stored in localStorage (no cookie needed for this).
// - Users can change their preference at any time.
// - The banner uses a portal-free approach to avoid hydration issues.
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

export type ConsentStatus = "pending" | "accepted" | "rejected";

const CONSENT_KEY = "cookie_consent";

/** Read consent status from localStorage (safe for SSR). */
export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return "pending";
}

/** Check if analytics tracking is allowed. */
export function isAnalyticsAllowed(): boolean {
  return getConsentStatus() === "accepted";
}

export function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>("pending");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const current = getConsentStatus();
    setStatus(current);
    // Show banner only if the user hasn't made a choice yet
    if (current === "pending") {
      // Small delay so the page renders first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setStatus("accepted");
    setVisible(false);
  }, []);

  const handleReject = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setStatus("rejected");
    setVisible(false);
    // Remove any existing analytics session data
    try {
      sessionStorage.removeItem("analytics_session");
    } catch {
      // Ignore
    }
  }, []);

  if (status !== "pending" || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-fade-in"
    >
      <div className="mx-auto max-w-3xl rounded-xl border bg-card shadow-elevated p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-card-foreground leading-relaxed">
          <p className="font-medium mb-1">Polityka prywatności</p>
          <p className="text-muted-foreground">
            Ta strona wykorzystuje pliki cookie wyłącznie do celów analitycznych
            (anonimowe statystyki odwiedzin). Żadne dane osobowe nie są
            udostępniane podmiotom trzecim.{" "}
            <span className="hidden sm:inline">
              Możesz zmienić swoją decyzję w dowolnym momencie.
            </span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Odrzuć
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Akceptuję
          </Button>
        </div>
      </div>
    </div>
  );
}
