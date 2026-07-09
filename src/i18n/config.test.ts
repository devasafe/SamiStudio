import { describe, expect, it } from "vitest";
import { defaultLocale, isLocale, localePath, locales } from "./config";

describe("isLocale", () => {
  it("aceita os idiomas suportados", () => {
    for (const locale of locales) {
      expect(isLocale(locale)).toBe(true);
    }
  });

  it("rejeita idiomas desconhecidos", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("pt")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("localePath", () => {
  it("não prefixa o idioma padrão (Docs/13)", () => {
    expect(localePath(defaultLocale, "/")).toBe("/");
    expect(localePath(defaultLocale, "/sobre")).toBe("/sobre");
  });

  it("prefixa os demais idiomas", () => {
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("en", "/sobre")).toBe("/en/sobre");
    expect(localePath("es", "/portfolio/interior-miraflores")).toBe(
      "/es/portfolio/interior-miraflores"
    );
  });

  it("normaliza caminhos sem barra inicial", () => {
    expect(localePath("en", "sobre")).toBe("/en/sobre");
    expect(localePath(defaultLocale, "sobre")).toBe("/sobre");
  });
});
