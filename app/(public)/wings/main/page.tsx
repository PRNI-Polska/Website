// file: app/(public)/wings/main/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

// Minimal icons
const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const StructureIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlatformIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

export default function MainWingPage() {
  const { t, locale } = useI18n();

  const responsibilities = [
    { key: "wings.main.responsibilities.1", Icon: PlatformIcon },
    { key: "wings.main.responsibilities.2", Icon: StructureIcon },
    { key: "wings.main.responsibilities.3", Icon: UsersIcon },
    { key: "wings.main.responsibilities.4", Icon: CalendarIcon },
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
            {t("wings.main.title")}
          </h1>
          <p className="reveal-section reveal-delay-3 text-lg text-muted-foreground">
            {t("wings.main.tagline")}
          </p>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-16 border-t border-border">
        <div className="container-custom max-w-3xl">
          <h2 className="reveal-section reveal-delay-1 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-4">
            {t("wings.main.purpose.title")}
          </h2>
          <p className="reveal-section reveal-delay-2 text-lg text-foreground leading-relaxed">
            {t("wings.main.purpose.text")}
          </p>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-16 border-t border-border">
        <div className="container-custom max-w-3xl">
          <h2 className="reveal-section reveal-delay-1 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-8">
            {t("wings.main.responsibilities.title")}
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
            {t("wings.main.engage.title")}
          </h2>
          <p className="reveal-section reveal-delay-2 text-lg text-foreground mb-8">
            {t("wings.main.engage.text")}
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
