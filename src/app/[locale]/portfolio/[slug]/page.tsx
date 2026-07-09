import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CTASection } from "@/components/shared/cta-section";
import { Heading } from "@/components/ui/typography";
import { localePath } from "@/i18n/config";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildPageMetadata } from "@/lib/metadata";
import { placeholderProjects } from "@/lib/placeholder-projects";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function findProject(slug: string) {
  return placeholderProjects.find((project) => project.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dictionary } = await resolveLocale(params);
  const project = findProject(slug);
  if (!project) {
    notFound();
  }
  const title = `${dictionary.categories[project.category]} · ${project.city}`;
  return buildPageMetadata({
    title,
    description: dictionary.meta.project.description,
    locale,
    path: `/portfolio/${slug}`,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale, dictionary } = await resolveLocale(params);
  const project = findProject(slug);
  if (!project) {
    notFound();
  }

  const labels = dictionary.projectPage;
  const title = `${dictionary.categories[project.category]} · ${project.city}`;
  const index = placeholderProjects.indexOf(project);
  const next = placeholderProjects[(index + 1) % placeholderProjects.length];

  const info = [
    { label: labels.category, value: dictionary.categories[project.category] },
    { label: labels.city, value: project.city },
    { label: labels.year, value: String(project.year) },
    // Cliente entra quando os projetos reais chegarem via CMS.
    { label: labels.client, value: "—" },
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
            {title}
          </Heading>

          {/* Capa provisória até as imagens reais (CMS). */}
          <div
            className={cn(
              "mt-12 flex aspect-[16/9] items-center justify-center rounded-lg",
              project.coverClass
            )}
          >
            <span className="text-caption text-foreground/50 tracking-widest uppercase">
              {labels.galleryComingSoon}
            </span>
          </div>

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

          <div className="border-border mt-16 flex justify-end border-t pt-8">
            <Link
              href={localePath(locale, `/portfolio/${next.slug}`)}
              className="text-small hover:text-muted-foreground inline-flex items-center gap-2 transition-colors"
            >
              {labels.next}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </Section>
      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
