import { describe, expect, it } from "vitest";
import { isCmsMessage, isTrustedEditMessage } from "./protocol";

const parent = { name: "parent" };
const ORIGIN = "https://site.com";

describe("isCmsMessage", () => {
  it("aceita as mensagens do protocolo", () => {
    expect(isCmsMessage({ type: "cms:enable" })).toBe(true);
    expect(isCmsMessage({ type: "cms:ready" })).toBe(true);
    expect(isCmsMessage({ type: "cms:select", ref: "text:a", value: "x", count: 1 })).toBe(true);
    expect(isCmsMessage({ type: "cms:patch", ref: "text:a", value: "x" })).toBe(true);
  });

  it("recusa lixo", () => {
    expect(isCmsMessage(null)).toBe(false);
    expect(isCmsMessage("cms:enable")).toBe(false);
    expect(isCmsMessage({ type: "outro" })).toBe(false);
    expect(isCmsMessage({ type: "cms:select" })).toBe(false);
    expect(isCmsMessage({ type: "cms:select", ref: "text:a", value: "x" })).toBe(false);
  });
});

describe("isTrustedEditMessage", () => {
  const good = { origin: ORIGIN, source: parent, data: { type: "cms:enable" } };

  it("aceita origem e source esperados com mensagem válida", () => {
    expect(isTrustedEditMessage(good, ORIGIN, parent)).toBe(true);
  });

  it("recusa origem diferente", () => {
    expect(isTrustedEditMessage({ ...good, origin: "https://mau.com" }, ORIGIN, parent)).toBe(
      false
    );
  });

  it("recusa source diferente do esperado", () => {
    expect(isTrustedEditMessage({ ...good, source: { name: "outro" } }, ORIGIN, parent)).toBe(
      false
    );
  });

  it("recusa mensagem fora do protocolo", () => {
    expect(isTrustedEditMessage({ ...good, data: { type: "hack" } }, ORIGIN, parent)).toBe(false);
  });
});
