import { LOCALE_COOKIE } from "@/i18n/config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Grava a escolha explícita de idioma.
 *
 * O idioma padrão mora na URL sem prefixo, e é ali que o proxy negocia pelo
 * Accept-Language. Sem este registro, escolher "ES" num navegador em português
 * não pegaria: o clique seguinte devolveria a pessoa ao português. O cookie é
 * o que dá à escolha da pessoa precedência sobre a detecção automática.
 */
export function rememberLocale(locale: string): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
