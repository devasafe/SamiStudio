import { Box, Clock, Eye, PencilRuler, Sparkles } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { CircuitBoard } from "@/components/ui/circuit-board";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ProcessSectionProps {
  dictionary: Dictionary;
}

/** Ícone de cada etapa, na ordem do processo (briefing → entrega). */
const STEP_ICONS = [PencilRuler, Box, Eye, Sparkles];

/** Trilhas decorativas ao fundo: nós discretos ligados por caminhos em ângulo
 * reto (o CircuitBoard desenha as curvas e os pulsos correndo por elas). */
const CIRCUIT_NODES = [
  { id: "a", x: 60, y: 40, size: "sm" as const },
  { id: "b", x: 320, y: 120, size: "sm" as const },
  { id: "c", x: 640, y: 40, size: "sm" as const },
  { id: "d", x: 900, y: 150, size: "sm" as const },
  { id: "e", x: 1180, y: 60, size: "sm" as const },
  { id: "f", x: 1480, y: 140, size: "sm" as const },
  { id: "g", x: 480, y: 235, size: "sm" as const },
  { id: "h", x: 1040, y: 240, size: "sm" as const },
];

const CIRCUIT_CONNECTIONS = [
  { from: "a", to: "b", animated: true },
  { from: "b", to: "c", animated: true },
  { from: "c", to: "d", animated: true },
  { from: "d", to: "e", animated: true },
  { from: "e", to: "f", animated: true },
  { from: "b", to: "g", animated: true },
  { from: "d", to: "h", animated: true },
];

/**
 * Timeline do processo (Docs/03): Briefing → Modelagem → Prévia → Entrega.
 * Numeração usada porque o conteúdo é de fato uma sequência. Editorial dark,
 * com as trilhas de circuito correndo ao fundo.
 */
export function ProcessSection({ dictionary }: ProcessSectionProps) {
  const process = dictionary.sections.process;

  return (
    <section className="relative overflow-hidden bg-[#141009] text-[#f2ece0]">
      <div
        className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center"
        aria-hidden
      >
        <CircuitBoard
          nodes={CIRCUIT_NODES}
          connections={CIRCUIT_CONNECTIONS}
          width={1600}
          height={300}
          variant="dark"
          showGrid={false}
          traceWidth={1}
          pulseSpeed={4}
          traceColor="rgba(207, 90, 24, 0.2)"
          pulseColor="rgba(207, 90, 24, 0.5)"
          nodeColor="rgba(207, 90, 24, 0.28)"
        />
      </div>

      <Container className="relative py-24 lg:py-28">
        {/* Cabeçalho */}
        <div className="text-center">
          <p
            className="text-caption inline-flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
            data-cms="text:sections.process.eyebrow"
          >
            <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
            {process.eyebrow}
          </p>
          <h2
            className="font-heading mt-5 text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.05] tracking-tight"
            data-cms="text:sections.process.title"
          >
            {process.title}
          </h2>
          <p
            className="text-small mx-auto mt-5 max-w-md leading-relaxed text-[#d8cdba]"
            data-cms="text:sections.process.subtitle"
          >
            {process.subtitle}
          </p>
        </div>

        {/* Etapas */}
        <ol className="relative mt-20 grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {process.steps.map((step, index) => {
            const Icon = STEP_ICONS[index % STEP_ICONS.length];
            return (
              <li key={step.title} className="relative flex flex-col items-center text-center">
                <span className="text-caption relative z-10 flex size-12 items-center justify-center rounded-full border border-[#cf5a18]/60 bg-[#141009] text-[#cf5a18]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-10 w-px bg-[#f2ece0]/12" aria-hidden />
                <Icon className="size-10 text-[#cf5a18]" strokeWidth={1} aria-hidden />
                <h3
                  className="font-heading mt-6 text-2xl"
                  data-cms={`text:sections.process.steps.${index}.title`}
                >
                  {step.title}
                </h3>
                {/* Duração da etapa (editável); vazia não aparece. */}
                {step.duration ? (
                  <span
                    className="text-caption mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#cf5a18]/30 px-3 py-1 tracking-[0.14em] text-[#cf5a18] uppercase"
                    data-cms={`text:sections.process.steps.${index}.duration`}
                  >
                    <Clock className="size-3" strokeWidth={1.5} aria-hidden />
                    {step.duration}
                  </span>
                ) : null}
                <span className="mt-3 h-px w-8 bg-[#cf5a18]/50" aria-hidden />
                <p
                  className="text-small mt-4 max-w-[15rem] leading-relaxed text-[#d8cdba]/80"
                  data-cms={`text:sections.process.steps.${index}.description`}
                >
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Fecho */}
        <div className="mt-20 flex items-center gap-6 border-t border-[#f2ece0]/10 pt-8">
          <span className="h-px flex-1 bg-[#f2ece0]/10" aria-hidden />
          <p className="text-caption text-center tracking-[0.2em] text-[#f2ece0]/45 uppercase">
            <span data-cms="text:sections.process.footerLead">{process.footerLead}</span>{" "}
            <span className="text-[#cf5a18]" data-cms="text:sections.process.footerEmphasis">
              {process.footerEmphasis}
            </span>
          </p>
          <span className="h-px flex-1 bg-[#f2ece0]/10" aria-hidden />
        </div>
      </Container>
    </section>
  );
}
