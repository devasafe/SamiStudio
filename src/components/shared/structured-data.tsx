import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { SiteSettingsDoc } from "@/models/site-settings";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Serializa JSON para uso seguro dentro de <script>: escapa "<" para
 * impedir que valores vindos do CMS encerrem a tag (XSS via </script>).
 */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

interface StructuredDataProps {
  locale: Locale;
  dictionary: Dictionary;
  settings: SiteSettingsDoc | null;
}

/** JSON-LD Organization + WebSite (Docs/13 — Schema.org). */
export function StructuredData({ locale, dictionary, settings }: StructuredDataProps) {
  const siteName = settings?.siteName ?? dictionary.meta.siteName;

  const sameAs = [
    settings?.instagram,
    settings?.linkedin,
    settings?.facebook,
    settings?.behance,
    settings?.youtube,
  ].filter((url): url is string => Boolean(url));

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    ...(settings?.logo ? { logo: settings.logo } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    inLanguage: locale,
    description: dictionary.meta.home.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(website) }}
      />
    </>
  );
}
