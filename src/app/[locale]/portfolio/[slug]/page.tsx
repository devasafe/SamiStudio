import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CircleCheck,
  Frame,
  MapPin,
  User,
} from "@/components/icons";
import { Container } from "@/components/layout/container";
import { CTASection } from "@/components/shared/cta-section";
import { BeforeAfter } from "@/components/portfolio/before-after";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { ProjectTabs, type ProjectTab } from "@/components/portfolio/project-tabs";
import { localePath, type Locale } from "@/i18n/config";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getProjectBySlug, getPublishedProjects } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/project";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dictionary } = await resolveLocale(params);
  const project = await getProjectBySlug(slug, locale, dictionary);
  if (!project) {
    notFound();
  }
  return buildPageMetadata({
    title: project.title,
    description: project.description ?? dictionary.meta.project.description,
    locale,
    path: `/portfolio/${slug}`,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale, dictionary } = await resolveLocale(params);
  const project = await getProjectBySlug(slug, locale, dictionary);
  if (!project) {
    notFound();
  }

  const labels = dictionary.projectPage;
  const all = await getPublishedProjects(locale, dictionary);
  const index = all.findIndex((item) => item.slug === project.slug);
  // Anterior e próximo dão a volta na lista: do último se chega ao primeiro.
  const previous = all.length > 1 ? all[(index - 1 + all.length) % all.length] : null;
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;

  const stageLabel = project.stage
    ? { concept: labels.stageConcept, inProgress: labels.stageInProgress, done: labels.stageDone }[
        project.stage
      ]
    : undefined;

  // A linha do topo mostra só o que o projeto tem — campo vazio não vira "—".
  const meta = [
    { icon: Building2, value: project.categoryLabel },
    { icon: Calendar, value: project.year ? String(project.year) : undefined },
  ].filter((item): item is { icon: typeof Building2; value: string } => Boolean(item.value));

  // A barra da ficha, abaixo do conteúdo. A categoria não entra: já está na
  // linha do topo, e repetir gastaria uma coluna à toa.
  const details = [
    { icon: User, label: labels.client, value: project.client, cms: "text:projectPage.client" },
    { icon: MapPin, label: labels.city, value: project.city, cms: "text:projectPage.city" },
    {
      icon: Frame,
      label: labels.area,
      value: project.area ? `${project.area} m²` : undefined,
      cms: "text:projectPage.area",
    },
    {
      icon: Calendar,
      label: labels.year,
      value: project.year ? String(project.year) : undefined,
      cms: "text:projectPage.year",
    },
    { icon: CircleCheck, label: labels.stage, value: stageLabel, cms: "text:projectPage.stage" },
  ].filter((item) => item.value);

  const cover = project.coverImage ? (
    <div className={cn("relative aspect-[21/9] overflow-hidden rounded-lg", project.coverClass)}>
      <Image
        src={project.coverImage}
        alt={project.title}
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
    </div>
  ) : null;

  // Aba que abriria vazia não entra: a lista é montada com o que existe.
  const tabs: ProjectTab[] = [
    ...(cover ? [{ id: "overview", label: labels.tabOverview, content: cover }] : []),
    ...(project.gallery && project.gallery.length > 0
      ? [
          {
            id: "images",
            label: labels.tabImages,
            content: <ProjectGallery photos={project.gallery} labels={labels.lightbox} />,
          },
        ]
      : []),
    ...(project.beforeAfter && project.beforeAfter.length > 0
      ? [
          {
            id: "before-after",
            label: labels.beforeAfterTitle,
            content: (
              <BeforeAfter
                items={project.beforeAfter}
                labels={{ before: labels.before, after: labels.after, hint: labels.dragHint }}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <main className="flex flex-1 flex-col bg-[#141009] pt-22 text-[#f2ece0]">
      <Container>
        <section className="py-10 lg:py-12">
          <Link
            href={localePath(locale, "/portfolio")}
            className="text-small group inline-flex items-center gap-2 text-[#d8cdba] transition-colors hover:text-[#f2ece0]"
          >
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden
            />
            <span data-cms="text:projectPage.back">{labels.back}</span>
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h1 className="font-heading text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.02] tracking-tight text-balance">
                {project.title}
              </h1>

              {/* Ficha rápida numa linha só, como na referência */}
              {meta.length > 0 || stageLabel ? (
                <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {meta.map((item) => (
                    <li
                      key={item.value}
                      className="text-small flex items-center gap-2 text-[#d8cdba]"
                    >
                      <item.icon
                        className="size-4 text-[#f2ece0]/45"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {item.value}
                    </li>
                  ))}
                  {stageLabel ? (
                    <li className="text-small flex items-center gap-2 text-[#d8cdba]">
                      <span className="size-1.5 rounded-full bg-[#7fae6a]" aria-hidden />
                      {stageLabel}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>

            {project.description ? (
              <p className="text-small leading-relaxed text-[#d8cdba] lg:pt-3">
                {project.description}
              </p>
            ) : null}
          </div>
        </section>

        <ProjectTabs tabs={tabs} />

        {/* Ficha em barra, logo abaixo do conteúdo */}
        {details.length > 0 ? (
          <dl className="mt-6 grid grid-cols-2 gap-8 rounded-xl border border-[#f2ece0]/10 p-6 sm:grid-cols-3 lg:grid-cols-5">
            {details.map((item) => (
              <DetailItem key={item.label} {...item} />
            ))}
          </dl>
        ) : null}

        {/* Anterior e próximo na mesma barra, com a capa de cada um */}
        {previous || next ? (
          <nav className="mt-4 flex items-center gap-4 rounded-xl border border-[#f2ece0]/10 p-3">
            {previous ? (
              <NeighborLink
                project={previous}
                locale={locale}
                label={labels.previous}
                cms="text:projectPage.previous"
                direction="prev"
              />
            ) : (
              <span className="flex-1" />
            )}
            <span className="h-10 w-px shrink-0 bg-[#f2ece0]/10" aria-hidden />
            {next ? (
              <NeighborLink
                project={next}
                locale={locale}
                label={labels.next}
                cms="text:projectPage.next"
                direction="next"
              />
            ) : (
              <span className="flex-1" />
            )}
          </nav>
        ) : null}
      </Container>

      <CTASection locale={locale} dictionary={dictionary} className="flex-1" />
    </main>
  );
}

interface DetailItemProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  cms: string;
}

function DetailItem({ icon: Icon, label, value, cms }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-5 shrink-0 text-[#f2ece0]/40" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0">
        <dt className="text-caption tracking-[0.16em] text-[#f2ece0]/45 uppercase" data-cms={cms}>
          {label}
        </dt>
        <dd className="text-small mt-1 truncate text-[#f2ece0]">{value}</dd>
      </div>
    </div>
  );
}

interface NeighborLinkProps {
  project: PortfolioItem;
  locale: Locale;
  label: string;
  cms: string;
  direction: "prev" | "next";
}

/** Vizinho na lista, com a capa: só o nome não diz para onde se vai. */
function NeighborLink({ project, locale, label, cms, direction }: NeighborLinkProps) {
  const isNext = direction === "next";
  const Arrow = isNext ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={localePath(locale, `/portfolio/${project.slug}`)}
      className={cn(
        "group flex min-w-0 flex-1 items-center gap-4 rounded-lg p-2 transition-colors hover:bg-[#f2ece0]/5",
        isNext && "flex-row-reverse text-right"
      )}
    >
      <Arrow
        className={cn(
          "size-4 shrink-0 text-[#f2ece0]/45 transition-transform duration-300",
          isNext ? "group-hover:translate-x-1" : "group-hover:-translate-x-1"
        )}
        aria-hidden
      />
      <span className="relative hidden size-14 shrink-0 overflow-hidden rounded bg-[#221a13] sm:block">
        {project.coverImage ? (
          <Image src={project.coverImage} alt="" fill sizes="56px" className="object-cover" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-caption block text-[#f2ece0]/45" data-cms={cms}>
          {label}
        </span>
        <span className="font-heading block truncate text-lg transition-colors group-hover:text-[#cf5a18]">
          {project.title}
        </span>
      </span>
    </Link>
  );
}
