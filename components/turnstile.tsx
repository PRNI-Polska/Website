// file: components/turnstile.tsx
// Cloudflare Turnstile CAPTCHA widget (privacy-friendly, free)
//
// Usage:
//   <Turnstile onVerify={(token) => setToken(token)} />
//
// The widget auto-renders and calls onVerify with a token string.
// Pass that token to your API route for server-side verification.

"use client";

import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  /** Reset trigger — change this value to force a widget reset. */
  resetKey?: number;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export function Turnstile({
  onVerify,
  onError,
  onExpire,
  resetKey,
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoaded = useRef(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (
      !window.turnstile ||
      !containerRef.current ||
      !siteKey ||
      widgetIdRef.current
    )
      return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerify(token),
      "error-callback": () => onError?.(),
      "expired-callback": () => onExpire?.(),
      theme: "auto",
      size: "normal",
    });
  }, [siteKey, onVerify, onError, onExpire]);

  // Render after script loads
  useEffect(() => {
    if (scriptLoaded.current && window.turnstile) {
      renderWidget();
    }
  }, [renderWidget]);

  // Handle reset
  useEffect(() => {
    if (
      resetKey !== undefined &&
      widgetIdRef.current &&
      window.turnstile
    ) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // If no site key configured, render nothing (graceful degradation)
  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
        strategy="lazyOnload"
        onReady={() => {
          scriptLoaded.current = true;
          // The global callback handles rendering
          window.onTurnstileLoad = () => {
            renderWidget();
          };
          // If turnstile is already available (cached script), render now
          if (window.turnstile) {
            renderWidget();
          }
        }}
      />
      <div ref={containerRef} className={className} />
    </>
  );
}
