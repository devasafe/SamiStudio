import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { serviceIcon } from "@/components/services/service-icon";
import { CircularBadge } from "@/components/shared/circular-badge";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ServiceItem } from "@/lib/content";

interface ServicesSectionProps {
  locale: Locale;
  dictionary: Dictionary;
  items: ServiceItem[];
}

/** Recorte diagonal — a mesma forma serve para o fio da borda e para a foto. */
const CLIP = "polygon(25% 0, 100% 0, 100% 86%, 88% 100%, 0 100%)";
const SERVICES_IMAGE = "/images/hero-render-final.webp";

/**
 * Seção Serviços da home (Docs/03): responder rápido "ela faz o que preciso?".
 * Editorial dark — título serifado com destaque em terracota, foto com recorte
 * diagonal e selo, e os serviços em colunas numeradas.
 */
export function ServicesSection({ locale, dictionary, items }: ServicesSectionProps) {
  const services = dictionary.sections.services;

  return (
    <section className="relative overflow-hidden bg-[#0f0c09] text-[#f2ece0]">
      <Container className="py-24 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          {/* Chamada */}
          <div className="max-w-lg">
            <p className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase">
              <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
              {services.eyebrow}
            </p>
            <h2 className="font-heading mt-6 text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.02] tracking-tight text-balance">
              {services.titleLead}{" "}
              <span className="text-[#cf5a18] italic">{services.titleEmphasis}</span>
            </h2>
            <p className="text-small mt-6 max-w-sm leading-relaxed text-[#d8cdba]">
              {services.subtitle}
            </p>
            <Link
              href={localePath(locale, "/servicos")}
              className="text-caption group mt-9 inline-flex items-center gap-4 border border-[#cf5a18]/50 px-7 py-4 tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[#cf5a18] hover:text-[#0f0c09]"
            >
              {services.viewAll}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>

          {/* Foto com recorte diagonal (o wrapper vira o fio da borda) + selo */}
          <div className="relative">
            <div className="bg-[#cf5a18]/45 p-px" style={{ clipPath: CLIP }}>
              <div className="relative aspect-[16/10]" style={{ clipPath: CLIP }}>
                <Image
                  src={SERVICES_IMAGE}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#0f0c09]/25" />
              </div>
            </div>
            <CircularBadge
              id="services-badge-ring"
              label={services.eyebrow}
              className="absolute right-2 bottom-6 hidden size-24 rounded-full bg-[#0f0c09]/70 backdrop-blur-sm lg:block"
            />
          </div>
        </div>

        {/* Serviços em colunas numeradas */}
        <div className="mt-20 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-y-0">
          {items.map((service, index) => {
            const Icon = serviceIcon(service.icon, index);
            return (
              <div
                key={service.title}
                className="border-[#f2ece0]/10 sm:px-6 lg:border-l lg:first:border-l-0 lg:first:pl-0"
              >
                <Icon className="size-9 text-[#cf5a18]" strokeWidth={1} aria-hidden />
                <h3 className="text-caption mt-8 leading-relaxed tracking-[0.14em] uppercase">
                  {service.title}
                </h3>
                <p className="text-small mt-4 leading-relaxed text-[#d8cdba]/75">
                  {service.description}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="text-caption text-[#cf5a18]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-[#cf5a18]/35" aria-hidden />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
