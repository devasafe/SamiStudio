import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProjectCard } from "@/components/portfolio/project-card";
import { buttonVariants } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/typography";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { PortfolioItem } from "@/types/project";

interface PortfolioSectionProps {
  locale: Locale;
  dictionary: Dictionary;
  projects: PortfolioItem[];
}

/** Portfólio em destaque na home (Docs/03): provas de competência. */
export function PortfolioSection({ locale, dictionary, projects }: PortfolioSectionProps) {
  const portfolio = dictionary.sections.portfolio;

  return (
    <Section className="bg-surface">
      <Container>
        <SectionTitle
          eyebrow={portfolio.eyebrow}
          title={portfolio.title}
          subtitle={portfolio.subtitle}
        />
        <div className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              locale={locale}
              dictionary={dictionary}
            />
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Link
            href={localePath(locale, "/portfolio")}
            className={buttonVariants({ variant: "outline", size: "xl" })}
          >
            {portfolio.viewAll}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
