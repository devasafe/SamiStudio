import { describe, expect, it } from "vitest";
import { negotiateLocale } from "@/i18n/negotiate";

describe("negotiateLocale", () => {
  it("usa o espanhol quando não há nada para detectar", () => {
    expect(negotiateLocale(null)).toBe("es");
    expect(negotiateLocale("")).toBe("es");
  });

  it("usa o espanhol quando o navegador pede um idioma que o site não fala", () => {
    expect(negotiateLocale("de-DE,de;q=0.9")).toBe("es");
  });

  it("reconhece cada idioma do site", () => {
    expect(negotiateLocale("pt-BR,pt;q=0.9")).toBe("pt-BR");
    expect(negotiateLocale("en-US,en;q=0.9")).toBe("en");
    expect(negotiateLocale("es-ES,es;q=0.9")).toBe("es");
  });

  it("atende as variantes regionais do espanhol pelo idioma base", () => {
    // O público hispanofalante chega com dezenas destas.
    expect(negotiateLocale("es-PE")).toBe("es");
    expect(negotiateLocale("es-419")).toBe("es");
    expect(negotiateLocale("es-MX,es;q=0.9")).toBe("es");
  });

  it("atende o português de Portugal pelo idioma base", () => {
    expect(negotiateLocale("pt-PT,pt;q=0.9")).toBe("pt-BR");
  });

  it("respeita a ordem de preferência pelo peso q", () => {
    // Inglês vem primeiro na lista, mas o português pesa mais.
    expect(negotiateLocale("en;q=0.5,pt-BR;q=0.9")).toBe("pt-BR");
  });

  it("ignora um idioma recusado com q=0", () => {
    // q=0 é "não me mande isto", não "peso baixo".
    expect(negotiateLocale("pt-BR;q=0,en;q=0.5")).toBe("en");
  });

  it("trata tag sem q como preferência máxima", () => {
    expect(negotiateLocale("en,pt-BR;q=0.9")).toBe("en");
  });

  it("não quebra com header malformado", () => {
    expect(negotiateLocale(",,;q=,")).toBe("es");
    expect(negotiateLocale("en;q=abc")).toBe("en");
  });

  it("deixa a escolha explícita vencer o idioma do navegador", () => {
    // Quem clicou em ES não pode ser puxado de volta para PT no clique seguinte.
    expect(negotiateLocale("pt-BR,pt;q=0.9", "es")).toBe("es");
    expect(negotiateLocale("es-PE", "en")).toBe("en");
  });

  it("ignora um cookie adulterado e volta a detectar", () => {
    expect(negotiateLocale("en-US", "klingon")).toBe("en");
    expect(negotiateLocale(null, "../etc/passwd")).toBe("es");
  });
});
