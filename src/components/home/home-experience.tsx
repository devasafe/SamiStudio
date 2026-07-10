"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Children, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { buttonVariants } from "@/components/ui/button";
import { blueprintProgress, FINALE, phaseProgress, useBlueprintScroll } from "@/blueprint-engine";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Render final da Sami — destino do crossfade (FASE 9). */
const FINAL_RENDER_SRC = "/images/hero-render-final.webp";

// A cena 3D só existe no cliente e só em desktop.
const BlueprintCanvas = dynamic(
  () => import("@/blueprint-engine").then((module) => module.BlueprintCanvas),
  { ssr: false }
);

type SlideLayout = "full" | "left";
type HeroMode = "static" | "3d";

interface HomeExperienceProps {
  /** Seções da home; cada uma vira um slide da experiência. */
  children: ReactNode;
  /** Layout de cada slide filho (o hero é sempre "full"). */
  layouts?: SlideLayout[];
}

/** Fração do segmento usada para o crossfade entre slides. */
const FADE = 0.3;

/** Opacidade e deslocamento de um slide para o progresso atual. */
function slideState(progress: number, index: number, count: number) {
  const segment = 1 / count;
  const start = index * segment;
  const end = start + segment;
  const fade = segment * FADE;

  let opacity = 0;
  if (progress >= start && progress <= end) {
    const fadeIn = index === 0 ? 1 : Math.min(1, (progress - start) / fade);
    const fadeOut = index === count - 1 ? 1 : Math.min(1, (end - progress) / fade);
    opacity = Math.max(0, Math.min(fadeIn, fadeOut));
  }
  const offset = (1 - opacity) * 24;
  return { opacity, offset };
}

/**
 * Home como experiência única (decisão do cliente, 2026-07-09):
 * a página não desce — a viewport fica fixa, o 3D constrói o ambiente
 * ao fundo e as seções entram e saem conforme o scroll.
 * Mobile/reduced-motion: página normal, sem 3D.
 */
export function HomeExperience({ children, layouts = [] }: HomeExperienceProps) {
  const { locale, dictionary } = useLanguage();
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finalRenderRef = useRef<HTMLDivElement | null>(null);
  const contentScrimRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<HeroMode>("static");
  // Ferramenta interna: /?p=0.9 congela a experiência nesse progresso
  // (inspeção visual de qualquer ponto do scroll).
  const [debugProgress, setDebugProgress] = useState<number | null>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!desktop || reducedMotion) {
      return;
    }
    const raw = new URLSearchParams(window.location.search).get("p");
    const parsed = raw === null ? NaN : Number(raw);
    const timer = window.setTimeout(() => {
      setMode("3d");
      if (Number.isFinite(parsed)) {
        setDebugProgress(Math.min(1, Math.max(0, parsed)));
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, []);

  const sections = useMemo(() => Children.toArray(children), [children]);
  const slideCount = sections.length + 1; // + hero

  useBlueprintScroll(zoneRef, mode === "3d" && debugProgress === null, {
    screens: slideCount + 1,
  });

  useEffect(() => {
    if (mode === "3d" && debugProgress !== null) {
      blueprintProgress.set(debugProgress);
    }
  }, [mode, debugProgress]);

  // Transições dos slides dirigidas pelo progress, sem re-render React.
  useEffect(() => {
    if (mode !== "3d") {
      return;
    }
    const apply = () => {
      const progress = blueprintProgress.get();
      slideRefs.current.forEach((element, index) => {
        if (!element) {
          return;
        }
        const { opacity, offset } = slideState(progress, index, slideCount);
        element.style.opacity = String(opacity);
        element.style.transform = `translateY(${offset}px)`;
        element.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
      });
      // Crossfade final: o 3D dissolve na foto renderizada real,
      // e o scrim de conteúdo sai de cena para a foto respirar.
      const finale = phaseProgress(progress, FINALE.from, FINALE.to);
      if (finalRenderRef.current) {
        finalRenderRef.current.style.opacity = String(finale);
      }
      if (contentScrimRef.current) {
        contentScrimRef.current.style.opacity = String(1 - finale);
      }
    };
    apply();
    return blueprintProgress.subscribe(apply);
  }, [mode, slideCount]);

  const hero = dictionary.hero;

  const heroContent = (
    <section className="relative flex h-full flex-col justify-center">
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
  );

  // Mobile/reduced-motion: página normal, seções empilhadas.
  if (mode === "static") {
    return (
      <div>
        <div className="relative overflow-hidden">
          <div className="from-ivory via-background to-beige absolute inset-0 bg-gradient-to-br" />
          <div className="relative h-svh">{heroContent}</div>
        </div>
        {sections}
      </div>
    );
  }

  const slides: { node: ReactNode; layout: SlideLayout }[] = [
    { node: heroContent, layout: "full" },
    ...sections.map((node, i) => ({ node, layout: layouts[i] ?? "left" })),
  ];

  return (
    <div ref={zoneRef} className="relative h-svh overflow-hidden">
      {/* 3D ao fundo, sempre presente */}
      <div className="absolute inset-0" aria-hidden>
        <BlueprintCanvas />
      </div>
      {/* Render final da Sami: dissolve por cima do 3D no finale */}
      <div
        ref={finalRenderRef}
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0 }}
        aria-hidden
      >
        <Image
          src={FINAL_RENDER_SRC}
          alt=""
          fill
          sizes="100vw"
          quality={90}
          className="object-cover"
        />
        {/* Scrim suave para a legibilidade do CTA sobre a foto */}
        <div className="from-background/55 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      {/* Gradiente sutil para legibilidade da coluna de conteúdo */}
      <div
        ref={contentScrimRef}
        className="from-background/85 via-background/40 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent"
        aria-hidden
      />

      {slides.map((slide, index) => (
        <div
          key={index}
          ref={(el) => {
            slideRefs.current[index] = el;
          }}
          className={cn("absolute inset-0 flex items-center overflow-hidden", index > 0 && "py-24")}
          style={{ opacity: index === 0 ? 1 : 0, pointerEvents: index === 0 ? "auto" : "none" }}
        >
          <div
            className={cn(
              "w-full",
              index === 0 ? "h-full" : "max-h-full",
              slide.layout === "left" && "lg:w-1/2",
              "[&_section]:bg-transparent [&_section]:py-0",
              // Último slide (CTA) fica sobre a foto real: texto claro.
              index === slideCount - 1 &&
                "text-ivory [&_p]:text-ivory/90 [&_h2]:drop-shadow-md [&_p]:drop-shadow-sm"
            )}
          >
            {slide.node}
          </div>
        </div>
      ))}
    </div>
  );
}
