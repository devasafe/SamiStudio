import { describe, expect, it } from "vitest";
import { splitSiteName } from "./site-name";

describe("splitSiteName", () => {
  it("separa a última palavra do resto", () => {
    expect(splitSiteName("Sami da Silva Studio")).toEqual({
      lead: "Sami da Silva",
      last: "Studio",
    });
  });

  it("nome de duas palavras", () => {
    expect(splitSiteName("Ateliê Guedes")).toEqual({ lead: "Ateliê", last: "Guedes" });
  });

  it("nome de uma palavra só não destaca nada", () => {
    expect(splitSiteName("Studio")).toEqual({ lead: "Studio", last: null });
  });

  it("apara espaços das pontas e do meio", () => {
    expect(splitSiteName("  Sami   Studio  ")).toEqual({ lead: "Sami", last: "Studio" });
  });
});
