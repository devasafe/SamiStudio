import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { CTASection } from "@/components/shared/cta-section";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { localePath } from "@/i18n/config";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getProjectBySlug, getPublishedProjects } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

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
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;

  // O `cms` acompanha o rótulo: o <dt> abaixo é montado em laço e precisa saber
  // qual campo do dicionário está exibindo.
  const info = [
    {
      label: labels.category,
      cms: "text:projectPage.category",
      value: project.categoryLabel ?? "—",
    },
    { label: labels.city, cms: "text:projectPage.city", value: project.city ?? "—" },
    {
      label: labels.year,
      cms: "text:projectPage.year",
      value: project.year ? String(project.year) : "—",
    },
    { label: labels.client, cms: "text:projectPage.client", value: project.client ?? "—" },
  ];

  return (
    // flex-col + o CTA com flex-1: um projeto sem galeria deixa a página mais
    // curta que a tela, e a sobra do <main> viraria um vazio liso depois do CTA.
    <main className="flex flex-1 flex-col bg-[#141009] pt-22 text-[#f2ece0]">
      <Container>
        {/* Cabeçalho editorial: volta discreta, título grande, texto ao lado */}
        <section className="py-12 lg:py-16">
          <Link
            href={localePath(locale, "/portfolio")}
            className="text-caption group inline-flex items-center gap-2 tracking-[0.18em] text-[#cf5a18] uppercase"
          >
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden
            />
            <span data-cms="text:projectPage.back">{labels.back}</span>
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <h1 className="font-heading text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.02] tracking-tight text-balance">
              {project.title}
            </h1>
            {project.description ? (
              <div className="lg:border-l lg:border-[#f2ece0]/12 lg:pt-4 lg:pl-16">
                <p className="text-small max-w-sm leading-relaxed text-[#d8cdba]">
                  {project.description}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </Container>

      {/* Capa em largura total: a foto é o assunto da página */}
      <div
        className={cn(
          "relative flex aspect-[4/3] items-center justify-center overflow-hidden md:aspect-[21/9]",
          project.coverClass
        )}
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <span
            className="text-caption tracking-[0.22em] text-[#f2ece0]/40 uppercase"
            data-cms="text:projectPage.galleryComingSoon"
          >
            {labels.galleryComingSoon}
          </span>
        )}
      </div>

      <Container>
        {/* Ficha técnica */}
        <dl className="grid grid-cols-2 gap-8 border-b border-[#f2ece0]/10 py-12 lg:grid-cols-4">
          {info.map((item) => (
            <div key={item.label}>
              <dt
                className="text-caption tracking-[0.18em] text-[#f2ece0]/45 uppercase"
                data-cms={item.cms}
              >
                {item.label}
              </dt>
              <dd className="font-heading mt-3 text-xl">{item.value}</dd>
            </div>
          ))}
        </dl>

        {project.gallery && project.gallery.length > 0 ? (
          <div className="py-12">
            <ProjectGallery photos={project.gallery} labels={labels.lightbox} />
          </div>
        ) : null}

        {next ? (
          <div className="flex justify-end border-t border-[#f2ece0]/10 py-10">
            <Link
              href={localePath(locale, `/portfolio/${next.slug}`)}
              className="group inline-flex flex-col items-end gap-1"
            >
              <span
                className="text-caption tracking-[0.18em] text-[#f2ece0]/45 uppercase"
                data-cms="text:projectPage.next"
              >
                {labels.next}
              </span>
              <span className="font-heading flex items-center gap-3 text-2xl transition-colors group-hover:text-[#cf5a18]">
                {next.title}
                <ArrowRight
                  className="size-5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          </div>
        ) : null}
      </Container>

      <CTASection locale={locale} dictionary={dictionary} className="flex-1" />
    </main>
  );
}
