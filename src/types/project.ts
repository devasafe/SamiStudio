export type ProjectCategory = "residential" | "commercial" | "interior" | "exterior" | "concept";

/**
 * Prévia de projeto do portfólio.
 * Na FASE 6 estes dados virão do MongoDB (Docs/10 — collection Projects).
 */
export interface ProjectPreview {
  slug: string;
  category: ProjectCategory;
  city: string;
  year: number;
  /** Classes do bloco de capa até as imagens reais chegarem via CMS. */
  coverClass: string;
}
