import { describe, expect, it } from "vitest";
import { coverFromGallery, moveItem, reindex, removeItem } from "./gallery-utils";

const g = (url: string, order: number) => ({ url, order });

describe("gallery-utils", () => {
  it("reindex numera order pela posição", () => {
    expect(reindex([g("a", 5), g("b", 9)]).map((i) => i.order)).toEqual([0, 1]);
  });

  it("moveItem move e reindexa", () => {
    const out = moveItem([g("a", 0), g("b", 1), g("c", 2)], 0, 2);
    expect(out.map((i) => i.url)).toEqual(["b", "c", "a"]);
    expect(out.map((i) => i.order)).toEqual([0, 1, 2]);
  });

  it("moveItem ignora índices inválidos", () => {
    const items = [g("a", 0)];
    expect(moveItem(items, 0, 5)).toBe(items);
  });

  it("removeItem remove e reindexa", () => {
    const out = removeItem([g("a", 0), g("b", 1), g("c", 2)], 1);
    expect(out.map((i) => i.url)).toEqual(["a", "c"]);
    expect(out.map((i) => i.order)).toEqual([0, 1]);
  });

  it("coverFromGallery devolve a url da primeira", () => {
    expect(coverFromGallery([g("a", 0), g("b", 1)])).toBe("a");
    expect(coverFromGallery([])).toBeUndefined();
  });
});
