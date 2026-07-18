import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { FaqItem } from "@/lib/content";

interface FAQSectionProps {
  locale: Locale;
  dictionary: Dictionary;
  items: FaqItem[];
}

/**
 * FAQ (Docs/03): eliminar dúvidas antes do CTA. Editorial dark, em acordeão
 * com abertura suave (ver FaqAccordion).
 */
export function FAQSection({ locale, dictionary, items }: FAQSectionProps) {
  const faq = dictionary.sections.faq;

  return (
    <section className="bg-[#0f0c09] text-[#f2ece0]">
      <Container className="py-24 lg:py-28">
        {/* Cabeçalho: título à esquerda, subtítulo à direita separado por um fio */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p
              className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
              data-cms="text:sections.faq.eyebrow"
            >
              <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
              {faq.eyebrow}
            </p>
            <h2
              className="font-heading mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] tracking-tight"
              data-cms="text:sections.faq.title"
            >
              {faq.title}
            </h2>
          </div>
          <div className="flex items-center lg:border-l lg:border-[#f2ece0]/12 lg:pl-16">
            <p
              className="text-small max-w-sm leading-relaxed text-[#d8cdba]"
              data-cms="text:sections.faq.subtitle"
            >
              {faq.subtitle}
            </p>
          </div>
        </div>

        {/* Perguntas */}
        <FaqAccordion items={items} />

        {/* Fecho: ainda tem dúvidas? */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
          <span
            className="text-caption flex size-9 shrink-0 items-center justify-center rounded-full border border-[#cf5a18]/50 text-[#cf5a18]"
            aria-hidden
          >
            ?
          </span>
          <p className="text-small text-[#d8cdba]/80" data-cms="text:sections.faq.footerText">
            {faq.footerText}
          </p>
          <Link
            href={localePath(locale, "/contato")}
            className="text-caption group inline-flex items-center gap-2 border-b border-[#cf5a18]/50 pb-1 tracking-[0.18em] text-[#cf5a18] uppercase transition-colors hover:border-[#cf5a18]"
            data-cms="text:sections.faq.footerCta"
          >
            {faq.footerCta}
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}
