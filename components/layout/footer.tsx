// file: components/layout/footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";

const navigationKeys = [
  { key: "nav.home", href: "/" },
  { key: "nav.announcements", href: "/announcements" },
  { key: "nav.events", href: "/events" },
  { key: "nav.manifesto", href: "/manifesto" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, locale } = useI18n();

  return (
    <footer className="bg-white border-t" role="contentinfo">
      <div className="container-custom py-12">
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
                  {locale === "pl" 
                    ? "Polski Narodowy Ruch Integralistyczny" 
                    : "Polish National-Integralist Movement"}
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md">
              {locale === "pl"
                ? "Naród jako najwyższa wartość polityczna. Razem budujemy silną, zjednoczoną Polskę zakorzenioną w tradycji i tożsamości narodowej."
                : "The nation as the highest political value. Together we build a strong, unified Poland rooted in tradition and national identity."}
            </p>
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

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4">
              {t("footer.contact")}
            </h3>
            <address className="not-italic text-muted-foreground space-y-2">
              <p>
                <a href="mailto:kontakt@prni.pl" className="hover:text-primary transition-colors">
                  kontakt@prni.pl
                </a>
              </p>
            </address>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} PRNI - {locale === "pl" 
              ? "Polski Narodowy Ruch Integralistyczny" 
              : "Polish National-Integralist Movement"}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
