import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { CTASection } from "@/components/shared/cta-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getPublishedProjects } from "@/lib/content";
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
  const projects = await getPublishedProjects(locale, dictionary);
  const page = dictionary.portfolioPage;

  return (
    <main className="theme-portfolio-dark bg-background text-foreground flex-1 pt-22">
      <Container>
        {/* Hero: título à esquerda, texto de apoio à direita separado por um fio */}
        <section className="py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <p
                className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
                data-cms="text:portfolioPage.heroEyebrow"
              >
                <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
                {page.heroEyebrow}
              </p>
              <h1 className="font-heading mt-6 text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.02] tracking-tight text-balance">
                <span data-cms="text:portfolioPage.heroTitleLead">{page.heroTitleLead}</span>{" "}
                <span
                  className="text-[#cf5a18] italic"
                  data-cms="text:portfolioPage.heroTitleEmphasis"
                >
                  {page.heroTitleEmphasis}
                </span>
              </h1>
            </div>
            <div className="lg:border-l lg:border-[#f2ece0]/12 lg:pt-6 lg:pl-16">
              <p
                className="text-small max-w-sm leading-relaxed text-[#d8cdba]"
                data-cms="text:portfolioPage.heroText"
              >
                {page.heroText}
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-[#f2ece0]/10 pt-10 pb-20">
          <PortfolioGrid projects={projects} />
        </div>
      </Container>

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
