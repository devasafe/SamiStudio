"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "@/components/icons";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * Navbar fixa (Docs/08): 88px de altura, transparente sobre o Hero
 * e sólida após o scroll, com transição suave.
 */
export function Navbar() {
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
    { href: localePath(locale, "/"), label: dictionary.nav.home, exact: true },
    { href: localePath(locale, "/sobre"), label: dictionary.nav.about, exact: true },
    { href: localePath(locale, "/servicos"), label: dictionary.nav.services, exact: true },
    { href: localePath(locale, "/portfolio"), label: dictionary.nav.portfolio, exact: false },
    { href: localePath(locale, "/contato"), label: dictionary.nav.contact, exact: true },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const solid = scrolled || menuOpen;
  // Transparente sobre fundos escuros (hero dark da home, conteúdo dark do
  // portfólio): usa tons claros até o scroll.
  const isDarkPage =
    pathname === localePath(locale, "/") || pathname === localePath(locale, "/portfolio");
  const onDark = isDarkPage && !solid;

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
          Sami da Silva
          <span className={onDark ? "text-[#f2ece0]/55" : "text-muted-foreground"}> Studio</span>
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
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-8 lg:flex">
          <LanguageSwitcher onDark={onDark} />
          <Link
            href={localePath(locale, "/contato")}
            className={cn(
              buttonVariants({ variant: onDark ? "outline" : "default", size: "lg" }),
              "px-5",
              onDark && "border-[#f2ece0]/40 text-[#f2ece0] hover:bg-[#f2ece0] hover:text-[#141009]"
            )}
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
                  "text-h4 font-heading transition-colors",
                  isActive(link.href, link.exact) ? "text-foreground" : "text-muted-foreground"
                )}
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
