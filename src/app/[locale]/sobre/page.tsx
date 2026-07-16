import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { CircularBadge } from "@/components/shared/circular-badge";
import { CTASection } from "@/components/shared/cta-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { localePath } from "@/i18n/config";
import { safeImageUrl } from "@/lib/images";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/settings";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Âncora do "Conheça nossa história" (leva à seção da fundadora). */
const FOUNDER_ANCHOR = "fundadora";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.about.title,
    description: dictionary.meta.about.description,
    locale,
    path: "/sobre",
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const settings = await getSiteSettings();
  const page = dictionary.aboutPage;
  const about = dictionary.sections.about;

  // Assinatura e números vêm das Configurações; vazio cai no dicionário.
  const pick = (custom: string | undefined, fallback: string) =>
    custom && custom.trim() ? custom : fallback;
  const founder = pick(settings?.founderName, about.founder);
  const firstName = founder.split(" ")[0];
  const stats = about.stats.map((stat, index) => {
    const values = [settings?.stat1Value, settings?.stat2Value, settings?.stat3Value];
    const labels = [settings?.stat1Label, settings?.stat2Label, settings?.stat3Label];
    return { value: pick(values[index], stat.value), label: pick(labels[index], stat.label) };
  });

  const portrait = safeImageUrl(settings?.aboutPhoto);
  const essences = page.values.slice(0, 2);
  const essencePhotos = [
    safeImageUrl(settings?.essencePhoto1),
    safeImageUrl(settings?.essencePhoto2),
  ];

  return (
    <main className="flex-1 bg-[#141009] text-[#f2ece0]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-22">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <Container className="py-16 lg:py-24">
            <p className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase">
              <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
              {page.heroEyebrow}
            </p>
            <h1 className="font-heading mt-6 text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] tracking-tight text-balance">
              {page.heroTitleLead}{" "}
              <span className="text-[#cf5a18] italic">{page.heroTitleEmphasis}</span>
            </h1>
            <p className="text-small mt-7 max-w-md leading-relaxed text-[#d8cdba]">
              {page.heroText}
            </p>
            <Link
              href={`#${FOUNDER_ANCHOR}`}
              className="text-caption group mt-10 inline-flex items-center gap-3 tracking-[0.18em] text-[#cf5a18] uppercase"
            >
              {page.heroCta}
              <ArrowDown
                className="size-4 transition-transform duration-300 group-hover:translate-y-1"
                aria-hidden
              />
            </Link>
          </Container>

          <div className="relative h-[26rem] lg:h-[38rem]">
            {portrait ? (
              <Image
                src={portrait}
                alt={founder}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
                style={{
                  maskImage:
                    "radial-gradient(ellipse 88% 92% at 55% 45%, #000 55%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 88% 92% at 55% 45%, #000 55%, transparent 100%)",
                }}
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* Fundadora */}
      <section id={FOUNDER_ANCHOR} className="relative overflow-hidden bg-[#0f0c09]">
        <CircularBadge
          id="about-page-badge"
          label={about.badge}
          className="absolute top-24 -left-10 hidden size-32 opacity-40 lg:block"
        />
        <Container className="py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr_0.7fr] lg:gap-14">
            {/* Saudação + assinatura */}
            <div>
              <p className="text-caption tracking-[0.22em] text-[#f2ece0]/45 uppercase">
                {page.founderEyebrow}
              </p>
              <h2 className="font-heading mt-5 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[1.1] tracking-tight">
                {page.founderGreeting} {firstName}.
              </h2>
              <p className="mt-6 [font-family:var(--font-signature)] text-3xl leading-none text-[#f2ece0]/80">
                {firstName}
              </p>
            </div>

            {/* História */}
            <div className="space-y-5 lg:pt-2">
              {page.founderParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-small max-w-md leading-relaxed text-[#d8cdba]">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Números */}
            <dl className="space-y-8 lg:border-l lg:border-[#f2ece0]/12 lg:pl-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-heading text-[clamp(2rem,3.4vw,2.8rem)] leading-none">
                    {stat.value}
                  </dt>
                  <dd className="text-caption mt-2 tracking-[0.18em] text-[#f2ece0]/50 uppercase">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Nossa essência */}
      <section className="grid lg:grid-cols-3">
        {/* Foto 1 (essência 01) */}
        <EssenceCard index={0} photo={essencePhotos[0]} item={essences[0]} />

        {/* Texto central */}
        <div className="bg-[#141009] px-6 py-16 lg:px-12 lg:py-24">
          <p className="text-caption tracking-[0.22em] text-[#f2ece0]/45 uppercase">
            {page.essenceEyebrow}
          </p>
          <h2 className="font-heading mt-6 text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.08] tracking-tight">
            {page.essenceTitleLead}{" "}
            <span className="text-[#cf5a18] italic">{page.essenceTitleEmphasis}</span>
          </h2>
          <span className="mt-8 block h-px w-10 rotate-[-35deg] bg-[#cf5a18]/70" aria-hidden />
          <p className="text-small mt-8 max-w-xs leading-relaxed text-[#d8cdba]">
            {page.essenceText}
          </p>
          <Link
            href={localePath(locale, "/servicos")}
            className="text-caption group mt-10 inline-flex items-center gap-2 tracking-[0.18em] text-[#cf5a18] uppercase"
          >
            {page.essenceCta}
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </div>

        {/* Foto 2 (essência 02) */}
        <EssenceCard index={1} photo={essencePhotos[1]} item={essences[1]} />
      </section>

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}

interface EssenceCardProps {
  index: number;
  photo?: string;
  item?: { title: string; description: string };
}

/** Foto da essência com o número e o texto sobrepostos na base. */
function EssenceCard({ index, photo, item }: EssenceCardProps) {
  if (!item) {
    return null;
  }
  return (
    <div className="relative min-h-[26rem] bg-[#1c1611] lg:min-h-[34rem]">
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c09] via-[#0f0c09]/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
        <div className="flex items-baseline gap-4">
          <span className="text-caption text-[#cf5a18]">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="text-caption tracking-[0.16em] uppercase">{item.title}</h3>
        </div>
        <p className="text-small mt-3 max-w-xs leading-relaxed text-[#d8cdba]/75">
          {item.description}
        </p>
      </div>
    </div>
  );
}
