import { Box, Building2, Camera, PencilRuler, Sparkles } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/typography";
import type { Dictionary } from "@/i18n/get-dictionary";

// Mesma ordem dos itens do dicionário (Docs/01).
const serviceIcons = [Box, Camera, Building2, PencilRuler, Sparkles];

interface ServicesSectionProps {
  dictionary: Dictionary;
}

/** Seção Serviços da home (Docs/03): responder rápido "ela faz o que preciso?". */
export function ServicesSection({ dictionary }: ServicesSectionProps) {
  const services = dictionary.sections.services;

  return (
    <Section className="bg-surface">
      <Container>
        <SectionTitle
          eyebrow={services.eyebrow}
          title={services.title}
          subtitle={services.subtitle}
        />
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.items.map((service, index) => {
            const Icon = serviceIcons[index] ?? Box;
            return (
              <Card key={service.title} className="bg-background border-0 shadow-none">
                <CardContent>
                  <Icon className="text-foreground size-7" strokeWidth={1.5} aria-hidden />
                  <h3 className="text-h4 font-heading mt-6">{service.title}</h3>
                  <p className="text-small text-muted-foreground mt-3">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
