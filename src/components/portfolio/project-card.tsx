import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ProjectPreview } from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectPreview;
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Card de projeto (Docs/05): imagem protagonista, pouco texto, hover sutil.
 * A capa é um bloco neutro até as imagens reais chegarem via CMS.
 */
export function ProjectCard({ project, locale, dictionary }: ProjectCardProps) {
  const title = `${dictionary.categories[project.category]} · ${project.city}`;

  return (
    <Link
      href={localePath(locale, `/portfolio/${project.slug}`)}
      className="group block"
      aria-label={title}
    >
      <div
        className={cn(
          "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:scale-[1.02]",
          project.coverClass
        )}
      >
        <span className="text-caption text-foreground/50 tracking-widest uppercase">
          {dictionary.sections.portfolio.comingSoon}
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-small font-medium">{title}</h3>
        <span className="text-caption text-muted-foreground">{project.year}</span>
      </div>
    </Link>
  );
}
