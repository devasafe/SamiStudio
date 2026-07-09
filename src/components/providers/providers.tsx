"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageProvider } from "./language-provider";

interface ProvidersProps {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}

/**
 * Composição central de providers da aplicação.
 * Novos providers (Theme, Analytics, ...) devem ser adicionados aqui.
 */
export function Providers({ locale, dictionary, children }: ProvidersProps) {
  return (
    <LanguageProvider locale={locale} dictionary={dictionary}>
      {children}
    </LanguageProvider>
  );
}
