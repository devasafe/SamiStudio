# Painel do editor visual com os 3 idiomas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No editor visual (`/admin/editor`), ao clicar num texto, abrir os três idiomas (Português/English/Español) de uma vez num painel único, com um botão que salva os três.

**Architecture:** Extrair a edição de texto de `edit-panel.tsx` para um componente novo `text-fields.tsx` que carrega os overrides dos três idiomas (`GET /translations`) e os textos padrão (dicionários JSON), renderiza três campos, e ao salvar faz um `PATCH /translations` por idioma. O `edit-panel` passa a rotear: `text` → `<TextFields>`; `set`/`img` seguem inalterados.

**Tech Stack:** Next.js 16 (App Router, client component), React 19, TypeScript strict, Tailwind v4.

## Global Constraints

- TypeScript strict: `any`/`ts-ignore` proibidos.
- Só textos (`data-cms="text:..."`) mudam. `set:` (dados de contato) e `img:` (fotos) continuam campo único, comportamento intacto.
- Campo de texto salvo vazio **remove** o override (`deleteByPath`), não grava `""` — regra já existente no projeto (senão o painel relê `""` como override e mostra campo em branco marcado como alterado).
- Ao salvar, parte-se sempre do `content` salvo de cada locale antes de aplicar a mudança, para não apagar os outros overrides daquele idioma (a rota `PATCH /translations` substitui o `content` inteiro).
- Idiomas e rótulos, nesta ordem: `pt-BR` = "Português", `en` = "English", `es` = "Español" (mesmos do seletor do topo do editor).
- Commits: Conventional Commits, um tipo no header, subject sem maiúscula inicial.

---

### Task 1: Componente `TextFields` (edita os 3 idiomas)

**Files:**
- Create: `src/components/admin/editor/text-fields.tsx`

**Interfaces:**
- Consumes: `api`, `AdminApiError` de `@/components/admin/api-client`; `Button`, `Input`, `Textarea` de `@/components/ui/*`; `getByPath`, `setByPath`, `deleteByPath` de `@/lib/cms/refs`; os dicionários `@/i18n/dictionaries/{pt-BR,en,es}.json`.
- Produces: `<TextFields selectionRef={string} path={string} previewLocale={string} baseValue={string} onSaved={(ref: string, value: string) => void} />` — consumido por `edit-panel.tsx` (Task 2).

- [ ] **Step 1: Criar o componente**

Criar `src/components/admin/editor/text-fields.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import en from "@/i18n/dictionaries/en.json";
import es from "@/i18n/dictionaries/es.json";
import ptBR from "@/i18n/dictionaries/pt-BR.json";
import { deleteByPath, getByPath, setByPath } from "@/lib/cms/refs";

/** Idiomas do site, na ordem e rótulos do seletor do editor. */
const LOCALES = [
  { value: "pt-BR", label: "Português", dict: ptBR as Record<string, unknown> },
  { value: "en", label: "English", dict: en as Record<string, unknown> },
  { value: "es", label: "Español", dict: es as Record<string, unknown> },
] as const;

interface TranslationDoc {
  locale: string;
  content: Record<string, unknown>;
}

interface TextFieldsProps {
  /** Referência original (para avisar a prévia). */
  selectionRef: string;
  /** Caminho do texto no dicionário (ex.: sections.about.title). */
  path: string;
  /** Idioma que a prévia mostra — é o valor que atualiza na prévia ao salvar. */
  previewLocale: string;
  /** Texto renderizado na prévia — fallback do idioma da prévia se o GET falhar. */
  baseValue: string;
  /** Avisa a prévia (mesmo contrato do EditPanel). */
  onSaved: (ref: string, value: string) => void;
}

/**
 * Edição de um texto nos três idiomas de uma vez. Cada campo traz o override
 * salvo daquele idioma; vazio mostra o texto padrão do dicionário como
 * placeholder e, ao salvar, volta ao padrão (remove o override). Salva com um
 * PATCH por idioma, partindo do content salvo de cada um para não apagar os
 * outros overrides.
 */
export function TextFields({
  selectionRef,
  path,
  previewLocale,
  baseValue,
  onSaved,
}: TextFieldsProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  // Content salvo por locale: base para gravar sem apagar os outros overrides.
  const [contents, setContents] = useState<Record<string, Record<string, unknown>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Placeholder de cada idioma = texto padrão do dicionário naquele caminho.
  const placeholders = useMemo(() => {
    const map: Record<string, string> = {};
    for (const { value, dict } of LOCALES) {
      map[value] = getByPath(dict, path) ?? "";
    }
    return map;
  }, [path]);

  // Busca os overrides dos três idiomas de uma vez. `ignore` evita a corrida de
  // trocar de seleção rápido (clicar em A e depois B antes de A responder).
  useEffect(() => {
    let ignore = false;
    void (async () => {
      setError(null);
      setSaved(false);
      try {
        const { data } = await api<TranslationDoc[]>("/translations");
        if (ignore) {
          return;
        }
        const byLocale = new Map((data ?? []).map((doc) => [doc.locale, doc.content ?? {}]));
        const nextValues: Record<string, string> = {};
        const nextContents: Record<string, Record<string, unknown>> = {};
        for (const { value } of LOCALES) {
          const content = byLocale.get(value) ?? {};
          nextContents[value] = content;
          // "" cai no padrão, não vira override em branco: pode ser um "" legado
          // gravado por uma versão anterior (mesma leitura defensiva do painel).
          nextValues[value] = getByPath(content, path) || "";
        }
        setContents(nextContents);
        setValues(nextValues);
      } catch (err) {
        if (ignore) {
          return;
        }
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar os textos.");
        // Sem dados, ao menos preenche o idioma da prévia com o texto visível.
        setValues({ [previewLocale]: baseValue });
        setContents({});
      }
    })();
    return () => {
      ignore = true;
    };
  }, [path, previewLocale, baseValue]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      for (const { value: locale } of LOCALES) {
        const next = values[locale] ?? "";
        const base = contents[locale] ?? {};
        // Vazio volta ao padrão (remove o override) em vez de gravar "".
        const content = next === "" ? deleteByPath(base, path) : setByPath(base, path, next);
        await api("/translations", { method: "PATCH", json: { locale, content } });
      }
      setSaved(true);
      // Só o idioma que a prévia mostra precisa refletir agora.
      onSaved(selectionRef, values[previewLocale] ?? "");
    } catch (err) {
      // Mantém o que foi digitado: perder o texto é inaceitável.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  function setLocaleValue(locale: string, value: string) {
    setValues((prev) => ({ ...prev, [locale]: value }));
  }

  return (
    <div className="space-y-4">
      {LOCALES.map(({ value: locale, label }) => {
        const current = values[locale] ?? "";
        const long = current.length > 80 || placeholders[locale].length > 80;
        return (
          <div key={locale} className="space-y-1">
            <label className="text-muted-foreground text-xs">{label}</label>
            {long ? (
              <Textarea
                value={current}
                placeholder={placeholders[locale]}
                onChange={(event) => setLocaleValue(locale, event.target.value)}
                className="min-h-24"
              />
            ) : (
              <Input
                value={current}
                placeholder={placeholders[locale]}
                onChange={(event) => setLocaleValue(locale, event.target.value)}
              />
            )}
          </div>
        );
      })}

      <Button onClick={() => void save()} disabled={busy} className="w-full">
        {busy ? "Salvando..." : "Salvar"}
      </Button>

      {error ? <p className="text-error text-sm">{error}</p> : null}
      {saved && !error ? <p className="text-success text-sm">Salvo.</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros. (Se o lint reclamar de ler `.current`/impureza, não se aplica aqui — não há refs nem funções impuras no render. Se reclamar de `set...` em effect, o setState está dentro do callback async, como no `edit-panel` atual.)

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/editor/text-fields.tsx
git commit -m "feat: campos dos 3 idiomas no editor visual"
```

---

### Task 2: Integrar `TextFields` no `EditPanel`

**Files:**
- Modify: `src/components/admin/editor/edit-panel.tsx`

**Interfaces:**
- Consumes: `TextFields` de `@/components/admin/editor/text-fields` (Task 1).
- Produces: `EditPanel` com a mesma assinatura pública (`selection`, `locale`, `onSaved`); a edição de `text` passa a mostrar os três idiomas, `set`/`img` inalterados.

- [ ] **Step 1: Importar o componente**

Em `src/components/admin/editor/edit-panel.tsx`, adicionar aos imports (junto dos outros de `@/components/admin/...`):

```tsx
import { TextFields } from "@/components/admin/editor/text-fields";
```

- [ ] **Step 2: Remover o carregamento e o save específicos de texto**

O `TextFields` agora cuida de carregar e salvar texto. No `edit-panel.tsx`, o `useEffect` de carga e a função `save` só precisam tratar `set`/`img`. Substituir o bloco do `useEffect` que hoje é:

```tsx
  useEffect(() => {
    let ignore = false;
    void (async () => {
      setError(null);
      setSaved(false);
      if (!selection || !ref) {
        setValue("");
        return;
      }
      try {
        if (ref.kind === "text") {
          const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
          if (ignore) {
            return;
          }
          // "" cai no valor padrão, não vira campo em branco: pode ser um
          // override "" gravado por uma versão anterior do painel (que
          // persistia "" em vez de remover ao voltar ao padrão) — ler isso
          // como override de verdade reproduziria o mesmo bug a cada carga.
          setValue(getByPath(data?.content, ref.path) || selection.value);
          return;
        }
        const { data } = await api<Settings | null>("/settings");
        if (ignore) {
          return;
        }
        setValue(data?.[ref.path] ?? "");
      } catch (err) {
        if (ignore) {
          return;
        }
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar o valor.");
        setValue(selection.value);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selection, locale, ref]);
```

por (sai o ramo `text`; `TextFields` cuida dele — o effect só carrega `set`/`img`):

```tsx
  useEffect(() => {
    let ignore = false;
    void (async () => {
      setError(null);
      setSaved(false);
      // Texto é tratado pelo <TextFields> (os três idiomas); aqui só set/img.
      if (!selection || !ref || ref.kind === "text") {
        setValue("");
        return;
      }
      try {
        const { data } = await api<Settings | null>("/settings");
        if (ignore) {
          return;
        }
        setValue(data?.[ref.path] ?? "");
      } catch (err) {
        if (ignore) {
          return;
        }
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar o valor.");
        setValue(selection.value);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [selection, locale, ref]);
```

- [ ] **Step 3: Podar o ramo `text` da função `save`**

O `save` do painel só serve a `set`/`img` agora. Substituir a função `save` atual:

```tsx
  async function save(next: string) {
    if (!ref) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (ref.kind === "text") {
        // A rota substitui o content inteiro: parte do salvo para não apagar
        // os outros overrides do mesmo idioma.
        const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
        // Vazio (voltar ao padrão) remove o override em vez de gravar "": um ""
        // persistido seria lido de volta como override (deepMerge do servidor
        // ignora string vazia, mas a leitura acima do painel não), reproduzindo
        // o mesmo campo em branco marcado como alterado.
        const content =
          next === ""
            ? deleteByPath(data?.content ?? {}, ref.path)
            : setByPath(data?.content ?? {}, ref.path, next);
        await api("/translations", { method: "PATCH", json: { locale, content } });
      } else {
        await api("/settings", { method: "PATCH", json: { [ref.path]: next } });
      }
      setSaved(true);
      onSaved(selection!.ref, next);
    } catch (err) {
      // Mantém o texto digitado: perder o que ela escreveu é inaceitável.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
```

por (só `set`/`img`):

```tsx
  async function save(next: string) {
    if (!ref) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/settings", { method: "PATCH", json: { [ref.path]: next } });
      setSaved(true);
      onSaved(selection!.ref, next);
    } catch (err) {
      // Mantém o texto digitado: perder o que ela escreveu é inaceitável.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
```

- [ ] **Step 4: Renderizar `<TextFields>` para `text`**

No JSX de retorno do `EditPanel`, o corpo que hoje escolhe entre `ImageField` e o par `Input`/`Textarea` é:

```tsx
      {ref.kind === "img" ? (
        <ImageField
          label="Foto"
          value={value}
          aspect={IMAGE_ASPECTS[ref.path] ?? 4 / 5}
          onChange={(url) => {
            setValue(url);
            void save(url);
          }}
        />
      ) : (
        <>
          {value.length > 80 ? (
            <Textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-40"
            />
          ) : (
            <Input value={value} onChange={(event) => setValue(event.target.value)} />
          )}
          <Button onClick={() => void save(value)} disabled={busy} className="w-full">
            {busy ? "Salvando..." : "Salvar"}
          </Button>
        </>
      )}
```

Substituir por (adiciona o ramo `text` → `<TextFields>`; `img` e `set` seguem iguais):

```tsx
      {ref.kind === "text" ? (
        <TextFields
          selectionRef={selection.ref}
          path={ref.path}
          previewLocale={locale}
          baseValue={selection.value}
          onSaved={onSaved}
        />
      ) : ref.kind === "img" ? (
        <ImageField
          label="Foto"
          value={value}
          aspect={IMAGE_ASPECTS[ref.path] ?? 4 / 5}
          onChange={(url) => {
            setValue(url);
            void save(url);
          }}
        />
      ) : (
        <>
          {value.length > 80 ? (
            <Textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-40"
            />
          ) : (
            <Input value={value} onChange={(event) => setValue(event.target.value)} />
          )}
          <Button onClick={() => void save(value)} disabled={busy} className="w-full">
            {busy ? "Salvando..." : "Salvar"}
          </Button>
        </>
      )}
```

- [ ] **Step 5: Remover imports agora sem uso**

Ao podar o ramo `text`, `getByPath`, `setByPath`, `deleteByPath` e o tipo `TranslationDoc` podem ter ficado sem uso em `edit-panel.tsx`. Rodar o lint (próximo passo) aponta os não usados; removê-los do `import` de `@/lib/cms/refs` e a `interface TranslationDoc` se o lint acusar. Manter `parseRef`, `getByPath` **se** ainda usados por `set`/`img` (o `save` de `set` não usa `getByPath`; conferir pelo lint). O cabeçalho do idioma ("Idioma: {locale}") que só fazia sentido com um idioma deve sair, já que o `TextFields` rotula cada campo — remover o bloco:

```tsx
        {ref.kind === "text" ? (
          <p className="text-muted-foreground mt-1 text-xs">Idioma: {locale}</p>
        ) : null}
```

- [ ] **Step 6: Typecheck + lint + testes**

Run: `npm run typecheck && npm run lint && npm test`
Expected: tudo passa; nenhum import/variável sem uso.

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/editor/edit-panel.tsx
git commit -m "feat: painel do editor edita os 3 idiomas de uma vez"
```

---

### Task 3: Verificação manual ponta a ponta

**Files:** nenhum (usar a skill `run`).

- [ ] **Step 1: Subir o servidor e logar no admin**

```bash
npm run dev
```
Abrir `/admin/editor` (logado). A prévia usa `?cmsPreview=1` — não deve haver "redirecionamento em excesso".

- [ ] **Step 2: Editar um texto nos 3 idiomas**

Clicar num texto da prévia (ex.: título da home). Confirmar que o painel abre com três campos rotulados **Português / English / Español**, cada um com o texto salvo daquele idioma (ou o padrão como placeholder cinza quando vazio). Editar os três, clicar em **Salvar**, ver "Salvo.".

- [ ] **Step 3: Conferir cada idioma na prévia**

Trocar o seletor de idioma no topo (Português → English → Español) e confirmar que cada tradução salva aparece no ar. A prévia do idioma atual deve refletir logo após salvar (sem trocar o seletor).

- [ ] **Step 4: Voltar ao padrão**

Clicar no mesmo texto, apagar um dos idiomas (deixar em branco), salvar. Confirmar que aquele idioma volta ao texto padrão do dicionário no site (o placeholder cinza) e que os outros dois idiomas seguem com o texto editado.

- [ ] **Step 5: `set`/`img` intactos**

Clicar num dado de contato (ex.: telefone no rodapé) e numa foto: confirmar que continuam com **um** campo só (sem os três idiomas), salvando como antes.

- [ ] **Step 6: Console limpo**

DevTools sem erros em nenhuma das telas acima.

Se algo destoar, reportar antes de dar a task por concluída.
