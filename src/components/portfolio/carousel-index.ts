/** Índice seguinte do carrossel, com wrap-around nas duas pontas. */
export function wrapIndex(current: number, delta: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return (current + delta + length) % length;
}
