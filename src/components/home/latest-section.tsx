import { LatestCarousel } from "@/components/home/latest-carousel";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { MasonryPhoto, PortfolioItem } from "@/types/project";

interface LatestSectionProps {
  locale: Locale;
  dictionary: Dictionary;
  projects: PortfolioItem[];
}

/**
 * Faixa "trabalhos recentes" logo após a hero — full-bleed, sem molduras: uma
 * foto por projeto (capa) para que todos apareçam. Some quando não há fotos.
 */
export function LatestSection({ locale, dictionary, projects }: LatestSectionProps) {
  const photos: MasonryPhoto[] = projects.flatMap((project) => {
    const cover = project.gallery?.[0];
    return cover ? [{ ...cover, href: localePath(locale, `/portfolio/${project.slug}`) }] : [];
  });

  if (photos.length === 0) {
    return null;
  }

  return <LatestCarousel photos={photos} ctaLabel={dictionary.sections.latest.viewProject} />;
}
