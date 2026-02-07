// file: components/global-backdrop.tsx
"use client";

import { cn } from "@/lib/utils";

interface GlobalBackdropProps {
  className?: string;
  variant?: "hero" | "section" | "full";
  showGrid?: boolean;
  showDots?: boolean;
  showNoise?: boolean;
  showFloatingDots?: boolean;
}

/**
 * GlobalBackdrop - A subtle decorative background for the International Wing page.
 * Features latitude/longitude-style grid lines, dot patterns, noise texture, and floating elements.
 * Uses CSS-only approach for performance.
 */
export function GlobalBackdrop({
  className,
  variant = "hero",
  showGrid = true,
  showDots = true,
  showNoise = true,
  showFloatingDots = false,
}: GlobalBackdropProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Base gradient layer - dark neutrals */}
      <div
        className={cn(
          "absolute inset-0",
          variant === "hero"
            ? "bg-gradient-to-br from-transparent via-white/[0.02] to-white/[0.04]"
            : variant === "full"
            ? "bg-gradient-to-b from-white/[0.01] via-white/[0.02] to-white/[0.01]"
            : "bg-gradient-to-b from-transparent via-white/[0.015] to-transparent"
        )}
      />

      {/* Radial highlight - gives depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "hero"
              ? "radial-gradient(ellipse 90% 60% at 50% 20%, rgba(255, 255, 255, 0.04), transparent 70%)"
              : "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255, 255, 255, 0.03), transparent 60%)",
        }}
      />

      {/* SVG Grid - Latitude/Longitude lines */}
      {showGrid && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Horizontal lines pattern (latitudes) */}
            <pattern
              id="int-lat-lines"
              patternUnits="userSpaceOnUse"
              width="100"
              height="50"
            >
              <line
                x1="0"
                y1="25"
                x2="100"
                y2="25"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-white"
              />
            </pattern>

            {/* Vertical lines pattern (longitudes) */}
            <pattern
              id="int-long-lines"
              patternUnits="userSpaceOnUse"
              width="60"
              height="100"
            >
              <line
                x1="30"
                y1="0"
                x2="30"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-white"
              />
            </pattern>
          </defs>

          {/* Apply patterns */}
          <rect width="100%" height="100%" fill="url(#int-lat-lines)" />
          <rect width="100%" height="100%" fill="url(#int-long-lines)" />
        </svg>
      )}

      {/* Dots pattern - world map abstraction */}
      {showDots && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.02]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="int-dots-pattern"
              patternUnits="userSpaceOnUse"
              width="20"
              height="20"
            >
              <circle
                cx="2"
                cy="2"
                r="0.8"
                fill="currentColor"
                className="text-white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#int-dots-pattern)" />
        </svg>
      )}

      {/* Noise texture overlay for tactile feel */}
      {showNoise && (
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Floating decorative dots - positioned absolutely */}
      {showFloatingDots && (
        <>
          <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-white/10" />
          <div className="absolute top-[25%] right-[15%] w-3 h-3 rounded-full bg-white/8" />
          <div className="absolute top-[45%] left-[5%] w-1.5 h-1.5 rounded-full bg-white/12" />
          <div className="absolute bottom-[30%] right-[8%] w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="absolute bottom-[20%] left-[20%] w-2 h-2 rounded-full bg-white/8" />
          <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 rounded-full bg-white/10" />
        </>
      )}

      {/* Subtle vignette - frames the content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.3) 100%)",
        }}
      />
    </div>
  );
}

/**
 * SectionDivider - A subtle gradient line to separate sections
 */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative h-px w-full max-w-5xl mx-auto", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.1) 80%, transparent 100%)",
        }}
      />
    </div>
  );
}

/**
 * FloatingAccent - Small decorative floating shape
 */
export function FloatingAccent({
  className,
  variant = "circle",
}: {
  className?: string;
  variant?: "circle" | "ring";
}) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        variant === "circle"
          ? "w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-transparent"
          : "w-40 h-40 rounded-full border border-white/5",
        className
      )}
      aria-hidden="true"
    />
  );
}
