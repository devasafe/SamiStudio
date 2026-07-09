import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CTASection } from "@/components/shared/cta-section";
import { Heading, Paragraph, SectionTitle } from "@/components/ui/typography";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildPageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.about.title,
    description: dictionary.meta.about.description,
    locale,
    path: "/sobre",
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const about = dictionary.aboutPage;

  return (
    <main className="flex-1 pt-22">
      <Section>
        <Container>
          <Heading level={1} className="max-w-3xl">
            {dictionary.meta.about.title}
          </Heading>
          <Paragraph size="lg" className="mt-6 max-w-2xl">
            {dictionary.sections.about.text}
          </Paragraph>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container>
          <SectionTitle title={about.historyTitle} subtitle={about.historyText} />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionTitle title={about.valuesTitle} />
          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {about.values.map((value) => (
              <div key={value.title} className="border-border border-t pt-6">
                <h3 className="text-h4 font-heading">{value.title}</h3>
                <p className="text-small text-muted-foreground mt-3">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
