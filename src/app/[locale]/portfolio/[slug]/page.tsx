import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildPageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.project.title,
    description: dictionary.meta.project.description,
    locale,
    path: `/portfolio/${slug}`,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { dictionary } = await resolveLocale(params);
  return (
    <PagePlaceholder
      title={dictionary.meta.project.title}
      description={dictionary.meta.project.description}
      note={dictionary.common.underConstruction}
    />
  );
}
