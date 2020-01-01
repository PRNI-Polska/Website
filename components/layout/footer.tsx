// file: components/layout/footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { NewsletterSignup } from "@/components/newsletter-signup";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.78a8.16 8.16 0 0 0 4.77 1.53V6.86a4.85 4.85 0 0 1-1.84-.17Z" />
    </svg>
  );
}

const navigationKeys = [
  { key: "nav.home", href: "/" },
  { key: "nav.announcements", href: "/announcements" },
  { key: "nav.events", href: "/events" },
  { key: "nav.manifesto", href: "/manifesto" },
  { key: "nav.recruitment", href: "/recruitment" },
  { key: "nav.merch", href: "/merch" },
  { key: "nav.wings", href: "/wings" },
  { key: "nav.about", href: "/about" },
  { key: "nav.press", href: "/press" },
  { key: "nav.contact", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="bg-black border-t border-white/[0.06]" role="contentinfo">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="PRNI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold text-primary">
                  PRNI
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("party.name.full")}
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md">
              {t("footer.tagline")}
            </p>

            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.instagram.com/prni_official/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PRNI on Instagram (@prni_official)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@prni_official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PRNI on TikTok (@prni_official)"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold mb-4">
              {t("footer.quicklinks")}
            </h3>
            <ul className="space-y-2">
              {navigationKeys.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-heading font-semibold mb-4">
              {t("footer.contact")}
            </h3>
            <address className="not-italic text-muted-foreground space-y-2 mb-6">
              <p>
                <a href="mailto:prni.official@gmail.com" className="hover:text-primary transition-colors">
                  prni.official@gmail.com
                </a>
              </p>
            </address>
            <h3 className="font-heading font-semibold mb-3">
              Newsletter
            </h3>
            <NewsletterSignup />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/70">
            &copy; {currentYear} PRNI — {t("party.name.full")}. {t("footer.rights")}
          </p>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground/70 hover:text-primary transition-colors"
          >
            Polityka Prywatności
          </Link>
        </div>
      </div>
    </footer>
  );
}
