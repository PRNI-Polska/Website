// file: components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAnalyticsAllowed } from "@/components/cookie-consent";

function generateSessionId(): string {
  // Generate a simple session ID that persists for the browser session
  let sessionId = sessionStorage.getItem("analytics_session");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("analytics_session", sessionId);
  }
  return sessionId;
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith("/admin")) return;

    // GDPR: Don't track if user hasn't consented
    if (!isAnalyticsAllowed()) return;

    const trackPageView = async () => {
      try {
        const sessionId = generateSessionId();
        
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            sessionId,
          }),
        });
      } catch (error) {
        // Silently fail - don't break the page for analytics
        console.debug("Analytics tracking failed:", error);
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}
