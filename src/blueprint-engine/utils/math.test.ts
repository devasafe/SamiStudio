import { describe, expect, it } from "vitest";
import { clamp01, easeOutCubic, lerp, phaseProgress } from "./math";

describe("clamp01", () => {
  it("limita ao intervalo [0, 1]", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1.5)).toBe(1);
  });
});

describe("lerp", () => {
  it("interpola linearmente", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 1)).toBe(10);
  });
});

describe("phaseProgress", () => {
  it("retorna 0 antes da fase e 1 depois dela", () => {
    expect(phaseProgress(0.1, 0.35, 0.65)).toBe(0);
    expect(phaseProgress(0.9, 0.35, 0.65)).toBe(1);
  });

  it("retorna o progresso local dentro da fase", () => {
    expect(phaseProgress(0.5, 0.35, 0.65)).toBeCloseTo(0.5, 5);
    expect(phaseProgress(0.35, 0.35, 0.65)).toBe(0);
    expect(phaseProgress(0.65, 0.35, 0.65)).toBe(1);
  });

  it("trata intervalo degenerado sem dividir por zero", () => {
    expect(phaseProgress(0.4, 0.5, 0.5)).toBe(0);
    expect(phaseProgress(0.6, 0.5, 0.5)).toBe(1);
  });
});

describe("easeOutCubic", () => {
  it("preserva os extremos", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("acelera no início e desacelera no fim", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});
