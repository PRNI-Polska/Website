// file: components/layout/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";

const navigationKeys = [
  { key: "nav.home", href: "/" },
  { key: "nav.wings", href: "/wings" },
  { key: "nav.announcements", href: "/announcements" },
  { key: "nav.events", href: "/events" },
  { key: "nav.manifesto", href: "/manifesto" },
  { key: "nav.merch", href: "/merch" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <nav className="container-custom flex h-20 items-center justify-between" aria-label="Main navigation">
        {/* Logo and Party Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="PRNI Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-heading text-lg font-bold tracking-tight text-primary">
              PRNI
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {t("party.name.full")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          {navigationKeys.map((item) => {
            const isActive = pathname === item.href || 
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
          <div className="ml-4 pl-4 border-l">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile: Language + Menu Button */}
        <div className="flex items-center gap-4 lg:hidden">
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
              const isActive = pathname === item.href || 
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
          </div>
        </div>
      )}
    </header>
  );
}
