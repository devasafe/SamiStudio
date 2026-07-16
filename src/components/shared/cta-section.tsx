import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/typography";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface CTASectionProps {
  locale: Locale;
  dictionary: Dictionary;
}

/** Foto de fundo de um projeto real, no mesmo mood dark quente da hero. */
const CTA_BG_SRC = "/images/cta-bg.webp";

/**
 * CTA final (Docs/06): uma única ação. Foto de projeto ao fundo, escurecida
 * como na hero, para "tirar o projeto do papel" virar realidade.
 */
export function CTASection({ locale, dictionary }: CTASectionProps) {
  const cta = dictionary.sections.cta;

  return (
    <section className="relative overflow-hidden bg-[#141009] py-24 text-[#f2ece0] lg:py-32">
      <Image src={CTA_BG_SRC} alt="" fill sizes="100vw" quality={85} className="object-cover" />
      {/* Escurecimento + gradiente para a legenda respirar, igual à hero. */}
      <div className="absolute inset-0 bg-[#141009]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141009] via-[#141009]/55 to-[#141009]/35" />

      <Container className="relative flex flex-col items-center text-center">
        <Heading level={2} className="max-w-2xl text-balance">
          {/* Heading não repassa atributos extras para a tag; o span inline
              carrega a marcação sem alterar a estrutura do título. */}
          <span data-cms="text:sections.cta.title">{cta.title}</span>
        </Heading>
        <p
          className="text-body-lg mt-6 max-w-xl text-[#d8cdba]"
          data-cms="text:sections.cta.subtitle"
        >
          {cta.subtitle}
        </p>
        <Link
          href={localePath(locale, "/contato")}
          className={`${buttonVariants({ variant: "default", size: "xl" })} mt-10`}
          data-cms="text:sections.cta.button"
        >
          {cta.button}
        </Link>
      </Container>
    </section>
  );
}
