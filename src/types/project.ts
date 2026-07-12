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

/** Foto para o mosaico masonry (portfólio e galerias). */
export interface MasonryPhoto {
  /** URL da imagem real; vazia quando é um bloco placeholder. */
  url: string;
  alt: string;
  width?: number;
  height?: number;
  /** Quando presente, a foto é um link (mosaico geral → projeto). */
  href?: string;
  /** Classes do bloco neutro quando não há imagem real (fallback do CMS vazio). */
  placeholderClass?: string;
}

/** Item de portfólio pronto para exibição (CMS ou placeholder). */
export interface PortfolioItem {
  slug: string;
  title: string;
  description?: string;
  client?: string;
  city?: string;
  year?: number;
  /** Imagem real (Cloudinary) quando cadastrada via CMS. */
  coverImage?: string;
  /** Bloco neutro de fallback (placeholders). */
  coverClass?: string;
  categoryLabel?: string;
  /** Galeria do projeto pronta para o masonry (vazia se não houver). */
  gallery?: MasonryPhoto[];
}
