import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("tira acento em vez de tirar a letra", () => {
    // Sem o NFD, "Eletrônica" viraria "eletr-nica".
    expect(slugify("Maquete Eletrônica")).toBe("maquete-eletronica");
    expect(slugify("Ação")).toBe("acao");
    expect(slugify("Interiores & Exteriores")).toBe("interiores-exteriores");
  });

  it("junta espaços e símbolos num hífen só", () => {
    expect(slugify("Render   Realista")).toBe("render-realista");
    expect(slugify("IA / 3D")).toBe("ia-3d");
  });

  it("não deixa hífen sobrando nas pontas", () => {
    expect(slugify("  Detalhamento  ")).toBe("detalhamento");
    expect(slugify("...Conceito!")).toBe("conceito");
  });

  it("mantém números", () => {
    expect(slugify("Modelagem 3D")).toBe("modelagem-3d");
  });

  it("texto sem letra nem número vira vazio", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });
});
