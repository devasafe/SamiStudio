import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import ptBR from "@/i18n/dictionaries/pt-BR.json";
import { settingsUpdateSchema } from "@/lib/validation";
import { getByPath, parseRef } from "./refs";

/**
 * Campos que o PATCH /settings de fato aceita. `settingsUpdateSchema` não é
 * `.strict()` (zod descarta chave desconhecida em silêncio — ver
 * validação.ts), então um `set:`/`img:` com typo hoje falha de ponta a ponta
 * sem erro nenhum: painel manda `{emial: "x"}`, a rota devolve `{}`, o
 * findOneAndUpdate grava `{}` com sucesso, e o painel mostra "Salvo." sem
 * nada persistido. Validar aqui, na origem, é onde o erro é barato.
 */
const settingsKeys = new Set(Object.keys(settingsUpdateSchema.shape));

/** Percorre src/ e devolve todo .tsx. */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return tsxFiles(full);
    }
    return full.endsWith(".tsx") ? [full] : [];
  });
}

interface Mark {
  file: string;
  raw: string;
}

/**
 * Marcação como string literal, casada em qualquer posição do arquivo — não
 * só logo depois de `data-cms="`. Isso cobre três formas:
 *   - `data-cms="text:nav.home"` (o caso comum);
 *   - `cms: "text:nav.home"` (navbar/footer guardam a marcação num array de
 *     links e usam `data-cms={link.cms}` para renderizar — a string em si,
 *     que é o que precisa ser validado, mora aqui);
 *   - literal dentro de expressão condicional, ex.:
 *     `value === "all" ? "text:portfolioPage.all" : undefined` (portfolio-grid).
 * Aspas simples ficam de fora de propósito: edit-overlay.tsx usa
 * `[data-cms='${ref}']` (seletor CSS, não marcação) justamente para escapar
 * deste regex — ver comentário lá. Não trocar para aspas simples aqui.
 */
function staticMarks(source: string): string[] {
  return [...source.matchAll(/"((?:text|set|img):[^"]+)"/g)].map((match) => match[1]);
}

/**
 * Marcação em template literal: `data-cms={`text:...`}`. O conteúdo pode ter
 * `${...}` interpolado — índice de lista (`steps.${index}.title`) ou pedaço
 * de string (`essencePhoto${index + 1}`) — ver `segmentsOf`.
 */
function templateMarks(source: string): string[] {
  return [...source.matchAll(/data-cms=\{`([^`]+)`\}/g)].map((match) => match[1]);
}

function marks(): Mark[] {
  return tsxFiles("src").flatMap((file) => {
    const source = readFileSync(file, "utf8");
    return [...staticMarks(source), ...templateMarks(source)].map((raw) => ({ file, raw }));
  });
}

/** Segmento de caminho inteiramente interpolado (`${index}`) — índice de array. */
const WILDCARD_SEGMENT = /^\$\{[^}]*\}$/;
/** `${...}` misturado com texto literal no mesmo segmento (`stat${i}Value`). */
const HAS_INTERPOLATION = /\$\{/;

/**
 * Marcações cujo caminho não dá para resolver estaticamente: interpolação
 * parcial de string (`essencePhoto${index + 1}`), ou caminho inteiro vindo de
 * uma variável de outro arquivo/prop (`${labelRef}`, montado em
 * contato/page.tsx a partir de outro componente). Documentadas à mão — a
 * última verificação desta suíte ("todo caso não resolvível... documentado")
 * falha se uma entrada daqui deixar de existir no código (cemitério de
 * exceções), e as verificações de text:/set:/img: abaixo falham se aparecer
 * um caso novo do gênero que não esteja listado aqui.
 */
const KNOWN_UNRESOLVABLE = new Set<string>([
  // contato/page.tsx (componente Channel) — rótulo e campo vêm de props;
  // o valor real só existe em tempo de execução.
  "text:${labelRef}",
  "set:${first.field}",
  "set:${line.field}",
  // sobre/page.tsx e about-section.tsx — "stat1Value"/"stat2Label"/... são
  // chaves fixas do schema de configurações, mas o número vem de `index + 1`
  // interpolado no meio da string: não dá para casar sem executar o componente.
  "set:stat${index + 1}Value",
  "set:stat${index + 1}Label",
  // sobre/page.tsx — mesma situação para a foto de cada "essência".
  "img:essencePhoto${index + 1}",
]);

interface Segment {
  text: string;
  wildcard: boolean;
}

/**
 * Quebra um caminho em segmentos, sinalizando os que são índice de array
 * (`${index}` sozinho no segmento). Devolve null quando algum segmento tem
 * interpolação parcial (`${...}` misturado com texto) — esses só podem ser
 * tratados via KNOWN_UNRESOLVABLE, nunca resolvidos aqui.
 */
function segmentsOf(path: string): Segment[] | null {
  const parts = path.split(".");
  const hasPartial = parts.some(
    (part) => HAS_INTERPOLATION.test(part) && !WILDCARD_SEGMENT.test(part)
  );
  if (hasPartial) {
    return null;
  }
  return parts.map((text) => ({ text, wildcard: WILDCARD_SEGMENT.test(text) }));
}

/** Lê um valor bruto (não só string) por segmentos — para conseguir navegar arrays. */
function getRaw(source: unknown, segments: string[]): unknown {
  return segments.reduce<unknown>((node, key) => {
    if (node === null || typeof node !== "object") {
      return undefined;
    }
    return (node as Record<string, unknown>)[key];
  }, source);
}

/**
 * Um caminho com índice de array (`sections.process.steps.${index}.title`)
 * é válido se o array existir (`sections.process.steps`) e cada item tiver o
 * resto do caminho (`title`) apontando para uma string. Sem sufixo
 * (`aboutPage.founderParagraphs.${index}`), o próprio item precisa ser a
 * string.
 */
function arrayIndexResolves(segments: Segment[]): boolean {
  const wildcardAt = segments.findIndex((segment) => segment.wildcard);
  const prefix = segments.slice(0, wildcardAt).map((s) => s.text);
  const suffix = segments.slice(wildcardAt + 1).map((s) => s.text);
  const array = getRaw(ptBR, prefix);
  if (!Array.isArray(array) || array.length === 0) {
    return false;
  }
  return array.every((item) => {
    const leaf = suffix.length === 0 ? item : getRaw(item, suffix);
    return typeof leaf === "string";
  });
}

describe("marcação data-cms", () => {
  it("existe marcação no projeto", () => {
    expect(marks().length).toBeGreaterThan(0);
  });

  it("toda marcação tem tipo e caminho válidos", () => {
    const invalid = marks().filter((mark) => parseRef(mark.raw) === null);
    expect(invalid.map((m) => `${m.file}: ${m.raw}`)).toEqual([]);
  });

  it("todo text: aponta para um texto que existe no dicionário", () => {
    const broken = marks()
      .map((mark) => ({ ...mark, ref: parseRef(mark.raw) }))
      .filter((mark) => mark.ref?.kind === "text")
      .filter((mark) => {
        if (KNOWN_UNRESOLVABLE.has(mark.raw)) {
          return false; // documentado — ver KNOWN_UNRESOLVABLE
        }
        const segments = segmentsOf(mark.ref!.path);
        if (segments === null) {
          // Interpolação parcial não documentada: precisa entrar em
          // KNOWN_UNRESOLVABLE (ou, melhor, deixar de ser parcial).
          return true;
        }
        if (segments.some((s) => s.wildcard)) {
          return !arrayIndexResolves(segments);
        }
        return getByPath(ptBR, mark.ref!.path) === undefined;
      });
    expect(broken.map((m) => `${m.file}: ${m.ref!.path}`)).toEqual([]);
  });

  it("todo set:/img: aponta para um campo que existe no schema de configurações", () => {
    const broken = marks()
      .map((mark) => ({ ...mark, ref: parseRef(mark.raw) }))
      .filter((mark) => mark.ref?.kind === "set" || mark.ref?.kind === "img")
      .filter((mark) => {
        if (KNOWN_UNRESOLVABLE.has(mark.raw)) {
          return false; // documentado — ver KNOWN_UNRESOLVABLE
        }
        const segments = segmentsOf(mark.ref!.path);
        // set:/img: sempre aponta para uma chave plana do schema — não há
        // arrays em settingsUpdateSchema. Um índice de lista ou interpolação
        // parcial aqui seria um caso novo, não documentado: falha de propósito.
        if (segments === null || segments.some((s) => s.wildcard)) {
          return true;
        }
        return !settingsKeys.has(mark.ref!.path);
      });
    expect(broken.map((m) => `${m.file}: ${m.ref!.path}`)).toEqual([]);
  });

  it("todo caso não resolvível estaticamente ainda existe no código", () => {
    // Evita que KNOWN_UNRESOLVABLE vire cemitério: se uma marcação de lá for
    // removida ou corrigida no código-fonte, a entrada tem que sumir daqui
    // também — senão ninguém percebe que ficou obsoleta.
    const raws = new Set(marks().map((m) => m.raw));
    const stale = [...KNOWN_UNRESOLVABLE].filter((raw) => !raws.has(raw));
    expect(stale).toEqual([]);
  });
});
