import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";

/**
 * Escolhe o idioma de quem chega sem prefixo na URL.
 *
 * A escolha explícita (cookie) vence a detecção: quem clicou em "ES" não pode
 * ser arrastado de volta ao idioma do navegador na navegação seguinte.
 * Sem cookie, vale o Accept-Language; sem nada reconhecível, o padrão.
 */
export function negotiateLocale(acceptLanguage: string | null, cookie?: string | null): Locale {
  if (cookie && isLocale(cookie)) {
    return cookie;
  }
  return parseAcceptLanguage(acceptLanguage) ?? defaultLocale;
}

/**
 * Lê o Accept-Language e devolve o primeiro idioma que o site fala, ou null.
 *
 * O header vem como "pt-BR,pt;q=0.9,en;q=0.8": tags por ordem de preferência,
 * com peso q opcional (1 quando ausente). Uma tag casa por igualdade ("pt-BR")
 * ou pelo idioma base — "es-PE" e "es-419" atendem por "es", que é o ponto:
 * o público hispanofalante chega com dezenas de variantes regionais.
 */
function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header) {
    return null;
  }

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((param) => param.trim().match(/^q=([\d.]+)$/)?.[1])
        .find((value) => value !== undefined);
      // q inválido é o mesmo que ausente: o header é entrada de terceiro.
      const weight = q === undefined ? 1 : Number.parseFloat(q);
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 1 };
    })
    // q=0 significa "não quero este idioma", não "peso baixo".
    .filter((entry) => entry.tag.length > 0 && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of ranked) {
    const match = locales.find(
      (locale) => locale.toLowerCase() === tag || baseLanguage(locale) === baseLanguage(tag)
    );
    if (match) {
      return match;
    }
  }
  return null;
}

/** "pt-BR" -> "pt"; "es-419" -> "es". */
function baseLanguage(tag: string): string {
  return tag.toLowerCase().split("-")[0] ?? tag;
}
