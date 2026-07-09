/**
 * Timeline da narrativa do Hero (Docs/14, adaptada para interior reveal):
 * o ambiente nasce como linhas técnicas, ganha casca, mobiliário,
 * detalhes e por fim a atmosfera do render final.
 */
export const phases = {
  /** Somente linhas: wireframe técnico do ambiente. */
  blueprint: { from: 0.0, to: 0.15 },
  /** Piso e paredes se materializam. */
  shell: { from: 0.15, to: 0.35 },
  /** Mobiliário principal aparece em sequência. */
  furniture: { from: 0.35, to: 0.65 },
  /** Detalhes: tapete, luminária, plantas, quadros. */
  details: { from: 0.65, to: 0.85 },
  /** Iluminação golden hour e acabamento do render. */
  render: { from: 0.85, to: 1.0 },
} as const;

export type PhaseName = keyof typeof phases;
