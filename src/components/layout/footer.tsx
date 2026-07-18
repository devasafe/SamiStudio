import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SatrizSeal } from "@/components/layout/satriz-seal";
import { SiteBrand } from "@/components/layout/site-brand";
import { localePath, locales, type Locale } from "@/i18n/config";
import { DEFAULT_SITE_NAME } from "@/lib/site-name";
import type { Dictionary } from "@/i18n/get-dictionary";
import { phoneDigits, whatsappUrl } from "@/lib/phone";
import type { SiteSettingsDoc } from "@/models/site-settings";

const localeNames: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
  es: "Español",
};

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary;
  settings: SiteSettingsDoc | null;
}

/**
 * Footer escuro (Docs/08) com navegação, contato (CMS), redes e idiomas.
 */
export function Footer({ locale, dictionary, settings }: FooterProps) {
  const year = new Date().getFullYear();

  // `cms` identifica o campo de Configurações por trás de cada link — o
  // rótulo social é texto fixo ("Instagram"), então a marcação vai no campo
  // real (a URL), não no rótulo exibido.
  // O telefone leva ao WhatsApp em vez do discador: é por lá que o contato
  // acontece, e no computador o `tel:` não faz nada.
  const phoneLink = whatsappUrl(settings?.phone ?? "");
  const whatsappLink = whatsappUrl(settings?.whatsapp ?? "");
  // Telefone e WhatsApp costumam ser o mesmo número: repetir a mesma linha
  // duas vezes no rodapé só ocupa espaço.
  const sameNumber = phoneDigits(settings?.phone ?? "") === phoneDigits(settings?.whatsapp ?? "");

  const contactLinks = [
    settings?.email
      ? { href: `mailto:${settings.email}`, label: settings.email, cms: "set:email" }
      : null,
    settings?.phone && phoneLink
      ? { href: phoneLink, label: settings.phone, cms: "set:phone" }
      : null,
    whatsappLink && !sameNumber
      ? { href: whatsappLink, label: "WhatsApp", cms: "set:whatsapp" }
      : null,
  ].filter((link): link is { href: string; label: string; cms: string } => link !== null);

  const socialLinks = [
    settings?.instagram
      ? { href: settings.instagram, label: "Instagram", cms: "set:instagram" }
      : null,
    settings?.linkedin ? { href: settings.linkedin, label: "LinkedIn", cms: "set:linkedin" } : null,
    settings?.facebook ? { href: settings.facebook, label: "Facebook", cms: "set:facebook" } : null,
    settings?.behance ? { href: settings.behance, label: "Behance", cms: "set:behance" } : null,
    settings?.youtube ? { href: settings.youtube, label: "YouTube", cms: "set:youtube" } : null,
  ].filter((link): link is { href: string; label: string; cms: string } => link !== null);

  const navLinks = [
    { href: localePath(locale, "/"), label: dictionary.nav.home, cms: "text:nav.home" },
    { href: localePath(locale, "/sobre"), label: dictionary.nav.about, cms: "text:nav.about" },
    {
      href: localePath(locale, "/servicos"),
      label: dictionary.nav.services,
      cms: "text:nav.services",
    },
    {
      href: localePath(locale, "/portfolio"),
      label: dictionary.nav.portfolio,
      cms: "text:nav.portfolio",
    },
    {
      href: localePath(locale, "/contato"),
      label: dictionary.nav.contact,
      cms: "text:nav.contact",
    },
  ];

  return (
    <footer className="bg-[#141009] text-[#f2ece0]">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-heading text-body-lg tracking-tight">
              <SiteBrand
                name={settings?.siteName?.trim() || DEFAULT_SITE_NAME}
                logo={settings?.logo}
                dimClassName="text-[#f2ece0]/60"
              />
            </p>
            <p
              className="text-small mt-4 max-w-sm text-[#f2ece0]/60"
              data-cms="text:footer.tagline"
            >
              {dictionary.footer.tagline}
            </p>
          </div>

          <nav aria-label={dictionary.footer.navigation}>
            <p
              className="text-caption font-medium tracking-widest text-[#f2ece0]/50 uppercase"
              data-cms="text:footer.navigation"
            >
              {dictionary.footer.navigation}
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
                    data-cms={link.cms}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-10">
            {contactLinks.length > 0 || socialLinks.length > 0 ? (
              <nav aria-label={dictionary.footer.contact}>
                <p
                  className="text-caption font-medium tracking-widest text-[#f2ece0]/50 uppercase"
                  data-cms="text:footer.contact"
                >
                  {dictionary.footer.contact}
                </p>
                <ul className="mt-4 space-y-3">
                  {contactLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
                        data-cms={link.cms}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
                        data-cms={link.cms}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <nav aria-label={dictionary.footer.languages}>
              <p
                className="text-caption font-medium tracking-widest text-[#f2ece0]/50 uppercase"
                data-cms="text:footer.languages"
              >
                {dictionary.footer.languages}
              </p>
              <ul className="mt-4 space-y-3">
                {locales.map((l) => (
                  <li key={l}>
                    <Link
                      href={localePath(l, "/")}
                      className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
                      aria-current={l === locale ? "true" : undefined}
                    >
                      {localeNames[l]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-[#f2ece0]/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-[#f2ece0]/50">
            © {year} {settings?.siteName?.trim() || DEFAULT_SITE_NAME}.{" "}
            <span data-cms="text:footer.rights">{dictionary.footer.rights}</span>
          </p>
          {/* Assinatura da Satriz Club — marca registrada que assina o projeto. */}
          <SatrizSeal />
        </div>
      </Container>
    </footer>
  );
}
