"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { defaultLocale, localePath, locales, type Locale } from "@/i18n/config";
import { rememberLocale } from "@/i18n/remember-locale";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
  es: "ES",
};

/** Remove o prefixo de idioma do pathname, devolvendo o caminho neutro. */
function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) {
      continue;
    }
    if (pathname === `/${locale}`) {
      return "/";
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

interface LanguageSwitcherProps {
  className?: string;
  /** Sobre um fundo escuro (hero): usa tons claros em vez dos tokens. */
  onDark?: boolean;
}

/**
 * Troca de idioma como controle segmentado: os três ficam à vista numa cápsula
 * e o atual aparece preenchido.
 */
export function LanguageSwitcher({ className, onDark = false }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const { locale: currentLocale, dictionary } = useLanguage();
  const basePath = stripLocale(pathname);

  return (
    <nav
      aria-label={dictionary.common.language}
      className={cn(
        "flex items-center gap-0.5 rounded-full border p-1",
        onDark ? "border-[#f2ece0]/15 bg-[#f2ece0]/8 backdrop-blur-sm" : "border-border bg-muted",
        className
      )}
    >
      {locales.map((locale) => {
        const active = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={localePath(locale, basePath)}
            onClick={() => rememberLocale(locale)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "text-caption rounded-full px-2.5 py-1 font-medium tracking-widest uppercase transition-colors",
              onDark
                ? active
                  ? "bg-[#f2ece0] text-[#141009]"
                  : "text-[#f2ece0]/60 hover:text-[#f2ece0]"
                : active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
