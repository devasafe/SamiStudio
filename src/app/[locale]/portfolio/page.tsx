import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { CTASection } from "@/components/shared/cta-section";
import { Heading, Paragraph } from "@/components/ui/typography";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { placeholderProjects } from "@/lib/placeholder-projects";

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
  const portfolio = dictionary.sections.portfolio;

  return (
    <main className="flex-1 pt-22">
      <Section>
        <Container>
          <Heading level={1}>{dictionary.meta.portfolio.title}</Heading>
          <Paragraph size="lg" className="mt-6 max-w-2xl">
            {portfolio.subtitle}
          </Paragraph>
          <div className="mt-16">
            <PortfolioGrid projects={placeholderProjects} />
          </div>
        </Container>
      </Section>
      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
