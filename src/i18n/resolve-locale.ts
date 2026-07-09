import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./get-dictionary";

interface ResolvedLocale {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Valida o segmento [locale] vindo dos params e carrega o dicionário.
 * Locales desconhecidos resultam em 404.
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<ResolvedLocale> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return { locale, dictionary: await getDictionary(locale) };
}
