/**
 * Timeline da narrativa do Hero (Docs/14, adaptada para interior reveal):
 * o ambiente nasce como linhas técnicas, ganha casca, mobiliário,
 * detalhes e por fim a atmosfera do render final.
 */
export const phases = {
  /** Somente linhas: wireframe técnico do ambiente. */
  blueprint: { from: 0.0, to: 0.04 },
  /** Piso e paredes se materializam. */
  shell: { from: 0.04, to: 0.085 },
  /** Mobiliário principal aparece em sequência. */
  furniture: { from: 0.085, to: 0.13 },
  /** Detalhes: tapete, luminária, plantas, quadros. */
  details: { from: 0.13, to: 0.16 },
  /** Acabamento do render. */
  render: { from: 0.16, to: 0.175 },
} as const;

/**
 * Fim da montagem (decisão do cliente, 2026-07-10): o ambiente deve estar
 * completo quando a seção Sobre assenta (~18% do scroll). Depois disso a
 * cena entra no modo interativo (parallax + luzes no hover).
 */
export const ASSEMBLY_END = phases.render.to;

export type PhaseName = keyof typeof phases;
