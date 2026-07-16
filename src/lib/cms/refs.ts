/** Referência de conteúdo editável, como aparece em `data-cms`. */
export type CmsKind = "text" | "set" | "img";

export interface CmsRef {
  /** `text` = dicionário (tem idioma); `set`/`img` = configurações do site. */
  kind: CmsKind;
  path: string;
}

/** O que o painel recebe quando alguém clica num elemento editável. */
export interface CmsSelection {
  ref: string;
  /** Texto renderizado — serve de base quando não há override salvo. */
  value: string;
  /** Quantos elementos desta página usam o mesmo endereço. */
  count: number;
}

const KINDS: Record<string, CmsKind> = { text: "text", set: "set", img: "img" };

/** "text:sections.about.title" → { kind, path }. Entrada inválida devolve null. */
export function parseRef(raw: string): CmsRef | null {
  const separator = raw.indexOf(":");
  if (separator < 1) {
    return null;
  }
  const kind = KINDS[raw.slice(0, separator)];
  const path = raw.slice(separator + 1);
  if (!kind || !path) {
    return null;
  }
  return { kind, path };
}

export function serializeRef(ref: CmsRef): string {
  return `${ref.kind}:${ref.path}`;
}

/** Lê um texto por caminho pontuado; só devolve string. */
export function getByPath(source: unknown, path: string): string | undefined {
  if (!path) {
    return undefined;
  }
  const value = path.split(".").reduce<unknown>((node, key) => {
    if (node === null || typeof node !== "object") {
      return undefined;
    }
    return (node as Record<string, unknown>)[key];
  }, source);
  return typeof value === "string" ? value : undefined;
}

/**
 * Grava um texto por caminho, sem mutar a origem.
 *
 * Índices viram chave ("values.0.title" → { values: { "0": ... } }): o
 * `deepMerge` de lib/dictionary.ts casa esse objeto com o array do
 * dicionário base, então não é preciso reconstruir arrays aqui.
 */
export function setByPath(
  source: Record<string, unknown>,
  path: string,
  value: string
): Record<string, unknown> {
  const keys = path.split(".");
  const root: Record<string, unknown> = { ...source };
  let node = root;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      node[key] = value;
      return;
    }
    const current = node[key];
    node[key] =
      typeof current === "object" && current !== null
        ? { ...(current as Record<string, unknown>) }
        : {};
    node = node[key] as Record<string, unknown>;
  });
  return root;
}
