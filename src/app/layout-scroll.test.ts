import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A Lenis mede a altura do documento com `content.scrollHeight` e só re-mede
 * quando o ResizeObserver dispara no `<html>`. O ResizeObserver observa a
 * content-box: com `height: 100%` no html, essa caixa vale 100vh e **nunca
 * muda** quando o conteúdo cresce. Resultado: a altura medida no init (antes
 * das imagens carregarem) congela, e o scroll trava no meio da página.
 *
 * É por isso que a própria Lenis embarca `html.lenis { height: auto }`. Estes
 * testes travam as duas pontas: a altura do html e o CSS oficial da lib.
 */
describe("layout: altura do documento vs. Lenis", () => {
  const layout = readFileSync(join(process.cwd(), "src/app/[locale]/layout.tsx"), "utf8");
  const globals = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

  // Só a tag de abertura de cada um: o que vem entre elas (comentários) citaria
  // as próprias classes e daria falso positivo.
  const openingTag = (name: string) => {
    const start = layout.indexOf(`<${name}`);
    return layout.slice(start, layout.indexOf(">", start));
  };
  const htmlTag = openingTag("html");
  const bodyTag = openingTag("body");

  it("não fixa a altura do <html> (congelaria o limite de scroll da Lenis)", () => {
    expect(htmlTag).not.toMatch(/\bh-full\b|\bh-screen\b|\bh-svh\b/);
  });

  it("usa min-h-svh no <body>, que não depende da altura do <html>", () => {
    // `min-h-full` é percentual: sem altura no html ele não resolve e o rodapé
    // deixa de ser empurrado para o fim da tela em páginas curtas.
    expect(bodyTag).toMatch(/\bmin-h-svh\b/);
    expect(bodyTag).not.toMatch(/\bmin-h-full\b/);
  });

  it("importa o CSS da Lenis, que garante height:auto no html", () => {
    expect(globals).toMatch(/lenis\.css/);
  });
});
