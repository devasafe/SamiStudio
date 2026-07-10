/**
 * Posição normalizada do mouse (-1..1) para o modo interativo da cena.
 * Igual ao progress store: mutável, lido por frame, sem re-render React.
 */
class PointerStore {
  private x = 0;
  private y = 0;

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  get(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}

export const blueprintPointer = new PointerStore();
