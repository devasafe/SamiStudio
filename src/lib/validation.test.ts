import { describe, expect, it } from "vitest";
import {
  loginSchema,
  projectCreateSchema,
  projectUpdateSchema,
  translationUpdateSchema,
} from "./validation";

describe("loginSchema", () => {
  it("aceita credenciais válidas", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "12345678" }).success).toBe(true);
  });

  it("rejeita e-mail inválido e senha curta", () => {
    expect(loginSchema.safeParse({ email: "x", password: "12345678" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
  });
});

describe("projectCreateSchema", () => {
  it("aceita projeto mínimo com slug válido", () => {
    const result = projectCreateSchema.safeParse({
      slug: "interior-miraflores",
      title: "Interior Miraflores",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita slug com maiúsculas, espaços ou acentos", () => {
    for (const slug of ["Interior", "interior miraflores", "café", "a--b", "-inicio"]) {
      expect(projectCreateSchema.safeParse({ slug, title: "t" }).success).toBe(false);
    }
  });

  it("rejeita status desconhecido", () => {
    expect(
      projectCreateSchema.safeParse({ slug: "ok", title: "t", status: "publicado" }).success
    ).toBe(false);
  });

  it("update aceita payload parcial", () => {
    expect(projectUpdateSchema.safeParse({ featured: true }).success).toBe(true);
  });
});

describe("translationUpdateSchema", () => {
  it("aceita locales suportados e rejeita os demais", () => {
    expect(translationUpdateSchema.safeParse({ locale: "es", content: {} }).success).toBe(true);
    expect(translationUpdateSchema.safeParse({ locale: "fr", content: {} }).success).toBe(false);
  });
});
