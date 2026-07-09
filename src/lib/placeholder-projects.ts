import type { ProjectPreview } from "@/types/project";

/**
 * Projetos provisórios para estruturar o portfólio (FASE 5).
 * Serão substituídos pelos projetos reais da Sami via CMS (FASE 6/7).
 * Cidades de Lima refletem o mercado principal da cliente.
 */
export const placeholderProjects: ProjectPreview[] = [
  {
    slug: "interior-miraflores",
    category: "interior",
    city: "Miraflores",
    year: 2026,
    coverClass: "bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400",
  },
  {
    slug: "residencial-san-isidro",
    category: "residential",
    city: "San Isidro",
    year: 2025,
    coverClass: "bg-gradient-to-br from-zinc-200 via-zinc-300 to-stone-400",
  },
  {
    slug: "interior-barranco",
    category: "interior",
    city: "Barranco",
    year: 2025,
    coverClass: "bg-gradient-to-br from-neutral-200 via-stone-200 to-neutral-400",
  },
  {
    slug: "comercial-surco",
    category: "commercial",
    city: "Santiago de Surco",
    year: 2026,
    coverClass: "bg-gradient-to-br from-stone-300 via-neutral-300 to-zinc-400",
  },
  {
    slug: "conceito-lima",
    category: "concept",
    city: "Lima",
    year: 2024,
    coverClass: "bg-gradient-to-br from-neutral-300 via-stone-300 to-stone-500",
  },
  {
    slug: "exterior-la-molina",
    category: "exterior",
    city: "La Molina",
    year: 2025,
    coverClass: "bg-gradient-to-br from-zinc-300 via-stone-300 to-neutral-400",
  },
];
