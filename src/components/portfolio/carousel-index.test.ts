import { describe, expect, it } from "vitest";
import { wrapIndex } from "./carousel-index";

describe("carousel-index", () => {
  it("avança dentro dos limites", () => {
    expect(wrapIndex(0, 1, 3)).toBe(1);
  });

  it("dá a volta do último para o primeiro", () => {
    expect(wrapIndex(2, 1, 3)).toBe(0);
  });

  it("dá a volta do primeiro para o último", () => {
    expect(wrapIndex(0, -1, 3)).toBe(2);
  });

  it("length zero sempre devolve 0", () => {
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });
});
