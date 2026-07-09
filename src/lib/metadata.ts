import type { Metadata } from "next";
import { localePath, locales, type Locale } from "@/i18n/config";

interface PageMetadataInput {
  title: string;
  description: string;
  locale: Locale;
  path: string;
}

/**
 * Metadata padrão de página (Docs/13): title, description,
 * canonical e alternates hreflang para todos os idiomas.
 */
export function buildPageMetadata({
  title,
  description,
  locale,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
    },
    openGraph: {
      title,
      description,
    },
  };
}
