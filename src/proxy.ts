import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

const prefixedLocales = locales.filter((locale) => locale !== defaultLocale);

/**
 * Estratégia de URLs (Docs/13): pt-BR sem prefixo (/, /sobre, ...),
 * demais idiomas com prefixo (/en/..., /es/...).
 * Internamente todas as rotas vivem em app/[locale].
 */
export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // /pt-BR/... redireciona para a versão sem prefixo (URL canônica única).
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Idiomas prefixados já casam com app/[locale].
  const hasLocalePrefix = prefixedLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Sem prefixo: reescreve internamente para o idioma padrão.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Ignora assets, API e arquivos estáticos.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
