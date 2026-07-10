import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PortfolioItem } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: PortfolioItem;
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Card de projeto (Docs/05): imagem protagonista, pouco texto, hover sutil.
 * Sem imagem cadastrada, exibe o bloco neutro de placeholder.
 */
export function ProjectCard({ project, locale, dictionary }: ProjectCardProps) {
  return (
    <Link
      href={localePath(locale, `/portfolio/${project.slug}`)}
      className="group block"
      aria-label={project.title}
    >
      <div
        className={cn(
          "bg-muted relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:scale-[1.02]",
          project.coverClass
        )}
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="text-caption text-foreground/50 tracking-widest uppercase">
            {dictionary.sections.portfolio.comingSoon}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-small font-medium">{project.title}</h3>
        {project.year ? (
          <span className="text-caption text-muted-foreground">{project.year}</span>
        ) : null}
      </div>
    </Link>
  );
}
