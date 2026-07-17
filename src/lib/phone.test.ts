import { describe, expect, it } from "vitest";
import { phoneDigits, whatsappUrl } from "./phone";

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
