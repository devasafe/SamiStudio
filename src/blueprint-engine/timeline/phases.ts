/**
 * Timeline da narrativa do Hero (Docs/14, adaptada para interior reveal):
 * o ambiente nasce como linhas técnicas, ganha casca, mobiliário,
 * detalhes e por fim a atmosfera do render final.
 */
export const phases = {
  /** Reservado. */
  blueprint: { from: 0.0, to: 0.02 },
  /** Reservado. */
  shell: { from: 0.02, to: 0.1 },
  /**
   * A casa se monta bloco a bloco ao longo das seções (decisão do
   * cliente, 2026-07-10): começa ao sair do hero e conclui no meio
   * da jornada — a montagem É o espetáculo.
   */
  furniture: { from: 0.1, to: 0.6 },
  /** Reservado (a casa é um único conjunto de blocos). */
  details: { from: 0.55, to: 0.62 },
  /** Aquecimento da luz no fim da montagem. */
  render: { from: 0.55, to: 0.62 },
} as const;

/** Fim da montagem: depois disso entra o modo interativo (hover). */
export const ASSEMBLY_END = phases.render.to;

/**
 * Finale (decisão do cliente, 2026-07-10): na transição para o CTA,
 * a câmera recentraliza e o 3D dissolve na foto renderizada real —
 * "From Blueprint to Reality" literal.
 */
export const FINALE = { from: 0.86, to: 0.97 } as const;

export type PhaseName = keyof typeof phases;
