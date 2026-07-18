import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { CTASection } from "@/components/shared/cta-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getFeaturedProjects, getPublishedProjects } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.portfolio.title,
    description: dictionary.meta.portfolio.description,
    locale,
    path: "/portfolio",
  });
}

export default async function PortfolioPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const [projects, featured] = await Promise.all([
    getPublishedProjects(locale, dictionary),
    getFeaturedProjects(locale, dictionary),
  ]);
  const page = dictionary.portfolioPage;

  return (
    <main className="theme-dark-warm bg-background text-foreground flex-1 pt-22">
      <PortfolioHero items={featured} />

      <Container>
        <div className="border-t border-[#f2ece0]/10 pt-10 pb-20">
          <PortfolioGrid projects={projects} />
        </div>
      </Container>

      <PortfolioStats eyebrow={page.statsEyebrow} stats={page.stats} />

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
