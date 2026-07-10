import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/typography";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface AboutSectionProps {
  locale: Locale;
  dictionary: Dictionary;
  /** Foto da Sami cadastrada nas Configurações (CMS). */
  photo?: string;
}

/** Seção Sobre da home (Docs/03): humanizar e criar autoridade. */
export function AboutSection({ locale, dictionary, photo }: AboutSectionProps) {
  const about = dictionary.sections.about;

  return (
    <Section>
      <Container>
        <Grid className="items-center">
          <div className="relative col-span-4 aspect-[4/5] overflow-hidden rounded-lg bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 md:col-span-4 lg:col-span-5">
            {photo ? (
              <Image
                src={photo}
                alt={about.title}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7">
            <SectionTitle eyebrow={about.eyebrow} title={about.title} subtitle={about.text} />
            <Link
              href={localePath(locale, "/sobre")}
              className={`${buttonVariants({ variant: "outline", size: "xl" })} mt-10`}
            >
              {about.cta}
            </Link>
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
