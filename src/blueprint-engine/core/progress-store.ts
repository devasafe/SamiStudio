type Listener = () => void;

/**
 * Progress Controller (Docs/14): toda a engine responde a um único
 * valor `progress` (0.0 → 1.0). Store externa ao React para que a cena
 * Three.js leia o valor por frame sem re-renderizações.
 */
class ProgressStore {
  private value = 0;
  private listeners = new Set<Listener>();

  get(): number {
    return this.value;
  }

  set(next: number): void {
    const clamped = Math.min(1, Math.max(0, next));
    if (clamped === this.value) {
      return;
    }
    this.value = clamped;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const blueprintProgress = new ProgressStore();
