export const locales = ["pt-BR", "en", "es"] as const;

export type Locale = (typeof locales)[number];

/**
 * Espanhol é o idioma padrão: é o que atende quem chega sem uma preferência
 * reconhecível, e por isso ocupa as URLs sem prefixo.
 */
export const defaultLocale: Locale = "es";

/**
 * Guarda a escolha explícita de idioma. Sem ele, quem clicasse em "ES" seria
 * mandado de volta ao idioma do navegador no clique seguinte — a escolha da
 * pessoa tem de vencer a detecção automática.
 */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Monta um caminho respeitando a estratégia de URLs do projeto (Docs/13):
 * o idioma padrão fica sem prefixo (/sobre) e os demais são prefixados
 * (/pt-BR/sobre, /en/sobre).
 */
export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
