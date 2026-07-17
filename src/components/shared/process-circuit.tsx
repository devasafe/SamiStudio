"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const STROKE = "#cf5a18";
/** Comprimento aproximado de cada trecho, para o dash do pulso. */
const SEGMENT_LEN = 400;

interface ProcessCircuitProps {
  /** Quantidade de etapas (as bolinhas numeradas ficam nos centros das colunas). */
  steps: number;
  className?: string;
}

/**
 * Trilhas de circuito que ligam as bolinhas numeradas do processo (01 → 02 →
 * …), com um pulso de luz correndo por elas e "chegando" em cada etapa. Só faz
 * sentido no layout horizontal (desktop), onde as etapas ficam lado a lado; nas
 * telas menores as etapas empilham e este circuito é escondido pelo consumidor.
 *
 * O SVG estica na horizontal (preserveAspectRatio="none") para os pontos
 * baterem com os centros das colunas do grid; `vectorEffect=non-scaling-stroke`
 * mantém a espessura do traço constante apesar do esticamento, e a altura fixa
 * (viewBox 1:1 na vertical) evita distorcer as quinas.
 */
export function ProcessCircuit({ steps, className }: ProcessCircuitProps) {
  const reduce = useReducedMotion();
  const width = 1000;
  const height = 60;
  const y = 24; // centro vertical das bolinhas (size-12 = 48px de altura)

  // Centro de cada coluna do grid, em unidades do viewBox.
  const xs = Array.from({ length: steps }, (_, i) => ((i + 0.5) / steps) * width);

  // Um trecho por par de bolinhas vizinhas, com uma quina (degrau) no meio do
  // vão que alterna para cima/baixo — o charme de placa de circuito.
  const segments = xs.slice(0, -1).map((x1, i) => {
    const x2 = xs[i + 1];
    const mid = (x1 + x2) / 2;
    const drop = i % 2 === 0 ? 14 : -14;
    return `M ${x1} ${y} H ${mid - 44} V ${y + drop} H ${mid + 44} V ${y} H ${x2}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      {segments.map((d, i) => (
        <g key={d}>
          {/* Trilha base, sempre visível. */}
          <path
            d={d}
            fill="none"
            stroke={STROKE}
            strokeOpacity={0.22}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Pulso de luz correndo de uma bolinha à próxima, em sequência. */}
          {!reduce ? (
            <motion.path
              d={d}
              fill="none"
              stroke={STROKE}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: `drop-shadow(0 0 4px ${STROKE})` }}
              strokeDasharray={`${SEGMENT_LEN * 0.12} ${SEGMENT_LEN * 0.88}`}
              initial={{ strokeDashoffset: SEGMENT_LEN }}
              animate={{ strokeDashoffset: -SEGMENT_LEN }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
