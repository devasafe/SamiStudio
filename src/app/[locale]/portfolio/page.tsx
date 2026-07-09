import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { resolveLocale } from "@/i18n/resolve-locale";
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
  const { dictionary } = await resolveLocale(params);
  return (
    <PagePlaceholder
      title={dictionary.meta.portfolio.title}
      description={dictionary.meta.portfolio.description}
      note={dictionary.common.underConstruction}
    />
  );
}
