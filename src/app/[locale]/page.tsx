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
    title: dictionary.meta.home.title,
    description: dictionary.meta.home.description,
    locale,
    path: "/",
  });
}

export default async function HomePage({ params }: PageProps) {
  const { dictionary } = await resolveLocale(params);
  return (
    <PagePlaceholder
      title={dictionary.meta.home.title}
      description={dictionary.meta.home.description}
      note={dictionary.common.underConstruction}
    />
  );
}
