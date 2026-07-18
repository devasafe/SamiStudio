"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "@/components/icons";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Container } from "@/components/layout/container";
import { SiteBrand } from "@/components/layout/site-brand";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { DEFAULT_SITE_NAME } from "@/lib/site-name";
import { cn } from "@/lib/utils";

interface NavbarProps {
  /** Nome do site (Configurações); vazio cai no nome padrão. */
  siteName?: string;
  /** Logo enviada no painel; sem ela, mostra só o nome. */
  logo?: string;
}

/**
 * Navbar fixa (Docs/08): 88px de altura, transparente sobre o Hero
 * e sólida após o scroll, com transição suave.
 */
export function Navbar({ siteName, logo }: NavbarProps) {
  const { locale, dictionary } = useLanguage();
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Estado inicial fora do corpo do effect (react-hooks/set-state-in-effect).
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const links = [
    {
      href: localePath(locale, "/"),
      label: dictionary.nav.home,
      exact: true,
      cms: "text:nav.home",
    },
    {
      href: localePath(locale, "/sobre"),
      label: dictionary.nav.about,
      exact: true,
      cms: "text:nav.about",
    },
    {
      href: localePath(locale, "/servicos"),
      label: dictionary.nav.services,
      exact: true,
      cms: "text:nav.services",
    },
    {
      href: localePath(locale, "/portfolio"),
      label: dictionary.nav.portfolio,
      exact: false,
      cms: "text:nav.portfolio",
    },
    {
      href: localePath(locale, "/contato"),
      label: dictionary.nav.contact,
      exact: true,
      cms: "text:nav.contact",
    },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const solid = scrolled || menuOpen;
  // O site inteiro é dark editorial, então até o scroll a navbar está sempre
  // sobre fundo escuro e usa tons claros. Manter uma lista de rotas escuras
  // aqui só criava navbar ilegível a cada página nova (ver navbar-on-dark.test).
  const onDark = !solid;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-border bg-background/90 border-b backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <Container className="flex h-22 items-center justify-between gap-8">
        <Link
          href={localePath(locale, "/")}
          className={cn(
            "font-heading text-body-lg tracking-tight whitespace-nowrap transition-colors",
            onDark && "text-[#f2ece0]"
          )}
        >
          <SiteBrand
            name={siteName?.trim() || DEFAULT_SITE_NAME}
            logo={logo}
            dimClassName={onDark ? "text-[#f2ece0]/55" : "text-muted-foreground"}
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href, link.exact) ? "page" : undefined}
              className={cn(
                "text-small transition-colors",
                onDark
                  ? isActive(link.href, link.exact)
                    ? "text-[#f2ece0]"
                    : "text-[#f2ece0]/65 hover:text-[#f2ece0]"
                  : isActive(link.href, link.exact)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
              )}
              data-cms={link.cms}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher onDark={onDark} />
          <Link
            href={localePath(locale, "/contato")}
            className={cn(
              buttonVariants({ variant: onDark ? "outline" : "default", size: "lg" }),
              // Cápsula, para formar um par com o seletor de idioma ao lado.
              "rounded-full px-5",
              onDark &&
                "border-transparent bg-[#f2ece0] text-[#141009] hover:bg-[#f2ece0]/85 hover:text-[#141009]"
            )}
            data-cms="text:common.requestQuote"
          >
            {dictionary.common.requestQuote}
          </Link>
        </div>

        <button
          type="button"
          className={cn("-mr-2 p-2 lg:hidden", onDark ? "text-[#f2ece0]" : "text-foreground")}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? dictionary.common.closeMenu : dictionary.common.openMenu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {menuOpen ? (
        <div id="mobile-menu" className="border-border bg-background border-b lg:hidden">
          <Container className="flex flex-col gap-6 py-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                className={cn(
                  "text-h4 font-heading py-3 transition-colors",
                  isActive(link.href, link.exact) ? "text-foreground" : "text-muted-foreground"
                )}
                data-cms={link.cms}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-border mt-2 flex items-center justify-between border-t pt-6">
              <LanguageSwitcher />
              <Link
                href={localePath(locale, "/contato")}
                onClick={closeMenu}
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "px-5")}
                data-cms="text:common.requestQuote"
              >
                {dictionary.common.requestQuote}
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
