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

// Navigation structure
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

  // Check if we're on the homepage (Wings Gateway)
  const isHomepage = pathname === "/";

  // Handle scroll for transparent -> solid header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setWingsDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isHomepage && !isScrolled && !mobileMenuOpen
          ? "bg-transparent border-transparent"
          : "bg-white/95 backdrop-blur-sm border-b border-border"
      )}
    >
      <nav className="container-custom flex h-16 md:h-20 items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="PRNI"
              fill
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-heading text-base md:text-lg font-bold tracking-tight text-primary">
              PRNI
            </span>
            <span className={cn(
              "text-[10px] md:text-xs leading-tight transition-colors",
              isHomepage && !isScrolled 
                ? "text-foreground/70" 
                : "text-muted-foreground"
            )}>
              {locale === "pl" 
                ? "Polski Ruch Narodowo-Integralistyczny" 
                : locale === "de"
                ? "Polnische N.I. Bewegung"
                : "Polish N.I. Movement"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-1">
          {navigationItems.map((item) => {
            // Wings dropdown
            if (item.children) {
              return (
                <div key={item.key} className="relative">
                  <button
                    onClick={() => setWingsDropdownOpen(!wingsDropdownOpen)}
                    onBlur={() => setTimeout(() => setWingsDropdownOpen(false), 150)}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      pathname.startsWith("/wings") 
                        ? "text-primary" 
                        : isHomepage && !isScrolled 
                          ? "text-foreground/80 hover:text-foreground" 
                          : "text-muted-foreground"
                    )}
                    aria-expanded={wingsDropdownOpen}
                    aria-haspopup="true"
                  >
                    {t(item.key)}
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      wingsDropdownOpen && "rotate-180"
                    )} />
                  </button>
                  
                  {/* Dropdown */}
                  {wingsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.key}
                          href={child.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive(child.href) ? "text-primary font-medium" : "text-muted-foreground"
                          )}
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
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href) 
                    ? "text-primary" 
                    : isHomepage && !isScrolled 
                      ? "text-foreground/80 hover:text-foreground" 
                      : "text-muted-foreground"
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
          
          {/* Language Switcher */}
          <div className="ml-4 pl-4 border-l border-border">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile: Language + Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={cn(
              isHomepage && !isScrolled && !mobileMenuOpen && "text-foreground/80"
            )}
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
      <div 
        id="mobile-menu" 
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-out",
          mobileMenuOpen ? "max-h-[500px] border-t" : "max-h-0"
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="container-custom py-4 space-y-1 bg-white">
          {navigationItems.map((item) => {
            // Wings with children (expanded in mobile)
            if (item.children) {
              return (
                <div key={item.key} className="space-y-1">
                  <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(item.key)}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={cn(
                        "block px-3 py-2 pl-6 rounded-md text-sm font-medium transition-colors",
                        isActive(child.href) 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  isActive(item.href) 
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
    </header>
  );
}
