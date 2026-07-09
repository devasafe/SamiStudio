import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/typography";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface CTASectionProps {
  locale: Locale;
  dictionary: Dictionary;
}

/** CTA final (Docs/06): uma única ação, continuação natural da navegação. */
export function CTASection({ locale, dictionary }: CTASectionProps) {
  const cta = dictionary.sections.cta;

  return (
    <Section className="bg-surface">
      <Container className="flex flex-col items-center text-center">
        <Heading level={2} className="max-w-2xl">
          {cta.title}
        </Heading>
        <p className="text-body-lg text-muted-foreground mt-6 max-w-xl">{cta.subtitle}</p>
        <Link
          href={localePath(locale, "/contato")}
          className={`${buttonVariants({ variant: "default", size: "xl" })} mt-10`}
        >
          {cta.button}
        </Link>
      </Container>
    </Section>
  );
}
