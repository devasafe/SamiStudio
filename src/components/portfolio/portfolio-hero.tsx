"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { wrapIndex } from "@/components/portfolio/carousel-index";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/project";

interface PortfolioHeroProps {
  items: PortfolioItem[];
}

/** Âncora da grade abaixo — mesmo id usado em `PortfolioGrid`. */
const GRID_ANCHOR = "grade";

/**
 * Banner da página Portfólio: texto fixo à esquerda + carrossel dos projetos
 * marcados como "destaque" no admin. `items` já chega com o fallback
 * resolvido pelo servidor (getFeaturedProjects), então nunca fica vazio.
 */
export function PortfolioHero({ items }: PortfolioHeroProps) {
  const { locale, dictionary } = useLanguage();
  const page = dictionary.portfolioPage;
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = items[index];

  function go(delta: number) {
    setIndex((value) => wrapIndex(value, delta, items.length));
  }

  return (
    <section className="relative overflow-hidden bg-[#141009] text-[#f2ece0]">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
        <Container className="py-16 lg:py-24">
          <p
            className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
            data-cms="text:portfolioPage.heroEyebrow"
          >
            <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
            {page.heroEyebrow}
          </p>
          <h1 className="font-heading mt-6 text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] tracking-tight text-balance">
            <span data-cms="text:portfolioPage.heroTitleLead">{page.heroTitleLead}</span>{" "}
            <span className="text-[#cf5a18] italic" data-cms="text:portfolioPage.heroTitleEmphasis">
              {page.heroTitleEmphasis}
            </span>
          </h1>
          <p
            className="text-small mt-7 max-w-md leading-relaxed text-[#d8cdba]"
            data-cms="text:portfolioPage.heroText"
          >
            {page.heroText}
          </p>
          <Link
            href={`#${GRID_ANCHOR}`}
            className="text-caption group mt-10 inline-flex items-center gap-3 tracking-[0.18em] text-[#cf5a18] uppercase"
            data-cms="text:portfolioPage.heroCta"
          >
            {page.heroCta}
            <span className="flex size-9 items-center justify-center rounded-full border border-[#cf5a18]/50 transition-colors duration-300 group-hover:bg-[#cf5a18] group-hover:text-[#141009]">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </Link>
        </Container>

        <div className="relative h-[24rem] lg:h-[36rem]">
          {/* Crossfade entre os destaques: a foto e o cartão do projeto trocam
              com fade; as setas ficam fixas por cima. */}
          <AnimatePresence initial={false}>
            {current ? (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.55, ease: "easeInOut" }}
              >
                {current.coverImage ? (
                  <Image
                    src={current.coverImage}
                    alt={current.title}
                    fill
                    sizes="(min-width: 1024px) 56vw, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className={cn("absolute inset-0", current.coverClass ?? "bg-[#221a13]")} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c09]/80 via-[#0f0c09]/10 to-transparent" />

                <div className="absolute right-6 bottom-6 max-w-xs border border-[#f2ece0]/15 bg-[#0f0c09]/85 p-5 backdrop-blur-sm lg:right-10 lg:bottom-10">
                  <p className="text-caption tracking-[0.18em] text-[#cf5a18] uppercase">
                    {page.featuredBadge}
                  </p>
                  <h2 className="font-heading mt-2 text-xl leading-tight">{current.title}</h2>
                  <p className="text-caption mt-2 text-[#d8cdba]/70">
                    {[current.categoryLabel, current.city, current.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <Link
                    href={localePath(locale, `/portfolio/${current.slug}`)}
                    className="text-caption group mt-4 inline-flex items-center gap-2 tracking-[0.16em] text-[#cf5a18] uppercase"
                  >
                    {page.featuredCta}
                    <ArrowUpRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </Link>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {items.length > 1 ? (
            <div className="absolute bottom-6 left-6 z-10 flex gap-2 lg:bottom-10 lg:left-10">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={page.heroPrev}
                className="flex size-11 items-center justify-center rounded-full border border-[#f2ece0]/30 bg-[#0f0c09]/40 text-[#f2ece0] backdrop-blur-sm transition-colors duration-300 hover:bg-[#f2ece0] hover:text-[#141009]"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={page.heroNext}
                className="flex size-11 items-center justify-center rounded-full border border-[#f2ece0]/30 bg-[#0f0c09]/40 text-[#f2ece0] backdrop-blur-sm transition-colors duration-300 hover:bg-[#f2ece0] hover:text-[#141009]"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
