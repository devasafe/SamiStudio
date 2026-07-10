/**
 * Timeline da narrativa do Hero (Docs/14, adaptada para interior reveal):
 * o ambiente nasce como linhas técnicas, ganha casca, mobiliário,
 * detalhes e por fim a atmosfera do render final.
 */
export const phases = {
  /** Reservado (formato vinheta não tem fase de linhas). */
  blueprint: { from: 0.0, to: 0.02 },
  /** Reservado (sem casca no formato vinheta). */
  shell: { from: 0.02, to: 0.1 },
  /** Mobiliário principal aparece em sequência. */
  furniture: { from: 0.1, to: 0.17 },
  /** Detalhes: tapete, luminária, plantas. */
  details: { from: 0.15, to: 0.22 },
  /** Acabamento. */
  render: { from: 0.17, to: 0.22 },
} as const;

/**
 * Fim da montagem: a vinheta aparece na transição hero → Sobre e está
 * completa quando a seção assenta. Depois entra o modo interativo.
 */
export const ASSEMBLY_END = phases.details.to;

/**
 * Finale (decisão do cliente, 2026-07-10): na transição para o CTA,
 * a câmera recentraliza e o 3D dissolve na foto renderizada real —
 * "From Blueprint to Reality" literal.
 */
export const FINALE = { from: 0.86, to: 0.97 } as const;

export type PhaseName = keyof typeof phases;
