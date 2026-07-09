"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/portfolio/project-card";
import { useLanguage } from "@/components/providers/language-provider";
import type { ProjectCategory, ProjectPreview } from "@/types/project";
import { cn } from "@/lib/utils";

type Filter = ProjectCategory | "all";

interface PortfolioGridProps {
  projects: ProjectPreview[];
}

/** Grid do portfólio com filtro por categoria (Docs/03). */
export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const { locale, dictionary } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const categories = Object.keys(dictionary.categories) as ProjectCategory[];
  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const filterButton = (value: Filter, label: string) => (
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
      <div className="flex flex-wrap gap-3">
        {filterButton("all", dictionary.portfolioPage.all)}
        {categories.map((category) => filterButton(category, dictionary.categories[category]))}
      </div>

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
