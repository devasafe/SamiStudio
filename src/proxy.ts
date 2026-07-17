import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, LOCALE_COOKIE } from "@/i18n/config";
import { negotiateLocale } from "@/i18n/negotiate";
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
 * Estratégia de URLs (Docs/13): o idioma padrão (es) fica sem prefixo
 * (/, /sobre, ...) e os demais com prefixo (/pt-BR/..., /en/...).
 * Internamente todas as rotas do site vivem em app/[locale];
 * /admin fica fora do sistema de locales.
 */
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return handleAdmin(request);
  }

  // O prefixo do idioma padrão redireciona para a versão sem prefixo (URL
  // canônica única). 307 (temporário) e NÃO 308: qual idioma é o padrão é
  // configuração mutável — quando ele muda (ex.: pt-BR → es), um 308 já
  // cacheado no navegador de "/pt-BR/x → /x" passa a brigar com o 307 abaixo,
  // que agora manda "/x → /pt-BR/x", e o par entra em laço de redirecionamento
  // ("localhost redirecionou você muitas vezes"). O no-store impede que este
  // redirect volte a ser gravado.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || "/";
    const redirect = NextResponse.redirect(url, 307);
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  }

  // Idiomas prefixados já casam com app/[locale].
  const hasLocalePrefix = prefixedLocales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Sem prefixo: o idioma sai da escolha da pessoa (cookie) ou do navegador.
  const preferred = negotiateLocale(
    request.headers.get("accept-language"),
    request.cookies.get(LOCALE_COOKIE)?.value
  );

  const url = request.nextUrl.clone();

  // Quem prefere outro idioma vai para a URL prefixada dele. 307 e não 308: a
  // escolha depende de quem pede, e um permanente ficaria gravado no navegador
  // — a pessoa nunca mais alcançaria o espanhol nesta URL.
  //
  // O Vary diz aos caches que esta resposta depende de quem pediu. Só vale para
  // o redirect: o Next reescreve o Vary das respostas de rewrite, e nem o
  // headers() do next.config sobrevive a isso. Na Vercel o proxy roda antes do
  // cache em toda requisição, então a negociação acontece de qualquer forma;
  // um cache intermediário próprio precisaria ser configurado à mão.
  if (preferred !== defaultLocale) {
    url.pathname = pathname === "/" ? `/${preferred}` : `/${preferred}${pathname}`;
    const redirect = NextResponse.redirect(url, 307);
    redirect.headers.set("Vary", "Accept-Language, Cookie");
    // Depende de quem pede (idioma) e de qual é o padrão — não pode ser
    // gravado por nenhum cache; ver a nota do redirect do prefixo padrão acima.
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  }

  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Ignora assets, API e arquivos estáticos.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
