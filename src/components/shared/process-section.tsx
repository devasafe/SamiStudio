import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionTitle } from "@/components/ui/typography";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ProcessSectionProps {
  dictionary: Dictionary;
}

/**
 * Timeline do processo (Docs/03): Briefing → Modelagem → Prévia → Entrega.
 * Numeração usada porque o conteúdo é de fato uma sequência.
 */
export function ProcessSection({ dictionary }: ProcessSectionProps) {
  const process = dictionary.sections.process;

  return (
    <Section>
      <Container>
        <SectionTitle eyebrow={process.eyebrow} title={process.title} />
        <ol className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {process.steps.map((step, index) => (
            <li key={step.title} className="border-border border-t pt-6">
              <span className="text-caption text-muted-foreground font-mono">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-h4 font-heading mt-3">{step.title}</h3>
              <p className="text-small text-muted-foreground mt-3">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
