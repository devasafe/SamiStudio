import { describe, expect, it } from "vitest";
import { deleteByPath, getByPath, parseRef, serializeRef, setByPath } from "./refs";

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

describe("deleteByPath", () => {
  it("remove a chave folha, preservando irmãos no mesmo nível", () => {
    const before = { sections: { about: { title: "A", text: "B" } } };
    expect(deleteByPath(before, "sections.about.title")).toEqual({
      sections: { about: { text: "B" } },
    });
  });

  it("preserva os irmãos do ramo removido", () => {
    const before = { sections: { about: { title: "A" }, faq: { title: "C" } } };
    // "about" some inteiro (ficou vazio ao remover "title"), mas "faq" continua intacto.
    expect(deleteByPath(before, "sections.about.title")).toEqual({
      sections: { faq: { title: "C" } },
    });
  });

  it("não muta a origem", () => {
    const before = { sections: { about: { title: "A", text: "B" } } };
    deleteByPath(before, "sections.about.title");
    expect(before).toEqual({ sections: { about: { title: "A", text: "B" } } });
  });

  it("poda ramos que ficaram vazios, inclusive até a raiz", () => {
    const before = { meta: { home: { title: "Home" } } };
    // "home" só tinha "title"; depois de removido fica {} e some. "meta" só tinha
    // "home"; depois disso também fica {} e some. Sem isso, um `{ meta: { home: {} } }`
    // residual voltaria em toda leitura como lixo inexplicável.
    expect(deleteByPath(before, "meta.home.title")).toEqual({});
  });

  it("caminho inexistente devolve a origem inalterada", () => {
    const before = { sections: { about: { title: "A" } } };
    expect(deleteByPath(before, "sections.about.nada")).toEqual(before);
    expect(deleteByPath(before, "outro.caminho")).toEqual(before);
  });
});
