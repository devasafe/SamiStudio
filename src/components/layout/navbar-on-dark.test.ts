import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A navbar fica clara (`onDark`) enquanto não houve scroll, porque toda página
 * do site abre com fundo escuro atrás dela. Este teste guarda essa premissa: uma
 * página nova com fundo claro deixaria a navbar ilegível — texto claro sobre
 * fundo claro — sem erro nenhum em tempo de build.
 *
 * Uma lista de rotas escuras dentro da navbar já existiu e apodreceu: as páginas
 * viraram dark na repaginação e a lista ficou para trás. O teste substitui a
 * lista pela verificação.
 */
const PAGES_ROOT = join(process.cwd(), "src/app/[locale]");

function findPages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return findPages(full);
    }
    return entry.name === "page.tsx" ? [full] : [];
  });
}

describe("navbar: premissa de fundo escuro", () => {
  const pages = findPages(PAGES_ROOT);

  it("encontra as páginas do site", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages.map((path) => [path.slice(PAGES_ROOT.length).replace(/\\/g, "/"), path]))(
    "%s abre com fundo escuro atrás da navbar",
    (_label, path) => {
      const source = readFileSync(path, "utf8");
      const main = source.match(/<main[^>]*className="([^"]*)"/)?.[1] ?? "";
      // Escuro por hex (#141009) ou pelo tema quente escuro em tokens.
      const paintsDark = /theme-dark-warm|bg-\[#141009\]/.test(main);

      // A home não pinta o <main>: quem cobre a navbar lá é o hero do
      // HomeExperience, escuro por definição.
      if (!paintsDark) {
        expect(source).toMatch(/HomeExperience/);
        return;
      }
      expect(paintsDark).toBe(true);
    }
  );
});
