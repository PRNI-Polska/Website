// components/ui/animated-section.tsx
"use client";

import { useScrollAnimation } from "@/lib/use-scroll-animation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade" | "scale" | "slide-left" | "slide-right";
  threshold?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  animation = "fade-up",
  threshold = 0.1,
}: AnimatedSectionProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold });

  const animationStyles: Record<string, { initial: string; visible: string }> = {
    "fade-up": {
      initial: "opacity-0 translate-y-8",
      visible: "opacity-100 translate-y-0",
    },
    fade: {
      initial: "opacity-0",
      visible: "opacity-100",
    },
    scale: {
      initial: "opacity-0 scale-95",
      visible: "opacity-100 scale-100",
    },
    "slide-left": {
      initial: "opacity-0 -translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    "slide-right": {
      initial: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
  };

  const style = animationStyles[animation];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? style.visible : style.initial,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Staggered children animation
interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredContainer({
  children,
  className,
  staggerDelay = 100,
}: StaggeredContainerProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 });

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                "transition-all duration-500 ease-out",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: isVisible ? `${index * staggerDelay}ms` : "0ms" }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
