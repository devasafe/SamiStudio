import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { serviceIcon } from "@/components/services/service-icon";
import { CircularBadge } from "@/components/shared/circular-badge";
import { CTASection } from "@/components/shared/cta-section";
import { ProcessSection } from "@/components/shared/process-section";
import { localePath } from "@/i18n/config";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getServices } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Recorte diagonal da foto do hero (mesma linguagem da seção Serviços da home). */
const CLIP = "polygon(18% 0, 100% 0, 100% 100%, 0 100%)";
const HERO_IMAGE = "/images/hero-render-final.webp";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.services.title,
    description: dictionary.meta.services.description,
    locale,
    path: "/servicos",
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const items = await getServices(locale, dictionary);
  const services = dictionary.sections.services;

  return (
    <main className="flex-1 bg-[#141009] text-[#f2ece0]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-22">
        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-0">
          <Container className="py-16 lg:py-24">
            <p
              className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
              data-cms="text:sections.services.eyebrow"
            >
              <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
              {services.eyebrow}
            </p>
            <h1 className="font-heading mt-6 text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] tracking-tight text-balance">
              <span data-cms="text:sections.services.titleLead">{services.titleLead}</span>{" "}
              <span
                className="text-[#cf5a18] italic"
                data-cms="text:sections.services.titleEmphasis"
              >
                {services.titleEmphasis}
              </span>
            </h1>
            <p
              className="text-small mt-7 max-w-sm leading-relaxed text-[#d8cdba]"
              data-cms="text:sections.services.subtitle"
            >
              {services.subtitle}
            </p>
            <Link
              href={localePath(locale, "/contato")}
              className="text-caption group mt-10 inline-flex items-center gap-5 tracking-[0.18em] text-[#cf5a18] uppercase"
              data-cms="text:sections.services.heroCta"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-[#cf5a18]/50 transition-colors duration-300 group-hover:bg-[#cf5a18] group-hover:text-[#0f0c09]">
                <ArrowRight className="size-4" aria-hidden />
              </span>
              {services.heroCta}
            </Link>
          </Container>

          {/* Foto com recorte diagonal + cartão sobreposto */}
          <div className="relative">
            <div className="relative aspect-[16/10]" style={{ clipPath: CLIP }}>
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-[#141009]/25" />
            </div>
            <div className="border-[#f2ece0]/12 bg-[#0f0c09]/85 p-6 backdrop-blur-sm lg:absolute lg:right-8 lg:bottom-8 lg:max-w-64 lg:border">
              <Sparkles className="size-5 text-[#cf5a18]" strokeWidth={1} aria-hidden />
              <h2
                className="text-caption mt-5 leading-relaxed tracking-[0.14em] uppercase"
                data-cms="text:sections.services.heroCardTitle"
              >
                {services.heroCardTitle}
              </h2>
              <p
                className="text-small mt-3 leading-relaxed text-[#d8cdba]/75"
                data-cms="text:sections.services.heroCardText"
              >
                {services.heroCardText}
              </p>
            </div>
          </div>
        </div>

        {/* Fio com a numeração de abertura */}
        <div className="flex items-center gap-4 px-6 pb-2">
          <span className="text-caption text-[#f2ece0]/35">01</span>
          <span className="h-px flex-1 bg-[#f2ece0]/10" aria-hidden />
        </div>
      </section>

      {/* Serviços em cartões */}
      <section className="pt-10 pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-px bg-[#f2ece0]/10 sm:grid-cols-2 lg:grid-cols-5">
            {items.map((service, index) => {
              const Icon = serviceIcon(service.icon, index);
              return (
                <article key={service.title} className="flex flex-col bg-[#141009]">
                  <div className="p-6">
                    <span className="text-caption text-[#cf5a18]/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon className="mt-6 size-8 text-[#cf5a18]" strokeWidth={1} aria-hidden />
                    <h3 className="text-caption mt-6 leading-relaxed tracking-[0.14em] uppercase">
                      {service.title}
                    </h3>
                    <p className="text-small mt-4 leading-relaxed text-[#d8cdba]/75">
                      {service.description}
                    </p>
                  </div>
                  {/* Capa cadastrada no painel; sem foto, o cartão fecha no texto. */}
                  {service.coverImage ? (
                    <div className="relative mt-auto aspect-[4/3]">
                      <Image
                        src={service.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {/* Fecho: cada projeto é único */}
          <div className="mt-px border border-[#f2ece0]/10 p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
              <CircularBadge
                id="services-page-badge"
                label={services.eyebrow}
                className="hidden size-16 shrink-0 lg:block"
              />
              <h2 className="font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight tracking-tight text-balance lg:flex-1">
                <span data-cms="text:sections.services.ctaLead">{services.ctaLead}</span>{" "}
                <span
                  className="text-[#cf5a18] italic"
                  data-cms="text:sections.services.ctaEmphasis"
                >
                  {services.ctaEmphasis}
                </span>
              </h2>
              <p
                className="text-small max-w-xs leading-relaxed text-[#d8cdba]/75"
                data-cms="text:sections.services.ctaText"
              >
                {services.ctaText}
              </p>
              <Link
                href={localePath(locale, "/contato")}
                className="text-caption group inline-flex shrink-0 items-center justify-center gap-4 border border-[#cf5a18]/50 px-7 py-4 tracking-[0.18em] text-[#cf5a18] uppercase transition-colors duration-300 hover:bg-[#cf5a18] hover:text-[#0f0c09]"
                data-cms="text:sections.services.ctaButton"
              >
                {services.ctaButton}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Como funciona */}
      <ProcessSection dictionary={dictionary} />

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
