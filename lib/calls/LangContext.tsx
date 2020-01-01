"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Lang, t as translate, type TranslationKey } from "./i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "pl",
  setLang: () => {},
  t: (key) => translate(key, "pl"),
});

export function CallsLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pl");

  useEffect(() => {
    const saved = localStorage.getItem("prni-calls-lang") as Lang | null;
    if (saved && ["pl", "en", "de"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("prni-calls-lang", l);
  }, []);

  const tFn = useCallback((key: TranslationKey) => translate(key, lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LangContext.Provider>
  );
}

export function useCallsLang() {
  return useContext(LangContext);
}
