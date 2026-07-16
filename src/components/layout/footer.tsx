import Link from "next/link";
import { Container } from "@/components/layout/container";
import { localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
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

  const whatsappDigits = (settings?.whatsapp ?? "").replace(/\D/g, "");
  const contactLinks = [
    settings?.email ? { href: `mailto:${settings.email}`, label: settings.email } : null,
    settings?.phone
      ? { href: `tel:${settings.phone.replace(/\s/g, "")}`, label: settings.phone }
      : null,
    whatsappDigits ? { href: `https://wa.me/${whatsappDigits}`, label: "WhatsApp" } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  const socialLinks = [
    settings?.instagram ? { href: settings.instagram, label: "Instagram" } : null,
    settings?.linkedin ? { href: settings.linkedin, label: "LinkedIn" } : null,
    settings?.facebook ? { href: settings.facebook, label: "Facebook" } : null,
    settings?.behance ? { href: settings.behance, label: "Behance" } : null,
    settings?.youtube ? { href: settings.youtube, label: "YouTube" } : null,
  ].filter((link): link is { href: string; label: string } => link !== null);

  const navLinks = [
    { href: localePath(locale, "/"), label: dictionary.nav.home },
    { href: localePath(locale, "/sobre"), label: dictionary.nav.about },
    { href: localePath(locale, "/servicos"), label: dictionary.nav.services },
    { href: localePath(locale, "/portfolio"), label: dictionary.nav.portfolio },
    { href: localePath(locale, "/contato"), label: dictionary.nav.contact },
  ];

  return (
    <footer className="bg-[#141009] text-[#f2ece0]">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-heading text-body-lg tracking-tight">
              Sami da Silva <span className="text-[#f2ece0]/60">Studio</span>
            </p>
            <p className="text-small mt-4 max-w-sm text-[#f2ece0]/60">
              {dictionary.footer.tagline}
            </p>
          </div>

          <nav aria-label={dictionary.footer.navigation}>
            <p className="text-caption font-medium tracking-widest text-[#f2ece0]/50 uppercase">
              {dictionary.footer.navigation}
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
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
                <p className="text-caption font-medium tracking-widest text-[#f2ece0]/50 uppercase">
                  {dictionary.footer.contact}
                </p>
                <ul className="mt-4 space-y-3">
                  {contactLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-small text-[#f2ece0]/80 transition-colors hover:text-[#f2ece0]"
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
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <nav aria-label={dictionary.footer.languages}>
              <p className="text-caption font-medium tracking-widest text-[#f2ece0]/50 uppercase">
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

        <div className="mt-16 border-t border-[#f2ece0]/10 pt-8">
          <p className="text-caption text-[#f2ece0]/50">
            © {year} {dictionary.meta.siteName}. {dictionary.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
