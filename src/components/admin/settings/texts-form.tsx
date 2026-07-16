"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { setByPath } from "@/lib/cms/refs";
import ptBR from "@/i18n/dictionaries/pt-BR.json";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";

const locales = ["pt-BR", "en", "es"] as const;
type Locale = (typeof locales)[number];

const baseDictionaries: Record<Locale, unknown> = { "pt-BR": ptBR, en, es };

/** Nomes amigáveis das áreas do site. */
const groupLabels: Record<string, string> = {
  meta: "SEO — títulos e descrições",
  hero: "Hero (topo da home)",
  nav: "Menu de navegação",
  common: "Botões e textos comuns",
  sections: "Seções da home",
  aboutPage: "Página Sobre",
  portfolioPage: "Página Portfólio",
  projectPage: "Página de Projeto",
  categories: "Categorias do portfólio",
  footer: "Rodapé",
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

interface TextsFormProps {
  /** Quais caminhos do dicionário esta aba mostra. */
  filter: (path: string) => boolean;
}

/** Editor de textos do site, campo a campo, por idioma (Docs/12), restrito ao filtro da aba. */
export function TextsForm({ filter }: TextsFormProps) {
  const [locale, setLocale] = useState<Locale>("pt-BR");
  // `overrides` é só para exibir (valor do input); `dirty` guarda apenas o
  // que a pessoa mudou nesta sessão — é o que handleSave aplica por cima do
  // GET fresco, para não pisar em ramos que outra aba (ou o editor visual)
  // gravou enquanto esta tela estava aberta.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fields = useMemo(
    () => flatten(baseDictionaries[locale]).filter((field) => filter(field.path)),
    [locale, filter]
  );
  const groups = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const field of fields) {
      const group = field.path.split(".")[0] ?? "";
      map.set(group, [...(map.get(group) ?? []), field]);
    }
    return map;
  }, [fields]);

  useEffect(() => {
    void api<TranslationDoc | null>(`/translations?locale=${locale}`)
      .then(({ data }) => {
        const saved = data?.content ? flatten(data.content) : [];
        setOverrides(Object.fromEntries(saved.map((f) => [f.path, f.base])));
        // Idioma trocou: recarrega do banco e descarta mudanças pendentes do
        // idioma anterior, senão elas vazariam para o novo idioma no save.
        setDirty({});
        setError(null);
        setMessage(null);
      })
      .catch((err) => setError(err instanceof AdminApiError ? err.message : "Falha ao carregar."));
  }, [locale]);

  function setField(path: string, value: string, base: string) {
    setOverrides((current) => {
      const next = { ...current };
      if (value === base || value === "") {
        delete next[path];
      } else {
        next[path] = value;
      }
      return next;
    });
    setDirty((current) => {
      // Vazio ou igual ao padrão: grava "" para o dicionário base assumir de
      // volta (deepMerge do servidor ignora string vazia). Sempre registra o
      // caminho como alterado nesta sessão, mesmo voltando ao valor salvo —
      // handleSave precisa reaplicá-lo por cima do GET fresco de qualquer forma.
      return { ...current, [path]: value === base ? "" : value };
    });
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
      // Parte sempre do que está salvo agora e toca só o que esta sessão mudou: a
      // rota substitui o content inteiro, e um merge raso reverteria ramos que
      // outra aba — ou o editor visual — gravou enquanto esta tela estava aberta.
      let content: Record<string, unknown> = data?.content ?? {};
      for (const [path, value] of Object.entries(dirty)) {
        content = setByPath(content, path, value);
      }
      await api("/translations", { method: "PATCH", json: { locale, content } });
      setDirty({});
      setMessage("Textos salvos — o site já foi atualizado.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Textos do site</h1>
        <div className="flex gap-2">
          {locales.map((item) => (
            <Button
              key={item}
              variant={item === locale ? "default" : "outline"}
              size="sm"
              onClick={() => setLocale(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Edite qualquer texto e salve. Campos alterados aparecem destacados; vazio volta ao padrão.
      </p>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}
      {message ? <p className="text-success text-sm">{message}</p> : null}

      {[...groups.entries()].map(([group, groupFields]) => (
        <section key={group} className="border-border bg-background rounded-lg border p-6">
          <h2 className="font-heading text-lg">{groupLabels[group] ?? group}</h2>
          <div className="mt-4 space-y-4">
            {groupFields.map((field) => {
              const value = overrides[field.path] ?? field.base;
              const changed = field.path in overrides;
              const long = field.base.length > 80;
              const id = `t-${field.path}`;
              const label = field.path.split(".").slice(1).join(" › ") || field.path;
              return (
                <div key={field.path} className="space-y-1.5">
                  <Label htmlFor={id} className="text-muted-foreground text-xs">
                    {label}
                    {changed ? <span className="text-primary ml-2">● alterado</span> : null}
                  </Label>
                  {long ? (
                    <Textarea
                      id={id}
                      value={value}
                      onChange={(e) => setField(field.path, e.target.value, field.base)}
                      className="min-h-20 text-sm"
                    />
                  ) : (
                    <Input
                      id={id}
                      value={value}
                      onChange={(e) => setField(field.path, e.target.value, field.base)}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4">
        <Button onClick={handleSave} disabled={busy} className="shadow-lg">
          {busy ? "Salvando..." : "Salvar textos"}
        </Button>
      </div>
    </div>
  );
}
