import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTitle } from "@/components/ui/typography";
import type { Dictionary } from "@/i18n/get-dictionary";

interface FAQSectionProps {
  dictionary: Dictionary;
}

/** FAQ em accordion (Docs/03): eliminar dúvidas antes do CTA. */
export function FAQSection({ dictionary }: FAQSectionProps) {
  const faq = dictionary.sections.faq;

  return (
    <Section>
      <Container className="max-w-4xl">
        <SectionTitle eyebrow={faq.eyebrow} title={faq.title} align="center" />
        <Accordion className="mt-16">
          {faq.items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-body font-heading py-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-small text-muted-foreground pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}
