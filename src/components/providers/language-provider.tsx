"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface LanguageContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}

export function LanguageProvider({ locale, dictionary, children }: LanguageProviderProps) {
  return (
    <LanguageContext.Provider value={{ locale, dictionary }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider.");
  }
  return context;
}

export function useLocale(): Locale {
  return useLanguage().locale;
}

export function useDictionary(): Dictionary {
  return useLanguage().dictionary;
}
