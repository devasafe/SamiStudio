"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { localePath } from "@/i18n/config";

/** Render de um projeto real da Sami — a foto que abre o site. */
const HERO_IMAGE_SRC = "/images/hero-render-final.webp";

interface HomeExperienceProps {
  /** Seções da home, empilhadas após o hero. */
  children: ReactNode;
}

/**
 * Hero editorial dark (2026-07-11): uma foto de projeto ocupa a tela,
 * escurecida na base para o título respirar. Linguagem de revista de
 * arquitetura — o render é o protagonista, o texto é legenda.
 * O restante da home segue no fundo claro.
 */
export function HomeExperience({ children }: HomeExperienceProps) {
  const { locale, dictionary } = useLanguage();
  const hero = dictionary.hero;

  return (
    <div>
      <section className="relative flex h-svh min-h-[38rem] w-full flex-col overflow-hidden bg-[#141009] text-[#f2ece0]">
        <Image
          src={HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          // Este é o elemento de LCP do site. q92 custava 185 KB em AVIF na
          // largura que o mobile baixa (1080w); q85 faz 124 KB — 61 KB a menos
          // numa imagem que ainda leva quatro camadas de gradiente escuro por
          // cima, onde a diferença não aparece.
          quality={85}
          className="object-cover"
        />
        {/* Mood dark quente: base densa para a legenda, topo para a navbar */}
        <div className="absolute inset-0 bg-[#141009]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141009] via-[#141009]/55 to-[#141009]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141009]/80 via-[#141009]/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#141009]/85 to-transparent" />

        <Container className="relative flex flex-1 flex-col justify-end pt-28 pb-14 lg:pb-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            {/* Legenda principal: eyebrow de marca + título editorial */}
            <div className="max-w-4xl">
              <p className="text-caption flex items-center gap-2.5 tracking-[0.22em] text-[#e7dccb]/80 uppercase">
                <span className="inline-block size-1.5 rounded-full bg-current" aria-hidden />
                Sami da Silva Studio
              </p>
              <h1
                className="font-heading mt-5 text-[clamp(2.75rem,7.5vw,7rem)] leading-[0.95] tracking-tight text-balance"
                data-cms="text:hero.headline"
              >
                {hero.headline}
              </h1>
            </div>

            {/* Descrição curta + ação, alinhadas à base como numa ficha técnica */}
            <div className="flex max-w-sm flex-col items-start gap-6 lg:items-end lg:text-right">
              <p
                className="text-small leading-relaxed text-[#d8cdba]"
                data-cms="text:hero.subheadline"
              >
                {hero.subheadline}
              </p>
              <Link
                href={localePath(locale, "/portfolio")}
                className="group text-small inline-flex items-center gap-3 rounded-full border border-[#f2ece0]/35 px-6 py-3 tracking-wide transition-colors duration-300 hover:bg-[#f2ece0] hover:text-[#141009]"
              >
                <span data-cms="text:common.viewPortfolio">{dictionary.common.viewPortfolio}</span>
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Fio editorial + cue de rolagem */}
          <div className="mt-12 flex items-center gap-4 border-t border-[#f2ece0]/15 pt-6">
            <span
              className="text-caption tracking-[0.22em] text-[#e7dccb]/60 uppercase"
              data-cms="text:hero.scroll"
            >
              {hero.scroll}
            </span>
            <span className="h-px flex-1 bg-[#f2ece0]/15" aria-hidden />
          </div>
        </Container>
      </section>

      {children}
    </div>
  );
}
