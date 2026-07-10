import type { Metadata } from "next";
import { AboutSection } from "@/components/about/about-section";
import { Hero } from "@/components/hero/hero";
import { PortfolioSection } from "@/components/portfolio/portfolio-section";
import { ServicesSection } from "@/components/services/services-section";
import { CTASection } from "@/components/shared/cta-section";
import { FAQSection } from "@/components/shared/faq-section";
import { ProcessSection } from "@/components/shared/process-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getFaqs, getPublishedProjects, getServices } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.home.title,
    description: dictionary.meta.home.description,
    locale,
    path: "/",
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const [projects, services, faqs] = await Promise.all([
    getPublishedProjects(locale, dictionary),
    getServices(locale, dictionary),
    getFaqs(locale, dictionary),
  ]);
  return (
    <main className="flex-1">
      <Hero />
      <AboutSection locale={locale} dictionary={dictionary} />
      <ServicesSection dictionary={dictionary} items={services} />
      <ProcessSection dictionary={dictionary} />
      <PortfolioSection locale={locale} dictionary={dictionary} projects={projects} />
      <FAQSection dictionary={dictionary} items={faqs} />
      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
