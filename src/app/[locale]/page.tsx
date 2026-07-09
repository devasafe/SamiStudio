import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { resolveLocale } from "@/i18n/resolve-locale";
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
  const { dictionary } = await resolveLocale(params);
  return (
    <main className="flex-1">
      <Hero />
      {/* Demais seções da home entram na FASE 5. */}
      <Section>
        <Container>
          <p className="text-caption text-muted-foreground">
            {dictionary.common.underConstruction}
          </p>
        </Container>
      </Section>
    </main>
  );
}
