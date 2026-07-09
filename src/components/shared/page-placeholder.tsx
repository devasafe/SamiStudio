import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

interface PagePlaceholderProps {
  title: string;
  description: string;
  note: string;
}

/**
 * Conteúdo provisório das páginas até a implementação das seções (FASE 5).
 */
export function PagePlaceholder({ title, description, note }: PagePlaceholderProps) {
  return (
    // pt-22 compensa a navbar fixa de 88px.
    <main className="flex-1 pt-22">
      <Section>
        <Container>
          <h1 className="text-h1">{title}</h1>
          <p className="text-body text-muted-foreground mt-6 max-w-2xl">{description}</p>
          <p className="text-caption text-muted-foreground mt-16">{note}</p>
        </Container>
      </Section>
    </main>
  );
}
