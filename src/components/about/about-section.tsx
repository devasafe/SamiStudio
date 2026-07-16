import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { CircularBadge } from "@/components/shared/circular-badge";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/** Valores editáveis no painel (Configurações); vazios caem no dicionário. */
export interface AboutOverrides {
  founder?: string;
  role?: string;
  stats?: Array<{ value?: string; label?: string }>;
}

interface AboutSectionProps {
  locale: Locale;
  dictionary: Dictionary;
  /** Foto da Sami cadastrada nas Configurações (CMS). */
  photo?: string;
  /** Assinatura e números vindos das Configurações. */
  overrides?: AboutOverrides;
}

/** Usa o valor do painel quando preenchido; senão, o do dicionário. */
const pick = (custom: string | undefined, fallback: string) =>
  custom && custom.trim() ? custom : fallback;

/**
 * Seção Sobre da home (Docs/03): humanizar e criar autoridade. Editorial dark —
 * título serifado com destaque em terracota, retrato, assinatura manuscrita da
 * fundadora, selo circular e uma barra de números.
 */
export function AboutSection({ locale, dictionary, photo, overrides }: AboutSectionProps) {
  const about = dictionary.sections.about;
  const founder = pick(overrides?.founder, about.founder);
  const role = pick(overrides?.role, about.role);
  const stats = about.stats.map((stat, index) => ({
    value: pick(overrides?.stats?.[index]?.value, stat.value),
    label: pick(overrides?.stats?.[index]?.label, stat.label),
  }));

  return (
    <section className="relative overflow-hidden bg-[#141009] text-[#f2ece0]">
      <Container className="py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Coluna de texto */}
          <div className="relative z-10 max-w-xl">
            <p
              className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
              data-cms="text:sections.about.eyebrow"
            >
              <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
              {about.eyebrow}
            </p>
            <h2 className="font-heading mt-6 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] tracking-tight text-balance">
              <span data-cms="text:sections.about.titleLead">{about.titleLead}</span>{" "}
              <span className="text-[#cf5a18] italic" data-cms="text:sections.about.titleEmphasis">
                {about.titleEmphasis}
              </span>
            </h2>
            <p
              className="text-small mt-7 max-w-md leading-relaxed text-[#d8cdba]"
              data-cms="text:sections.about.text"
            >
              {about.text}
            </p>
            <Link
              href={localePath(locale, "/sobre")}
              className="text-caption group mt-9 inline-flex items-center gap-3 rounded-md border border-[#f2ece0]/30 px-7 py-3.5 tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[#f2ece0] hover:text-[#141009]"
              data-cms="text:sections.about.cta"
            >
              {about.cta}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <div className="mt-12">
              <p className="[font-family:var(--font-signature)] text-4xl leading-none text-[#cf5a18]">
                {founder}
              </p>
              <p className="text-caption mt-2 tracking-[0.18em] text-[#f2ece0]/60 uppercase">
                {role}
              </p>
            </div>
          </div>

          {/* Retrato + selo — bordas dissolvidas no fundo (teste de design) */}
          <div className="relative">
            <div className="relative aspect-[4/5]">
              {photo ? (
                <Image
                  src={photo}
                  alt={founder}
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                  style={{
                    maskImage:
                      "radial-gradient(ellipse 82% 90% at 50% 42%, #000 50%, transparent 100%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 82% 90% at 50% 42%, #000 50%, transparent 100%)",
                  }}
                />
              ) : null}
            </div>
            <CircularBadge
              id="about-badge-ring"
              label={about.badge}
              className="absolute -bottom-8 -left-8 hidden size-28 rounded-full border border-[#f2ece0]/10 bg-[#141009]/85 backdrop-blur-sm lg:block"
            />
          </div>
        </div>

        {/* Barra de números */}
        <dl className="mt-16 grid grid-cols-1 divide-y divide-[#f2ece0]/12 border-t border-[#f2ece0]/12 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <dt className="font-heading text-[clamp(2rem,4vw,3rem)] leading-none">
                {stat.value}
              </dt>
              <dd className="text-caption mt-3 tracking-[0.18em] text-[#f2ece0]/55 uppercase">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
