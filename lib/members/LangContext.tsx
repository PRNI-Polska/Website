"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type MemberLang, mt, type MemberTranslationKey } from "./i18n";

interface MemberLangContextType {
  lang: MemberLang;
  setLang: (lang: MemberLang) => void;
  t: (key: MemberTranslationKey) => string;
}

const MemberLangContext = createContext<MemberLangContextType>({
  lang: "pl",
  setLang: () => {},
  t: (key) => mt(key, "pl"),
});

export function MemberLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<MemberLang>("pl");

  useEffect(() => {
    const saved = localStorage.getItem("prni-member-lang") as MemberLang | null;
    if (saved && ["pl", "en", "de"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: MemberLang) => {
    setLangState(l);
    localStorage.setItem("prni-member-lang", l);
  }, []);

  const t = useCallback((key: MemberTranslationKey) => mt(key, lang), [lang]);

  return (
    <MemberLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </MemberLangContext.Provider>
  );
}

export function useMemberLang() {
  return useContext(MemberLangContext);
}
