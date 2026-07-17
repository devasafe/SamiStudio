import { describe, expect, it } from "vitest";
import { formatPhone, phoneDigits, whatsappUrl } from "./phone";

describe("formatPhone", () => {
  it("formata celular brasileiro enquanto digita", () => {
    expect(formatPhone("5")).toBe("+5");
    expect(formatPhone("55")).toBe("+55");
    expect(formatPhone("5511")).toBe("+55 (11)");
    expect(formatPhone("5511987")).toBe("+55 (11) 987");
    expect(formatPhone("5511987654321")).toBe("+55 (11) 98765-4321");
  });

  it("formata fixo brasileiro (8 dígitos)", () => {
    expect(formatPhone("551133334444")).toBe("+55 (11) 3333-4444");
  });

  it("agrupa número estrangeiro sem inventar formato de país", () => {
    // O número da própria Sami é peruano: uma máscara fixa brasileira o
    // rejeitaria, e sem uma base de formatos por país o honesto é só agrupar.
    expect(formatPhone("51937588295")).toBe("+51 937 588 295");
  });

  it("ignora o que não é dígito", () => {
    expect(formatPhone("+55 (11) 98765-4321")).toBe("+55 (11) 98765-4321");
    expect(formatPhone("abc55def11")).toBe("+55 (11)");
  });

  it("não passa dos 15 dígitos do padrão internacional", () => {
    // E.164: 15 dígitos é o teto de um número no mundo todo.
    expect(formatPhone("5511987654321999999")).toBe("+55 (11) 98765-432199");
    expect(phoneDigits(formatPhone("5511987654321999999"))).toHaveLength(15);
  });

  it("string vazia continua vazia (não vira um '+' solto)", () => {
    expect(formatPhone("")).toBe("");
  });
});

describe("phoneDigits", () => {
  it("devolve só os dígitos", () => {
    expect(phoneDigits("+55 (11) 98765-4321")).toBe("5511987654321");
    expect(phoneDigits("")).toBe("");
  });
});

describe("whatsappUrl", () => {
  it("monta o link do WhatsApp a partir do número", () => {
    expect(whatsappUrl("+55 (11) 98765-4321")).toBe("https://wa.me/5511987654321");
  });

  it("aceita número estrangeiro", () => {
    expect(whatsappUrl("+51 937 588 295")).toBe("https://wa.me/51937588295");
  });

  it("devolve null sem dígitos suficientes para um número com DDI", () => {
    // Sem DDI o WhatsApp abre uma conversa com o número errado — melhor não
    // oferecer o link do que mandar a mensagem para outra pessoa.
    expect(whatsappUrl("98765-4321")).toBeNull();
    expect(whatsappUrl("")).toBeNull();
    expect(whatsappUrl("abc")).toBeNull();
  });

  it("leva um texto inicial quando pedido", () => {
    expect(whatsappUrl("+5511987654321", "Olá, Maria!")).toBe(
      "https://wa.me/5511987654321?text=Ol%C3%A1%2C%20Maria!"
    );
  });
});
