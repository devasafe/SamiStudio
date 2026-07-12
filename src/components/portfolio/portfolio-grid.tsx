"use client";

import { useState } from "react";
import { PhotoMasonry } from "@/components/portfolio/photo-masonry";
import { useLanguage } from "@/components/providers/language-provider";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { MasonryPhoto, PortfolioItem } from "@/types/project";

interface PortfolioGridProps {
  projects: PortfolioItem[];
}

/** Portfólio como mosaico masonry: 1 capa por projeto, foto → projeto. */
export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const { locale, dictionary } = useLanguage();
  const [filter, setFilter] = useState<string>("all");

  const labels = [...new Set(projects.map((p) => p.categoryLabel).filter(Boolean))] as string[];
  const filtered = filter === "all" ? projects : projects.filter((p) => p.categoryLabel === filter);

  // Todo projeto entra: com capa vira foto, sem capa vira bloco placeholder
  // (mantém o fallback do CMS vazio em vez de deixar o mosaico em branco).
  const photos: MasonryPhoto[] = filtered.map((project) => ({
    url: project.coverImage ?? "",
    alt: project.title,
    href: localePath(locale, `/portfolio/${project.slug}`),
    placeholderClass: project.coverImage ? undefined : project.coverClass,
  }));

  const filterButton = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={cn(
        "text-small rounded-md border px-4 py-2 transition-colors",
        filter === value
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {filterButton("all", dictionary.portfolioPage.all)}
          {labels.map((label) => filterButton(label, label))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-body text-muted-foreground mt-16">{dictionary.portfolioPage.empty}</p>
      ) : (
        <div className="mt-12">
          <PhotoMasonry photos={photos} />
        </div>
      )}
    </div>
  );
}
