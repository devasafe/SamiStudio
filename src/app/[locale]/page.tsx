import type { Metadata } from "next";
import { AboutSection } from "@/components/about/about-section";
import { HomeExperience } from "@/components/home/home-experience";
import { LatestSection } from "@/components/home/latest-section";
import { ServicesSection } from "@/components/services/services-section";
import { CTASection } from "@/components/shared/cta-section";
import { FAQSection } from "@/components/shared/faq-section";
import { ProcessSection } from "@/components/shared/process-section";
import { TestimonialsSection } from "@/components/testimonials/testimonials-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getFaqs, getPublishedProjects, getServices, getTestimonials } from "@/lib/content";
import { safeImageUrl } from "@/lib/images";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/settings";

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
  const [projects, services, faqs, testimonials, settings] = await Promise.all([
    getPublishedProjects(locale, dictionary),
    getServices(locale, dictionary),
    getFaqs(locale, dictionary),
    getTestimonials(locale),
    getSiteSettings(),
  ]);
  return (
    <main className="flex-1">
      <HomeExperience>
        <LatestSection locale={locale} dictionary={dictionary} projects={projects} />
        <AboutSection
          locale={locale}
          dictionary={dictionary}
          photo={safeImageUrl(settings?.aboutPhoto)}
          overrides={{
            founder: settings?.founderName,
            role: settings?.founderRole,
            stats: [
              { value: settings?.stat1Value, label: settings?.stat1Label },
              { value: settings?.stat2Value, label: settings?.stat2Label },
              { value: settings?.stat3Value, label: settings?.stat3Label },
            ],
          }}
        />
        <ServicesSection locale={locale} dictionary={dictionary} items={services} />
        <ProcessSection dictionary={dictionary} />
        <TestimonialsSection dictionary={dictionary} items={testimonials} />
        <FAQSection locale={locale} dictionary={dictionary} items={faqs} />
        <CTASection locale={locale} dictionary={dictionary} />
      </HomeExperience>
    </main>
  );
}
