// file: components/layout/header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";

const navigationItems = [
  { key: "nav.manifesto", href: "/manifesto" },
  { key: "nav.about", href: "/about" },
  { 
    key: "nav.wings", 
    href: "#",
    children: [
      { key: "wings.main.title", href: "/wings/main" },
      { key: "wings.international.title", href: "/wings/international" },
      { key: "wings.female.title", href: "/wings/female" },
    ]
  },
  { key: "nav.announcements", href: "/announcements" },
  { key: "nav.contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wingsDropdownOpen, setWingsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, locale } = useI18n();

  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setWingsDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  // Dynamic header styles based on scroll and location
  const headerBg = isHomepage && !isScrolled && !mobileMenuOpen
    ? "bg-transparent border-b border-transparent"
    : "bg-background/95 backdrop-blur-sm border-b border-border/50";

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        headerBg
      )}
      style={{ 
        transition: 'background-color var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out), backdrop-filter var(--dur-2) var(--ease-out)' 
      }}
    >
      <nav className="container-custom flex h-14 md:h-16 items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="PRNI"
              fill
              className="object-contain"
              style={{ transition: 'transform var(--dur-2) var(--ease-out)' }}
              priority
            />
          </div>
          <span className={cn(
            "hidden sm:block font-heading text-sm md:text-base font-semibold tracking-tight",
            isHomepage && !isScrolled ? "text-foreground" : "text-foreground"
          )}>
            PRNI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-1">
          {navigationItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.key} className="relative">
                  <button
                    onClick={() => setWingsDropdownOpen(!wingsDropdownOpen)}
                    onBlur={() => setTimeout(() => setWingsDropdownOpen(false), 150)}
                    className={cn(
                      "relative flex items-center gap-1 px-3 py-1.5 text-sm",
                      "transition-colors",
                      "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-foreground/30",
                      "after:scale-x-0 after:transition-transform hover:after:scale-x-100",
                      pathname.startsWith("/wings") 
                        ? "text-foreground after:scale-x-100" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{ transitionDuration: 'var(--dur-1)', transitionTimingFunction: 'var(--ease-out)' }}
                    aria-expanded={wingsDropdownOpen}
                    aria-haspopup="true"
                  >
                    {t(item.key)}
                    <ChevronDown 
                      className={cn("w-3.5 h-3.5 transition-transform", wingsDropdownOpen && "rotate-180")}
                      style={{ transitionDuration: 'var(--dur-2)', transitionTimingFunction: 'var(--ease-out)' }}
                    />
                  </button>
                  
                  {wingsDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-48 bg-card rounded border border-border py-1 shadow-elevated animate-fade-in"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.key}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm transition-colors",
                            isActive(child.href) ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                          style={{ transitionDuration: 'var(--dur-1)', transitionTimingFunction: 'var(--ease-out)' }}
                        >
                          {t(child.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm transition-colors",
                  "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-foreground/30",
                  "after:scale-x-0 after:transition-transform hover:after:scale-x-100",
                  isActive(item.href) 
                    ? "text-foreground after:scale-x-100" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ transitionDuration: 'var(--dur-1)', transitionTimingFunction: 'var(--ease-out)' }}
              >
                {t(item.key)}
              </Link>
            );
          })}
          
          <div className="ml-3 pl-3 border-l border-border">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="h-8 w-8"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div 
        id="mobile-menu" 
        className={cn(
          "lg:hidden overflow-hidden bg-background border-t border-border",
          mobileMenuOpen ? "block" : "hidden"
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="container-custom py-3 space-y-1">
          {navigationItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.key} className="space-y-1">
                  <span className="block px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t(item.key)}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={cn(
                        "block px-3 py-2 pl-6 rounded text-sm transition-colors",
                        isActive(child.href) 
                          ? "bg-muted text-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(child.key)}
                    </Link>
                  ))}
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded text-sm transition-colors",
                  isActive(item.href) 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
