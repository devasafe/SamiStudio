import { describe, expect, it } from "vitest";
import { dailyCounts } from "./series";

/** 16/07/2026, 10h no fuso local — âncora fixa para os testes. */
const today = new Date(2026, 6, 16, 10, 0, 0);

describe("dailyCounts", () => {
  it("devolve um ponto por dia da janela, terminando hoje", () => {
    const points = dailyCounts([], 7, today);
    expect(points).toHaveLength(7);
    expect(points[0].date).toBe("2026-07-10");
    expect(points[6].date).toBe("2026-07-16");
  });

  it("conta as datas no dia certo", () => {
    const points = dailyCounts(
      [
        new Date(2026, 6, 16, 9, 0).toISOString(),
        new Date(2026, 6, 16, 9, 30).toISOString(),
        new Date(2026, 6, 14, 8, 0).toISOString(),
      ],
      7,
      today
    );
    expect(points.find((p) => p.date === "2026-07-16")?.value).toBe(2);
    expect(points.find((p) => p.date === "2026-07-14")?.value).toBe(1);
  });

  it("dia sem nada vale zero, não some da série", () => {
    const points = dailyCounts([new Date(2026, 6, 16, 9, 0).toISOString()], 7, today);
    expect(points.filter((p) => p.value === 0)).toHaveLength(6);
  });

  it("ignora datas fora da janela", () => {
    const points = dailyCounts(
      [
        new Date(2026, 6, 1, 9, 0).toISOString(), // antes
        new Date(2026, 6, 20, 9, 0).toISOString(), // depois
      ],
      7,
      today
    );
    expect(points.every((p) => p.value === 0)).toBe(true);
  });

  it("usa o dia local, não o UTC", () => {
    // 16/07 21h no Brasil (UTC-3) é 17/07 00h em UTC: agrupar por
    // toISOString jogaria a mensagem para o dia seguinte, e a dona veria
    // no gráfico um dia diferente do que está na tela da mensagem.
    const lateNight = new Date(2026, 6, 16, 21, 0, 0);
    const points = dailyCounts([lateNight.toISOString()], 7, today);
    expect(points.find((p) => p.date === "2026-07-16")?.value).toBe(1);
  });

  it("rotula o eixo em pt-BR curto", () => {
    expect(dailyCounts([], 7, today)[6].label).toBe("16 jul");
  });
});
