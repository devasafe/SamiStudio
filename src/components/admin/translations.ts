/**
 * Traduções (en/es) de uma entidade CRUD, como o admin as edita e a API as
 * recebe. O pt-BR é o campo base do documento; en/es vivem em `translations`.
 */
export interface Translations {
  en: Record<string, string>;
  es: Record<string, string>;
}

/** Idiomas mostrados no formulário, na ordem e rótulos do editor visual. */
export const TRANSLATABLE_LANGS = [
  { code: "pt-BR", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

export type Lang = (typeof TRANSLATABLE_LANGS)[number]["code"];

export const EMPTY_TRANSLATIONS: Translations = { en: {}, es: {} };

/** Remove espaços e descarta campos vazios de um idioma. */
function cleanLocale(fields: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    const trimmed = value.trim();
    if (trimmed) {
      out[key] = trimmed;
    }
  }
  return out;
}

/**
 * Prepara `translations` para o payload da API: descarta campos vazios e omite
 * um idioma inteiro se ele não tiver nenhuma tradução. Sem nenhuma tradução,
 * devolve `undefined` — não sujar o banco com `{ en: {}, es: {} }` (a leitura
 * do site já cai no pt-BR quando a tradução falta).
 */
export function translationsPayload(
  translations: Translations
): Record<string, Record<string, string>> | undefined {
  const result: Record<string, Record<string, string>> = {};
  const en = cleanLocale(translations.en);
  const es = cleanLocale(translations.es);
  if (Object.keys(en).length > 0) {
    result.en = en;
  }
  if (Object.keys(es).length > 0) {
    result.es = es;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
