// file: components/global-backdrop.tsx
"use client";

import { cn } from "@/lib/utils";

interface GlobalBackdropProps {
  className?: string;
  variant?: "hero" | "section";
  showGrid?: boolean;
  showDots?: boolean;
}

/**
 * GlobalBackdrop - A subtle decorative background for the International Wing page.
 * Features latitude/longitude-style grid lines and dot patterns.
 * Uses CSS-only approach for performance.
 */
export function GlobalBackdrop({
  className,
  variant = "hero",
  showGrid = true,
  showDots = true,
}: GlobalBackdropProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Base gradient layer - cool neutrals with hint of blue */}
      <div
        className={cn(
          "absolute inset-0",
          variant === "hero"
            ? "bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100/50"
            : "bg-gradient-to-b from-transparent via-blue-50/20 to-transparent"
        )}
      />

      {/* Radial highlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "hero"
              ? "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(147, 197, 253, 0.15), transparent 70%)"
              : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(147, 197, 253, 0.08), transparent 60%)",
        }}
      />

      {/* SVG Grid - Latitude/Longitude lines */}
      {showGrid && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Horizontal lines pattern (latitudes) */}
            <pattern
              id="lat-lines"
              patternUnits="userSpaceOnUse"
              width="100"
              height="60"
            >
              <line
                x1="0"
                y1="30"
                x2="100"
                y2="30"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-600"
              />
            </pattern>

            {/* Vertical curved lines pattern (longitudes) - simplified as straight for performance */}
            <pattern
              id="long-lines"
              patternUnits="userSpaceOnUse"
              width="80"
              height="100"
            >
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-600"
              />
            </pattern>
          </defs>

          {/* Apply patterns */}
          <rect width="100%" height="100%" fill="url(#lat-lines)" />
          <rect width="100%" height="100%" fill="url(#long-lines)" />
        </svg>
      )}

      {/* Dots pattern - world map abstraction */}
      {showDots && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots-pattern"
              patternUnits="userSpaceOnUse"
              width="24"
              height="24"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                fill="currentColor"
                className="text-slate-700"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots-pattern)" />
        </svg>
      )}

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(241, 245, 249, 0.5) 100%)",
        }}
      />
    </div>
  );
}

/**
 * GlobeIcon - A subtle decorative globe element
 */
export function GlobeDecoration({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-16 h-16 md:w-20 md:h-20 opacity-60",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-blue-600/20"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      >
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" />
        
        {/* Equator */}
        <ellipse cx="50" cy="50" rx="45" ry="18" />
        
        {/* Longitude lines */}
        <ellipse cx="50" cy="50" rx="18" ry="45" />
        <ellipse cx="50" cy="50" rx="35" ry="45" />
        
        {/* Latitude lines */}
        <ellipse cx="50" cy="30" rx="38" ry="12" />
        <ellipse cx="50" cy="70" rx="38" ry="12" />
      </svg>
    </div>
  );
}
