/**
 * "Maquete Eletrônica" → "maquete-eletronica".
 *
 * Usado onde o endereço de uma página é derivado de um nome digitado
 * (serviços, categorias).
 */
export function slugify(value: string): string {
  return (
    value
      // NFD separa a letra do acento; o \p{Diacritic} descarta o acento solto,
      // e "Eletrônica" vira "Eletronica" em vez de "Eletr-nica".
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}
