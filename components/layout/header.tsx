// file: components/layout/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Instagram, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";

const navigationKeys = [
  { key: "nav.home", href: "/" },
  { key: "nav.wings", href: "/wings" },
  { key: "nav.announcements", href: "/announcements" },
  { key: "nav.events", href: "/events" },
  { key: "nav.gallery", href: "/gallery" },
  { key: "nav.manifesto", href: "/manifesto" },
  { key: "nav.recruitment", href: "/recruitment" },
  { key: "nav.contact", href: "/contact" },
];

const INSTAGRAM_URL = "https://www.instagram.com/prni_official/";
const TELEGRAM_URL = "https://t.me/PRNIpolska";

function SocialIcons({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnClass =
    size === "sm"
      ? "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
      : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-white/5 transition-colors";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="PRNI on Instagram (@prni_official)"
        className={btnClass}
      >
        <Instagram className={iconClass} />
      </a>
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="PRNI on Telegram"
        className={btnClass}
      >
        <Send className={iconClass} />
      </a>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/95 backdrop-blur-sm">
      <nav
        className="container-custom flex h-16 items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        {/* Logo + social icons + party name (logo & name link to home; icons are separate) */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" aria-label="PRNI — Home" className="flex-shrink-0">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="PRNI Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <SocialIcons size="sm" />

          <Link href="/" className="hidden sm:flex flex-col leading-tight min-w-0">
            <span className="font-heading text-lg font-bold tracking-tight text-primary">
              PRNI
            </span>
            <span className="text-xs text-muted-foreground leading-tight truncate">
              {t("party.name.full")}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          {navigationKeys.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
          <div className="ml-2 pl-4 border-l flex items-center gap-3">
            <SocialIcons size="sm" />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile: Language + Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="container-custom py-4 space-y-2">
            {navigationKeys.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <div className="pt-3 border-t mt-3 flex items-center justify-center gap-3">
              <SocialIcons size="md" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
