"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/portfolio/project-card";
import { useLanguage } from "@/components/providers/language-provider";
import type { PortfolioItem } from "@/types/project";
import { cn } from "@/lib/utils";

interface PortfolioGridProps {
  projects: PortfolioItem[];
}

/** Grid do portfólio com filtro pelas categorias presentes (Docs/03). */
export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const { locale, dictionary } = useLanguage();
  const [filter, setFilter] = useState<string>("all");

  const labels = [...new Set(projects.map((p) => p.categoryLabel).filter(Boolean))] as string[];
  const filtered = filter === "all" ? projects : projects.filter((p) => p.categoryLabel === filter);

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
        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
      )}
    </div>
  );
}
