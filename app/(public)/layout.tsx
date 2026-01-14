// file: app/(public)/layout.tsx
"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { I18nProvider } from "@/lib/i18n";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
