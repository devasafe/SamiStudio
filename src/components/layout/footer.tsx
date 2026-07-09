import Link from "next/link";
import { Container } from "@/components/layout/container";
import { localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const localeNames: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
  es: "Español",
};

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Footer escuro (Docs/08) com navegação, contato e idiomas.
 * Redes sociais entram quando as URLs vierem das configurações (CMS).
 */
export function Footer({ locale, dictionary }: FooterProps) {
  const year = new Date().getFullYear();

  const navLinks = [
    { href: localePath(locale, "/"), label: dictionary.nav.home },
    { href: localePath(locale, "/sobre"), label: dictionary.nav.about },
    { href: localePath(locale, "/servicos"), label: dictionary.nav.services },
    { href: localePath(locale, "/portfolio"), label: dictionary.nav.portfolio },
    { href: localePath(locale, "/contato"), label: dictionary.nav.contact },
  ];

  return (
    <footer className="bg-foreground text-background">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-heading text-body-lg tracking-tight">
              Sami da Silva <span className="text-background/60">Studio</span>
            </p>
            <p className="text-small text-background/60 mt-4 max-w-sm">
              {dictionary.footer.tagline}
            </p>
          </div>

          <nav aria-label={dictionary.footer.navigation}>
            <p className="text-caption text-background/50 font-medium tracking-widest uppercase">
              {dictionary.footer.navigation}
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-small text-background/80 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={dictionary.footer.languages}>
            <p className="text-caption text-background/50 font-medium tracking-widest uppercase">
              {dictionary.footer.languages}
            </p>
            <ul className="mt-4 space-y-3">
              {locales.map((l) => (
                <li key={l}>
                  <Link
                    href={localePath(l, "/")}
                    className="text-small text-background/80 hover:text-background transition-colors"
                    aria-current={l === locale ? "true" : undefined}
                  >
                    {localeNames[l]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-background/10 mt-16 border-t pt-8">
          <p className="text-caption text-background/50">
            © {year} {dictionary.meta.siteName}. {dictionary.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
