"use client";

import { useCallsLang } from "@/lib/calls/LangContext";
import type { Lang } from "@/lib/calls/i18n";

const langs: { code: Lang; label: string }[] = [
  { code: "pl", label: "PL" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

export function LangSwitcher() {
  const { lang, setLang } = useCallsLang();

  return (
    <div className="flex items-center gap-0 border border-[#252525] rounded overflow-hidden">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-1.5 text-xs font-semibold transition-all ${
            lang === l.code
              ? "bg-white text-black"
              : "text-neutral-600 hover:text-white hover:bg-[#151515]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
