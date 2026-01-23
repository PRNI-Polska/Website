// file: app/(public)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { I18nProvider } from "@/lib/i18n";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { cn } from "@/lib/utils";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <I18nProvider>
      <AnalyticsTracker />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main 
          id="main-content" 
          className={cn(
            "flex-1",
            // Homepage (Wings Gateway) handles its own spacing
            // Other pages need top padding for fixed header
            !isHomepage && "pt-16 md:pt-20"
          )}
        >
          {children}
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
