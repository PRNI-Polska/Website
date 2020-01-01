"use client";

import { CallsLangProvider } from "@/lib/calls/LangContext";

export default function CallsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CallsLangProvider>
      <div className="min-h-screen bg-[#090909] text-[#e8e8e8] antialiased font-[var(--font-sans)]">
        {children}
      </div>
    </CallsLangProvider>
  );
}
