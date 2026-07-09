export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Progresso local (0→1) de um trecho [from, to] do progresso global. */
export function phaseProgress(progress: number, from: number, to: number): number {
  if (to <= from) {
    return progress >= to ? 1 : 0;
  }
  return clamp01((progress - from) / (to - from));
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
