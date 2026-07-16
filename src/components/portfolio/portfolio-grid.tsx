"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/project";

interface PortfolioGridProps {
  projects: PortfolioItem[];
}

/** A lista já chega do mais recente para o mais antigo; "oldest" inverte. */
type SortOrder = "recent" | "oldest";

/** Alturas alternadas para dar ritmo ao mosaico (as capas não trazem dimensões). */
const ASPECTS = ["4/5", "16/11", "3/4", "16/10", "5/4", "4/5"];

/** Projetos por página — 3 fileiras cheias no desktop (3 colunas). */
const PAGE_SIZE = 9;

/**
 * Portfólio como mosaico de cartões: capa + legenda (título e categoria),
 * com filtro por categoria e ordenação. Cada cartão leva ao projeto.
 */
export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const { locale, dictionary } = useLanguage();
  const page = dictionary.portfolioPage;
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOrder>("recent");
  const [pageIndex, setPageIndex] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const labels = [...new Set(projects.map((p) => p.categoryLabel).filter(Boolean))] as string[];

  const visible = useMemo(() => {
    const list = filter === "all" ? projects : projects.filter((p) => p.categoryLabel === filter);
    return sort === "recent" ? list : [...list].reverse();
  }, [projects, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // Clamp defensivo: um filtro mais estreito pode deixar menos páginas.
  const current = Math.min(pageIndex, pageCount);
  const pageItems = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  /** Troca de página e volta ao topo da lista (salto direto: o Lenis cuida do resto). */
  function goToPage(next: number) {
    setPageIndex(Math.min(Math.max(next, 1), pageCount));
    topRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }

  // Sem categorias cadastradas, uma aba "Todos" sozinha não filtra nada:
  // a barra fica só com a ordenação.
  const tabs =
    labels.length > 0
      ? [{ value: "all", label: page.all }, ...labels.map((l) => ({ value: l, label: l }))]
      : [];

  return (
    <div>
      {/* Âncora do topo da lista (compensa o cabeçalho fixo) */}
      <div ref={topRef} className="scroll-mt-28" />

      {/* Filtros + ordenação */}
      <div className="flex flex-col gap-6 border-b border-[#f2ece0]/10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value);
                setPageIndex(1);
              }}
              aria-pressed={filter === value}
              className={cn(
                "text-caption -mb-px border-b-2 pb-4 tracking-[0.18em] uppercase transition-colors duration-300",
                filter === value
                  ? "border-[#cf5a18] text-[#cf5a18]"
                  : "border-transparent text-[#f2ece0]/55 hover:text-[#f2ece0]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mb-4 inline-flex shrink-0 items-center gap-2 border border-[#f2ece0]/15 px-4 py-3">
          <span className="sr-only">{page.sortLabel}</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortOrder);
              setPageIndex(1);
            }}
            className="text-caption cursor-pointer appearance-none bg-transparent tracking-[0.14em] text-[#f2ece0] outline-none"
          >
            <option value="recent" className="bg-[#141009]">
              {page.sortRecent}
            </option>
            <option value="oldest" className="bg-[#141009]">
              {page.sortOldest}
            </option>
          </select>
          <span className="text-[#f2ece0]/50" aria-hidden>
            ▾
          </span>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-small mt-16 text-[#d8cdba]">{page.empty}</p>
      ) : (
        <>
          <div className="mt-10 gap-4 sm:columns-2 lg:columns-3">
            {pageItems.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                aspect={ASPECTS[index % ASPECTS.length]}
                href={localePath(locale, `/portfolio/${project.slug}`)}
              />
            ))}
          </div>

          {pageCount > 1 ? (
            <nav
              aria-label={page.pageStatus
                .replace("{current}", String(current))
                .replace("{total}", String(pageCount))}
              className="mt-12 flex items-center justify-center gap-8 border-t border-[#f2ece0]/10 pt-10"
            >
              <PagerButton
                label={page.prevPage}
                disabled={current === 1}
                onClick={() => goToPage(current - 1)}
                icon="prev"
              />
              <p aria-live="polite" className="text-caption tracking-[0.18em] text-[#f2ece0]/55">
                <span className="text-[#cf5a18]">{String(current).padStart(2, "0")}</span>
                {" / "}
                {String(pageCount).padStart(2, "0")}
              </p>
              <PagerButton
                label={page.nextPage}
                disabled={current === pageCount}
                onClick={() => goToPage(current + 1)}
                icon="next"
              />
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

interface PagerButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  icon: "prev" | "next";
}

/** Botão de navegação entre páginas (o rótulo some no mobile, o ícone fica). */
function PagerButton({ label, disabled, onClick, icon }: PagerButtonProps) {
  const Icon = icon === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-caption group inline-flex items-center gap-3 border px-6 py-4 tracking-[0.18em] uppercase transition-colors duration-300",
        disabled
          ? "cursor-not-allowed border-[#f2ece0]/10 text-[#f2ece0]/25"
          : "border-[#cf5a18]/50 text-[#cf5a18] hover:bg-[#cf5a18] hover:text-[#0f0c09]"
      )}
    >
      {icon === "prev" ? (
        <Icon
          className="size-4 transition-transform duration-300 group-enabled:group-hover:-translate-x-1"
          aria-hidden
        />
      ) : null}
      <span className="max-sm:sr-only">{label}</span>
      {icon === "next" ? (
        <Icon
          className="size-4 transition-transform duration-300 group-enabled:group-hover:translate-x-1"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

interface ProjectCardProps {
  project: PortfolioItem;
  aspect: string;
  href: string;
}

/** Cartão do mosaico: capa (ou bloco neutro, quando não há capa) + legenda. */
function ProjectCard({ project, aspect, href }: ProjectCardProps) {
  const meta = [project.categoryLabel, project.city].filter(Boolean).join(" · ");

  return (
    <Link
      href={href}
      className="group mb-4 block break-inside-avoid border border-[#f2ece0]/10 transition-colors duration-300 hover:border-[#cf5a18]/40"
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className={cn("size-full", project.coverClass ?? "bg-[#221a13]")} />
        )}
      </div>

      <div className="flex items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading truncate text-xl leading-tight">{project.title}</h2>
          {meta ? <p className="text-caption mt-2 truncate text-[#d8cdba]/60">{meta}</p> : null}
        </div>
        <ArrowRight
          className="size-4 shrink-0 text-[#cf5a18] transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        />
      </div>
    </Link>
  );
}
