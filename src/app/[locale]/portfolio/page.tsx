import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { CTASection } from "@/components/shared/cta-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getFeaturedProjects, getPublishedProjects } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/settings";

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

// Valor do painel quando preenchido; senão, o do dicionário (mesmo padrão da página Sobre).
const pick = (custom: string | undefined, fallback: string) =>
  custom && custom.trim() ? custom : fallback;

export default async function PortfolioPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const [projects, featured, settings] = await Promise.all([
    getPublishedProjects(locale, dictionary),
    getFeaturedProjects(locale, dictionary),
    getSiteSettings(),
  ]);
  const page = dictionary.portfolioPage;

  const statValues = [
    settings?.portfolioStat1Value,
    settings?.portfolioStat2Value,
    settings?.portfolioStat3Value,
    settings?.portfolioStat4Value,
    settings?.portfolioStat5Value,
  ];
  const statLabels = [
    settings?.portfolioStat1Label,
    settings?.portfolioStat2Label,
    settings?.portfolioStat3Label,
    settings?.portfolioStat4Label,
    settings?.portfolioStat5Label,
  ];
  const stats = page.stats.map((stat, index) => ({
    value: pick(statValues[index], stat.value),
    label: pick(statLabels[index], stat.label),
  }));

  return (
    <main className="theme-dark-warm bg-background text-foreground flex-1 pt-22">
      <PortfolioHero items={featured} />

      <Container>
        <div className="border-t border-[#f2ece0]/10 pt-10 pb-20">
          <PortfolioGrid projects={projects} />
        </div>
      </Container>

      <PortfolioStats eyebrow={page.statsEyebrow} stats={stats} />

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
