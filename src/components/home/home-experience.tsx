"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { useBlueprintScroll } from "@/blueprint-engine";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";

// A cena 3D só existe no cliente e só em desktop.
const BlueprintCanvas = dynamic(
  () => import("@/blueprint-engine").then((module) => module.BlueprintCanvas),
  { ssr: false }
);

type HeroMode = "static" | "3d";

interface HomeExperienceProps {
  /** Seções que passam na coluna esquerda enquanto o 3D conclui à direita. */
  children: ReactNode;
}

/**
 * Experiência da home (referência editorial aprovada em 2026-07-09):
 * hero tipográfico gigante com o 3D ao fundo; ao scrollar, o canvas
 * recolhe para a coluna direita (sticky) e as seções passam à esquerda.
 * A narrativa (progress) percorre a zona inteira. Mobile: versão estática.
 */
export function HomeExperience({ children }: HomeExperienceProps) {
  const { locale, dictionary } = useLanguage();
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const canvasBoxRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<HeroMode>("static");
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || reducedMotion) {
      return;
    }
    const timer = window.setTimeout(() => setMode("3d"), 150);
    return () => window.clearTimeout(timer);
  }, []);

  useBlueprintScroll(zoneRef, mode === "3d");

  // Recolhe o canvas de full-bleed para a metade direita durante a
  // primeira tela de scroll (sem re-render: via style direto).
  useEffect(() => {
    if (mode !== "3d") {
      return;
    }
    let frame = 0;
    const update = () => {
      const split = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      canvasBoxRef.current?.style.setProperty("width", `${100 - split * 50}%`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [mode]);

  const hero = dictionary.hero;

  return (
    <div ref={zoneRef} className="relative">
      {mode === "3d" ? (
        <div className="pointer-events-none sticky top-0 z-0 h-svh overflow-hidden" aria-hidden>
          <div ref={canvasBoxRef} className="absolute inset-y-0 right-0 w-full">
            <BlueprintCanvas />
          </div>
        </div>
      ) : null}

      <div className={cn("relative z-10", mode === "3d" && "-mt-[100svh]")}>
        {/* Hero tipográfico (uma tela) */}
        <section className="relative flex h-svh flex-col justify-center overflow-hidden">
          {mode === "static" ? (
            <div className="from-ivory via-background to-beige absolute inset-0 -z-10 bg-gradient-to-br" />
          ) : (
            <div className="from-background/80 via-background/30 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r to-transparent" />
          )}
          <Container>
            <h1 className="font-heading max-w-[12ch] text-[clamp(3.25rem,9vw,9.5rem)] leading-[0.98] tracking-tight text-balance">
              {hero.headline}
            </h1>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
              <div className="flex flex-wrap gap-4">
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
              <p className="text-small text-muted-foreground max-w-xs lg:text-right">
                {hero.subheadline}
              </p>
            </div>
          </Container>
          <div
            className="text-muted-foreground absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
            aria-hidden
          >
            <span className="text-caption tracking-widest uppercase">{hero.scroll}</span>
            <ChevronDown className="size-5 animate-bounce" />
          </div>
        </section>

        {/* Zona 2 colunas: seções à esquerda, 3D concluindo à direita */}
        <div className={cn(mode === "3d" && "lg:grid lg:grid-cols-2")}>
          <div className={cn(mode === "3d" && "[&_.bg-surface]:bg-transparent")}>{children}</div>
          {mode === "3d" ? <div aria-hidden /> : null}
        </div>
      </div>
    </div>
  );
}
