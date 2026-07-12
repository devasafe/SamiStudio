import { describe, expect, it } from "vitest";
import { toMasonryPhotos } from "@/lib/gallery";

describe("toMasonryPhotos", () => {
  it("ordena por order, aplica fallback de alt e descarta host não permitido", () => {
    const photos = toMasonryPhotos(
      [
        { url: "https://res.cloudinary.com/demo/b.jpg", order: 2, width: 800, height: 600 },
        { url: "https://res.cloudinary.com/demo/a.jpg", order: 1, alt: "Capa" },
        { url: "https://evil.com/x.jpg", order: 0 },
      ],
      "Projeto X"
    );
    expect(photos.map((p) => p.url)).toEqual([
      "https://res.cloudinary.com/demo/a.jpg",
      "https://res.cloudinary.com/demo/b.jpg",
    ]);
    expect(photos[0].alt).toBe("Capa");
    expect(photos[1].alt).toBe("Projeto X");
    expect(photos[1].width).toBe(800);
  });

  it("retorna [] para galeria vazia ou ausente", () => {
    expect(toMasonryPhotos(undefined, "X")).toEqual([]);
    expect(toMasonryPhotos([], "X")).toEqual([]);
  });
});
