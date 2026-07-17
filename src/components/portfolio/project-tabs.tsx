"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ProjectTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface ProjectTabsProps {
  tabs: ProjectTab[];
}

/**
 * Abas do projeto. Quem monta decide quais existem: um projeto sem galeria não
 * ganha a aba de imagens, e sem checkpoint não ganha a de antes e depois —
 * aba que abre vazia é pior do que aba nenhuma.
 */
export function ProjectTabs({ tabs }: ProjectTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-8 border-b border-[#f2ece0]/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tab.id === current.id}
            aria-controls={`painel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={cn(
              "text-caption -mb-px border-b-2 pb-4 tracking-[0.18em] uppercase transition-colors",
              tab.id === current.id
                ? "border-[#cf5a18] text-[#cf5a18]"
                : "border-transparent text-[#f2ece0]/55 hover:text-[#f2ece0]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`painel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="mt-8"
      >
        {current.content}
      </div>
    </div>
  );
}
