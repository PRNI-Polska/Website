// file: app/(public)/wings/international/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

// Minimal icons
const TranslateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l6 6" />
    <path d="M4 14l6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2v3" />
    <path d="M22 22l-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
);

const HandshakeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
);

const NewspaperIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function InternationalWingPage() {
  const { t, locale } = useI18n();

  const responsibilities = [
    { key: "wings.international.responsibilities.1", Icon: TranslateIcon },
    { key: "wings.international.responsibilities.2", Icon: HandshakeIcon },
    { key: "wings.international.responsibilities.3", Icon: NewspaperIcon },
    { key: "wings.international.responsibilities.4", Icon: GlobeIcon },
  ];

  const backText = locale === "pl" ? "Powrót" : locale === "de" ? "Zurück" : "Back";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container-custom max-w-3xl">
          {/* Back */}
          <Link 
            href="/"
            className="reveal-section reveal-delay-1 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" style={{ transitionDuration: 'var(--dur-2)', transitionTimingFunction: 'var(--ease-out)' }} />
            {backText}
          </Link>

          <h1 className="reveal-section reveal-delay-2 text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground mb-4">
            {t("wings.international.title")}
          </h1>
          <p className="reveal-section reveal-delay-3 text-lg text-muted-foreground">
            {t("wings.international.tagline")}
          </p>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-16 border-t border-border">
        <div className="container-custom max-w-3xl">
          <h2 className="reveal-section reveal-delay-1 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
            {t("wings.international.purpose.title")}
          </h2>
          <p className="reveal-section reveal-delay-2 text-lg text-foreground leading-relaxed">
            {t("wings.international.purpose.text")}
          </p>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-16 border-t border-border">
        <div className="container-custom max-w-3xl">
          <h2 className="reveal-section reveal-delay-1 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-8">
            {t("wings.international.responsibilities.title")}
          </h2>
          <ul className="space-y-4">
            {responsibilities.map((item, index) => (
              <li 
                key={item.key}
                className="reveal-section flex items-start gap-4"
                style={{ animationDelay: `${(index + 1) * 80}ms` }}
              >
                <item.Icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{t(item.key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Engage */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="container-custom max-w-3xl">
          <h2 className="reveal-section reveal-delay-1 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
            {t("wings.international.engage.title")}
          </h2>
          <p className="reveal-section reveal-delay-2 text-lg text-foreground mb-8">
            {t("wings.international.engage.text")}
          </p>
          <div className="reveal-section reveal-delay-3 flex flex-wrap gap-3">
            <Button asChild className="hover-lift">
              <Link href="/contact">
                {t("wings.joinCta")}
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="hover-lift">
              <Link href="/contact">{t("wings.contactCta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
