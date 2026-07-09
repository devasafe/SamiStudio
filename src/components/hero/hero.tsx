"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { ChevronDown } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { phases, useBlueprintProgress, useBlueprintScroll } from "@/blueprint-engine";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";

// A cena 3D só existe no cliente.
const BlueprintCanvas = dynamic(
  () => import("@/blueprint-engine").then((module) => module.BlueprintCanvas),
  { ssr: false }
);

/**
 * Hero (Docs/03 e 08): experiência principal do site.
 * O scroll constrói o ambiente — a seção fica fixa (pin) enquanto
 * a Blueprint Engine avança do wireframe ao render final.
 */
export function Hero() {
  const { locale, dictionary } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  useBlueprintScroll(sectionRef);
  const progress = useBlueprintProgress();

  // O texto do Hero sai de cena no início da narrativa.
  const textOpacity = 1 - Math.min(1, progress / phases.blueprint.to);

  return (
    <section ref={sectionRef} className="relative h-svh overflow-hidden">
      <div className="absolute inset-0">
        <BlueprintCanvas />
      </div>

      {/* Gradiente para legibilidade do texto sobre a cena. */}
      <div
        className="from-background/90 via-background/40 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent"
        style={{ opacity: textOpacity }}
      />

      <Container className="relative z-10 flex h-full items-center">
        <div
          className="max-w-xl"
          style={{ opacity: textOpacity, pointerEvents: textOpacity < 0.3 ? "none" : "auto" }}
        >
          <h1 className="text-h1 lg:text-hero font-heading tracking-tight">
            {dictionary.hero.headline}
          </h1>
          <p className="text-body-lg text-muted-foreground mt-6">{dictionary.hero.subheadline}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={localePath(locale, "/portfolio")}
              className={buttonVariants({ variant: "default", size: "xl" })}
            >
              {dictionary.common.viewPortfolio}
            </Link>
            <Link
              href={localePath(locale, "/contato")}
              className={buttonVariants({ variant: "outline", size: "xl" })}
            >
              {dictionary.common.requestQuote}
            </Link>
          </div>
        </div>
      </Container>

      {/* Scroll indicator (Docs/07). */}
      <div
        className={cn(
          "text-muted-foreground absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1"
        )}
        style={{ opacity: textOpacity }}
        aria-hidden
      >
        <span className="text-caption tracking-widest uppercase">{dictionary.hero.scroll}</span>
        <ChevronDown className="size-5 animate-bounce" />
      </div>
    </section>
  );
}
