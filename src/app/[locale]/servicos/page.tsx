import type { Metadata } from "next";
import { Box, Building2, Camera, PencilRuler, Sparkles } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CTASection } from "@/components/shared/cta-section";
import { Heading, Paragraph } from "@/components/ui/typography";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildPageMetadata } from "@/lib/metadata";

const serviceIcons = [Box, Camera, Building2, PencilRuler, Sparkles];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.services.title,
    description: dictionary.meta.services.description,
    locale,
    path: "/servicos",
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const services = dictionary.sections.services;

  return (
    <main className="flex-1 pt-22">
      <Section>
        <Container>
          <Heading level={1} className="max-w-3xl">
            {services.title}
          </Heading>
          <Paragraph size="lg" className="mt-6 max-w-2xl">
            {services.subtitle}
          </Paragraph>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <div className="divide-border divide-y">
            {services.items.map((service, index) => {
              const Icon = serviceIcons[index] ?? Box;
              return (
                <article
                  key={service.title}
                  className="grid gap-6 py-12 first:pt-0 last:pb-0 md:grid-cols-[auto_1fr] md:gap-12"
                >
                  <Icon className="text-foreground size-8" strokeWidth={1.5} aria-hidden />
                  <div>
                    <h2 className="text-h3 font-heading">{service.title}</h2>
                    <p className="text-body text-muted-foreground mt-4 max-w-2xl">
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
