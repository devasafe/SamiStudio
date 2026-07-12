import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CTASection } from "@/components/shared/cta-section";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { Heading, Paragraph } from "@/components/ui/typography";
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

  const info = [
    { label: labels.category, value: project.categoryLabel ?? "—" },
    { label: labels.city, value: project.city ?? "—" },
    { label: labels.year, value: project.year ? String(project.year) : "—" },
    { label: labels.client, value: project.client ?? "—" },
  ];

  return (
    <main className="flex-1 pt-22">
      <Section>
        <Container>
          <Link
            href={localePath(locale, "/portfolio")}
            className="text-small text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {labels.back}
          </Link>
          <Heading level={1} className="mt-8">
            {project.title}
          </Heading>
          {project.description ? (
            <Paragraph size="lg" className="mt-6 max-w-2xl">
              {project.description}
            </Paragraph>
          ) : null}

          <div
            className={cn(
              "bg-muted relative mt-12 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg md:aspect-[16/9]",
              project.coverClass
            )}
          >
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-caption text-foreground/50 tracking-widest uppercase">
                {labels.galleryComingSoon}
              </span>
            )}
          </div>

          {project.gallery && project.gallery.length > 0 ? (
            <div className="mt-12">
              <ProjectGallery photos={project.gallery} labels={labels.lightbox} />
            </div>
          ) : null}

          <dl className="border-border mt-12 grid grid-cols-2 gap-8 border-t pt-8 lg:grid-cols-4">
            {info.map((item) => (
              <div key={item.label}>
                <dt className="text-caption text-muted-foreground tracking-widest uppercase">
                  {item.label}
                </dt>
                <dd className="text-body mt-2">{item.value}</dd>
              </div>
            ))}
          </dl>

          {next ? (
            <div className="border-border mt-16 flex justify-end border-t pt-8">
              <Link
                href={localePath(locale, `/portfolio/${next.slug}`)}
                className="text-small hover:text-muted-foreground inline-flex items-center gap-2 transition-colors"
              >
                {labels.next}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </Container>
      </Section>
      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
