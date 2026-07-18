/** Nome exibido quando as Configurações não trazem um (fallback). */
export const DEFAULT_SITE_NAME = "Sami da Silva Studio";

/**
 * Divide o nome do site na última palavra, para o efeito da marca: tudo menos a
 * última palavra fica na cor normal, e a última num tom mais claro (ex.: "Sami
 * da Silva **Studio**"). Nome de uma palavra só não tem parte destacada.
 */
export function splitSiteName(name: string): { lead: string; last: string | null } {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { lead: trimmed, last: null };
  }
  return { lead: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}
