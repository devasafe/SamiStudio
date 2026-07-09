import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

const prefixedLocales = locales.filter((locale) => locale !== defaultLocale);

/** Área administrativa: exige sessão válida (Docs/12). */
async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isAuthenticated = await (async () => {
    if (!token) {
      return false;
    }
    try {
      await verifySession(token);
      return true;
    } catch {
      return false;
    }
  })();

  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Estratégia de URLs (Docs/13): pt-BR sem prefixo (/, /sobre, ...),
 * demais idiomas com prefixo (/en/..., /es/...).
 * Internamente todas as rotas do site vivem em app/[locale];
 * /admin fica fora do sistema de locales.
 */
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return handleAdmin(request);
  }

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
