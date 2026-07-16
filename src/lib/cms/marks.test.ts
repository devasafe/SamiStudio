import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import ptBR from "@/i18n/dictionaries/pt-BR.json";
import { getByPath, parseRef } from "./refs";

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

function marks(): Mark[] {
  return tsxFiles("src").flatMap((file) => {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(/data-cms="([^"]+)"/g)].map((match) => ({
      file,
      raw: match[1],
    }));
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
      .filter((mark) => getByPath(ptBR, mark.ref!.path) === undefined);
    expect(broken.map((m) => `${m.file}: ${m.ref!.path}`)).toEqual([]);
  });
});
