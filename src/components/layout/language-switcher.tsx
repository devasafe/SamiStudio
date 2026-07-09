"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { defaultLocale, localePath, locales, type Locale } from "@/i18n/config";
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
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? "/";
  const { locale: currentLocale, dictionary } = useLanguage();
  const basePath = stripLocale(pathname);

  return (
    <nav
      aria-label={dictionary.common.language}
      className={cn("flex items-center gap-4", className)}
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={localePath(locale, basePath)}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={cn(
            "text-caption font-medium tracking-widest uppercase transition-colors",
            locale === currentLocale
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </nav>
  );
}
