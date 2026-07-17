"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { PageDiagram, type PageRegion } from "@/components/admin/settings/page-diagram";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "@/components/icons";
import { deleteByPath, getByPath, setByPath } from "@/lib/cms/refs";
import { cn } from "@/lib/utils";
import ptBR from "@/i18n/dictionaries/pt-BR.json";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";

const LOCALES = [
  { id: "pt-BR", label: "Português" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
] as const;

type Locale = (typeof LOCALES)[number]["id"];

const baseDictionaries: Record<Locale, unknown> = { "pt-BR": ptBR, en, es };

/** Nome amigável e onde cada área aparece na página. */
const GROUPS: Record<string, { label: string; hint: string; region: PageRegion }> = {
  meta: {
    label: "SEO — títulos e descrições",
    hint: "Não aparece no site: é o que o Google mostra nos resultados de busca.",
    region: "none",
  },
  hero: {
    label: "Hero (topo da home)",
    hint: "A primeira coisa que se vê ao abrir o site.",
    region: "hero",
  },
  nav: { label: "Menu de navegação", hint: "A barra no topo de todas as páginas.", region: "nav" },
  common: {
    label: "Botões e textos comuns",
    hint: "Reaproveitados em várias páginas (ex.: rótulo de botão).",
    region: "content",
  },
  sections: { label: "Seções da home", hint: "O miolo da página inicial.", region: "content" },
  aboutPage: { label: "Página Sobre", hint: "Textos da página Sobre.", region: "content" },
  portfolioPage: {
    label: "Página Portfólio",
    hint: "Textos da listagem de projetos.",
    region: "content",
  },
  projectPage: {
    label: "Página de Projeto",
    hint: "Textos da página de cada projeto.",
    region: "content",
  },
  contactPage: { label: "Página Contato", hint: "Textos da página de contato.", region: "content" },
  categories: {
    label: "Categorias do portfólio",
    hint: "Nomes das categorias usadas nos filtros.",
    region: "content",
  },
  footer: { label: "Rodapé", hint: "O rodapé, no fim de todas as páginas.", region: "footer" },
};

interface Field {
  path: string;
  base: string;
}

/** Achata o dicionário em pares caminho → texto. */
function flatten(value: unknown, prefix = ""): Field[] {
  if (typeof value === "string") {
    return [{ path: prefix, base: value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => flatten(item, `${prefix}.${i}`));
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, v]) =>
      flatten(v, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
}

interface TranslationDoc {
  locale: string;
  content: Record<string, unknown>;
}

/** Overrides por idioma. */
type ByLocale = Record<Locale, Record<string, string>>;

const emptyByLocale = (): ByLocale => ({ "pt-BR": {}, en: {}, es: {} });

interface TextsFormProps {
  /** Quais caminhos do dicionário esta aba mostra. */
  filter: (path: string) => boolean;
  /** Renderizado no topo de um grupo (a prévia do Google, no SEO). */
  renderGroupPreview?: (group: string, values: Record<string, string>) => React.ReactNode;
}

/**
 * Editor de textos do site, com os três idiomas lado a lado.
 *
 * Os grupos abrem um por vez e só o aberto renderiza seus campos: são 175
 * textos × 3 idiomas, e montar as 525 caixas de uma vez faria cada tecla
 * digitada repintar a página inteira.
 */
export function TextsForm({ filter, renderGroupPreview }: TextsFormProps) {
  // `overrides` é só para exibir (valor do input); `dirty` guarda apenas o que a
  // pessoa mudou nesta sessão — é o que handleSave aplica por cima do GET
  // fresco, para não pisar em ramos que outra aba (ou o editor visual) gravou
  // enquanto esta tela estava aberta.
  const [overrides, setOverrides] = useState<ByLocale>(emptyByLocale);
  const [dirty, setDirty] = useState<ByLocale>(emptyByLocale);
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // O pt-BR é o dicionário canônico: define quais caminhos existem.
  const fields = useMemo(() => flatten(ptBR).filter((field) => filter(field.path)), [filter]);

  const groups = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const field of fields) {
      const group = field.path.split(".")[0] ?? "";
      map.set(group, [...(map.get(group) ?? []), field]);
    }
    return map;
  }, [fields]);

  useEffect(() => {
    void (async () => {
      try {
        const responses = await Promise.all(
          LOCALES.map((item) => api<TranslationDoc | null>(`/translations?locale=${item.id}`))
        );
        const next = emptyByLocale();
        LOCALES.forEach((item, index) => {
          const saved = responses[index].data?.content
            ? flatten(responses[index].data!.content)
            : [];
          // Ignora overrides vazios: um "" pode ter sido gravado por uma versão
          // anterior do painel. Sem o filtro, ele volta como "alterado" e deixa
          // o campo em branco.
          next[item.id] = Object.fromEntries(
            saved.filter((field) => field.base !== "").map((field) => [field.path, field.base])
          );
        });
        setOverrides(next);
        setDirty(emptyByLocale());
        setLoaded(true);
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
        setLoaded(true);
      }
    })();
  }, []);

  function setField(locale: Locale, path: string, value: string, base: string) {
    setOverrides((current) => {
      const next = { ...current[locale] };
      if (value === base || value === "") {
        delete next[path];
      } else {
        next[path] = value;
      }
      return { ...current, [locale]: next };
    });
    setDirty((current) => ({
      // Vazio ou igual ao padrão vira "" — sinal para handleSave remover o
      // override (deleteByPath) em vez de gravar "" no content.
      ...current,
      [locale]: { ...current[locale], [path]: value === base ? "" : value },
    }));
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      // Um PATCH por idioma, e só para os que mudaram: a rota substitui o
      // content inteiro de um locale por vez.
      for (const item of LOCALES) {
        const changes = Object.entries(dirty[item.id]);
        if (changes.length === 0) {
          continue;
        }
        const { data } = await api<TranslationDoc | null>(`/translations?locale=${item.id}`);
        let content: Record<string, unknown> = data?.content ?? {};
        for (const [path, value] of changes) {
          content = value === "" ? deleteByPath(content, path) : setByPath(content, path, value);
        }
        await api("/translations", { method: "PATCH", json: { locale: item.id, content } });
      }
      setDirty(emptyByLocale());
      setMessage("Textos salvos — o site já foi atualizado.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  const pending = LOCALES.reduce((total, item) => total + Object.keys(dirty[item.id]).length, 0);

  if (!loaded) {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Cada texto aparece nos três idiomas. Apagar um campo devolve o texto padrão.
      </p>

      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-primary text-sm">{message}</p> : null}

      {[...groups.entries()].map(([group, groupFields]) => {
        const info = GROUPS[group] ?? { label: group, hint: "", region: "none" as PageRegion };
        const isOpen = open === group;
        const changedHere = LOCALES.reduce(
          (total, item) =>
            total + groupFields.filter((field) => field.path in dirty[item.id]).length,
          0
        );

        return (
          <section key={group} className="border-border overflow-hidden rounded-xl border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : group)}
              aria-expanded={isOpen}
              className="hover:bg-muted/40 flex w-full items-center gap-4 p-5 text-left transition-colors"
            >
              <PageDiagram region={info.region} className="shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="font-heading block">{info.label}</span>
                <span className="text-muted-foreground block text-xs">{info.hint}</span>
              </span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {groupFields.length} {groupFields.length === 1 ? "texto" : "textos"}
                {changedHere > 0 ? <span className="text-primary ml-2">● alterado</span> : null}
              </span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground size-4 shrink-0 transition-transform",
                  isOpen && "rotate-180"
                )}
                aria-hidden
              />
            </button>

            {/* Só o grupo aberto monta os campos — ver a nota do componente. */}
            {isOpen ? (
              <div className="border-border space-y-6 border-t p-5">
                {renderGroupPreview?.(
                  group,
                  Object.fromEntries(
                    groupFields.map((field) => [
                      field.path,
                      overrides["pt-BR"][field.path] ?? field.base,
                    ])
                  )
                )}

                {groupFields.map((field) => (
                  <div key={field.path} className="space-y-2">
                    <p className="text-muted-foreground font-mono text-xs">
                      {field.path.split(".").slice(1).join(" › ") || field.path}
                    </p>
                    {LOCALES.map((item) => {
                      const base = getByPath(baseDictionaries[item.id], field.path) ?? "";
                      const value = overrides[item.id][field.path] ?? base;
                      const long = base.length > 80;
                      const id = `t-${item.id}-${field.path}`;
                      return (
                        <div key={item.id} className="flex items-start gap-3">
                          <label
                            htmlFor={id}
                            className="text-muted-foreground w-20 shrink-0 pt-2 text-xs"
                          >
                            {item.label}
                          </label>
                          {long ? (
                            <Textarea
                              id={id}
                              value={value}
                              onChange={(event) =>
                                setField(item.id, field.path, event.target.value, base)
                              }
                              className="min-h-16 text-sm"
                            />
                          ) : (
                            <Input
                              id={id}
                              value={value}
                              onChange={(event) =>
                                setField(item.id, field.path, event.target.value, base)
                              }
                              className="h-9 text-sm"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}

      <div className="sticky bottom-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={busy || pending === 0} className="shadow-lg">
          {busy ? "Salvando..." : "Salvar textos"}
        </Button>
        {pending > 0 ? (
          <span className="text-muted-foreground text-xs">
            {pending} {pending === 1 ? "alteração pendente" : "alterações pendentes"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
