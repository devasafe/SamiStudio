import { describe, expect, it } from "vitest";
import { translationsPayload, type Translations } from "./translations";

describe("translationsPayload", () => {
  it("devolve undefined quando não há nenhuma tradução", () => {
    expect(translationsPayload({ en: {}, es: {} })).toBeUndefined();
    expect(translationsPayload({ en: { title: "  " }, es: { title: "" } })).toBeUndefined();
  });

  it("descarta campos vazios e apara espaços", () => {
    const input: Translations = {
      en: { title: "  Hello  ", description: "" },
      es: { title: "Hola", description: "  " },
    };
    expect(translationsPayload(input)).toEqual({
      en: { title: "Hello" },
      es: { title: "Hola" },
    });
  });

  it("omite o idioma que ficou sem nenhuma tradução", () => {
    const input: Translations = { en: { title: "Hi" }, es: { title: "" } };
    expect(translationsPayload(input)).toEqual({ en: { title: "Hi" } });
  });
});
