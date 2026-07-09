export const locales = ["pt-BR", "en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Monta um caminho respeitando a estratégia de URLs do projeto (Docs/13):
 * pt-BR sem prefixo (/sobre) e demais idiomas prefixados (/en/sobre, /es/sobre).
 */
export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
