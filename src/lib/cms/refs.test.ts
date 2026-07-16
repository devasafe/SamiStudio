import { describe, expect, it } from "vitest";
import { getByPath, parseRef, serializeRef, setByPath } from "./refs";

describe("parseRef", () => {
  it("separa tipo e caminho", () => {
    expect(parseRef("text:sections.about.title")).toEqual({
      kind: "text",
      path: "sections.about.title",
    });
  });

  it("aceita os três tipos", () => {
    expect(parseRef("set:email")?.kind).toBe("set");
    expect(parseRef("img:aboutPhoto")?.kind).toBe("img");
  });

  it("recusa tipo desconhecido, caminho vazio e string sem separador", () => {
    expect(parseRef("outro:x")).toBeNull();
    expect(parseRef("text:")).toBeNull();
    expect(parseRef("sections.about.title")).toBeNull();
    expect(parseRef(":x")).toBeNull();
  });

  it("serializeRef é o inverso de parseRef", () => {
    const raw = "text:sections.about.title";
    expect(serializeRef(parseRef(raw)!)).toBe(raw);
  });
});

describe("getByPath", () => {
  const dict = { sections: { about: { title: "Oi" } }, values: [{ title: "Um" }] };

  it("lê caminho aninhado", () => {
    expect(getByPath(dict, "sections.about.title")).toBe("Oi");
  });

  it("lê índice de array", () => {
    expect(getByPath(dict, "values.0.title")).toBe("Um");
  });

  it("devolve undefined para caminho inexistente ou valor não-texto", () => {
    expect(getByPath(dict, "sections.nada.title")).toBeUndefined();
    expect(getByPath(dict, "sections.about")).toBeUndefined();
    expect(getByPath(dict, "")).toBeUndefined();
  });
});

describe("setByPath", () => {
  it("cria o caminho aninhado", () => {
    expect(setByPath({}, "sections.about.title", "Novo")).toEqual({
      sections: { about: { title: "Novo" } },
    });
  });

  it("preserva os irmãos", () => {
    const before = { sections: { about: { title: "A", text: "B" }, faq: { title: "C" } } };
    expect(setByPath(before, "sections.about.title", "Z")).toEqual({
      sections: { about: { title: "Z", text: "B" }, faq: { title: "C" } },
    });
  });

  it("não muta a origem", () => {
    const before = { sections: { about: { title: "A" } } };
    setByPath(before, "sections.about.title", "Z");
    expect(before.sections.about.title).toBe("A");
  });

  it("usa índice como chave (o merge do servidor casa com o array base)", () => {
    expect(setByPath({}, "values.0.title", "Um")).toEqual({ values: { "0": { title: "Um" } } });
  });
});
