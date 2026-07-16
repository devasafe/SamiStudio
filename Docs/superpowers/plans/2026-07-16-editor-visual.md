# Editor Visual de Conteúdo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que a Sami edite textos, fotos e dados de contato clicando na página, dentro do painel, sem abrir as telas de Traduções/Configurações.

**Architecture:** `/admin/editor` mostra o site num iframe same-origin. O layout do site carrega um `EditBridge` inerte que só ativa o overlay de edição após um handshake por `postMessage` — nunca lendo cookie/query no servidor, o que tornaria todas as páginas dinâmicas. Os elementos editáveis carregam `data-cms="<kind>:<path>"` (`text:` dicionário, `set:` configuração, `img:` foto). Clique → o painel do admin abre o campo certo → `PATCH` pelas rotas que já existem.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind v4, Vitest (node), Mongoose.

## Global Constraints

- Spec: `Docs/superpowers/specs/2026-07-16-editor-visual-design.md`.
- **Vitest roda em `environment: "node"` e só inclui `src/**/*.test.ts`** (não `.tsx`). Não há jsdom nem testing-library, e **não instale**: toda lógica testável vive em `.ts` puro.
- **Não tornar páginas do site dinâmicas.** Proibido `cookies()`, `headers()` ou `searchParams` nas páginas de `src/app/[locale]/` para o modo edição.
- Admin usa **texto PT direto** (sem i18n).
- Ícones sempre de `@/components/icons` — nunca direto de `lucide-react`.
- Imagens só via upload (Cloudinary); `uploadedImage` (Zod) rejeita URL externa.
- Cores da marca: `#141009` (fundo), `#0f0c09` (fundo alt), `#f2ece0` (creme), `#cf5a18` (terracota).
- Commits: subject em minúsculas (commitlint), corpo explicando o porquê, e terminar com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Rodar antes de cada commit: `npx tsc --noEmit`, `npx eslint src`, `npx vitest run`.

---

### Task 1: Referências e protocolo (lógica pura)

**Files:**
- Create: `src/lib/cms/refs.ts`
- Create: `src/lib/cms/refs.test.ts`
- Create: `src/lib/cms/protocol.ts`
- Create: `src/lib/cms/protocol.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type CmsKind = "text" | "set" | "img"`
  - `interface CmsRef { kind: CmsKind; path: string }`
  - `interface CmsSelection { ref: string; value: string; count: number }` — **o
    único lugar onde este tipo é definido**; Tasks 5 e 6 importam daqui.
  - `parseRef(raw: string): CmsRef | null`
  - `serializeRef(ref: CmsRef): string`
  - `getByPath(source: unknown, path: string): string | undefined`
  - `setByPath(source: Record<string, unknown>, path: string, value: string): Record<string, unknown>`
  - `type CmsMessage` (união abaixo), `isCmsMessage(data: unknown): data is CmsMessage`
  - `isTrustedEditMessage(event: TrustedInput, expectedOrigin: string, expectedSource: unknown): boolean`
  - `interface TrustedInput { origin: string; source: unknown; data: unknown }`

- [ ] **Step 1: Escrever o teste que falha (refs)**

Create `src/lib/cms/refs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getByPath, parseRef, serializeRef, setByPath } from "./refs";

describe("parseRef", () => {
  it("separa tipo e caminho", () => {
    expect(parseRef("text:sections.about.title")).toEqual({
      kind: "text",
      path: "sections.about.title",
    });
  });

  it("aceita os três tipos", () => {
    expect(parseRef("set:email")?.kind).toBe("set");
    expect(parseRef("img:aboutPhoto")?.kind).toBe("img");
  });

  it("recusa tipo desconhecido, caminho vazio e string sem separador", () => {
    expect(parseRef("outro:x")).toBeNull();
    expect(parseRef("text:")).toBeNull();
    expect(parseRef("sections.about.title")).toBeNull();
    expect(parseRef(":x")).toBeNull();
  });

  it("serializeRef é o inverso de parseRef", () => {
    const raw = "text:sections.about.title";
    expect(serializeRef(parseRef(raw)!)).toBe(raw);
  });
});

describe("getByPath", () => {
  const dict = { sections: { about: { title: "Oi" } }, values: [{ title: "Um" }] };

  it("lê caminho aninhado", () => {
    expect(getByPath(dict, "sections.about.title")).toBe("Oi");
  });

  it("lê índice de array", () => {
    expect(getByPath(dict, "values.0.title")).toBe("Um");
  });

  it("devolve undefined para caminho inexistente ou valor não-texto", () => {
    expect(getByPath(dict, "sections.nada.title")).toBeUndefined();
    expect(getByPath(dict, "sections.about")).toBeUndefined();
    expect(getByPath(dict, "")).toBeUndefined();
  });
});

describe("setByPath", () => {
  it("cria o caminho aninhado", () => {
    expect(setByPath({}, "sections.about.title", "Novo")).toEqual({
      sections: { about: { title: "Novo" } },
    });
  });

  it("preserva os irmãos", () => {
    const before = { sections: { about: { title: "A", text: "B" }, faq: { title: "C" } } };
    expect(setByPath(before, "sections.about.title", "Z")).toEqual({
      sections: { about: { title: "Z", text: "B" }, faq: { title: "C" } },
    });
  });

  it("não muta a origem", () => {
    const before = { sections: { about: { title: "A" } } };
    setByPath(before, "sections.about.title", "Z");
    expect(before.sections.about.title).toBe("A");
  });

  it("usa índice como chave (o merge do servidor casa com o array base)", () => {
    expect(setByPath({}, "values.0.title", "Um")).toEqual({ values: { "0": { title: "Um" } } });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/cms/refs.test.ts`
Expected: FAIL — "Failed to resolve import './refs'".

- [ ] **Step 3: Implementar refs.ts**

Create `src/lib/cms/refs.ts`:

```ts
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
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/cms/refs.test.ts`
Expected: PASS — 11 testes.

- [ ] **Step 5: Escrever o teste que falha (protocol)**

Create `src/lib/cms/protocol.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isCmsMessage, isTrustedEditMessage } from "./protocol";

const parent = { name: "parent" };
const ORIGIN = "https://site.com";

describe("isCmsMessage", () => {
  it("aceita as mensagens do protocolo", () => {
    expect(isCmsMessage({ type: "cms:enable" })).toBe(true);
    expect(isCmsMessage({ type: "cms:ready" })).toBe(true);
    expect(isCmsMessage({ type: "cms:select", ref: "text:a", value: "x", count: 1 })).toBe(true);
    expect(isCmsMessage({ type: "cms:patch", ref: "text:a", value: "x" })).toBe(true);
  });

  it("recusa lixo", () => {
    expect(isCmsMessage(null)).toBe(false);
    expect(isCmsMessage("cms:enable")).toBe(false);
    expect(isCmsMessage({ type: "outro" })).toBe(false);
    expect(isCmsMessage({ type: "cms:select" })).toBe(false);
    expect(isCmsMessage({ type: "cms:select", ref: "text:a", value: "x" })).toBe(false);
  });
});

describe("isTrustedEditMessage", () => {
  const good = { origin: ORIGIN, source: parent, data: { type: "cms:enable" } };

  it("aceita origem e source esperados com mensagem válida", () => {
    expect(isTrustedEditMessage(good, ORIGIN, parent)).toBe(true);
  });

  it("recusa origem diferente", () => {
    expect(isTrustedEditMessage({ ...good, origin: "https://mau.com" }, ORIGIN, parent)).toBe(false);
  });

  it("recusa source diferente do esperado", () => {
    expect(isTrustedEditMessage({ ...good, source: { name: "outro" } }, ORIGIN, parent)).toBe(false);
  });

  it("recusa mensagem fora do protocolo", () => {
    expect(isTrustedEditMessage({ ...good, data: { type: "hack" } }, ORIGIN, parent)).toBe(false);
  });
});
```

- [ ] **Step 6: Rodar e ver falhar**

Run: `npx vitest run src/lib/cms/protocol.test.ts`
Expected: FAIL — "Failed to resolve import './protocol'".

- [ ] **Step 7: Implementar protocol.ts**

Create `src/lib/cms/protocol.ts`:

```ts
/**
 * Protocolo entre o painel (/admin/editor) e o site dentro do iframe.
 * A conferência de confiança é função pura para poder ser testada sem DOM.
 */
export type CmsMessage =
  /** Painel → site: pode ativar a edição. */
  | { type: "cms:enable" }
  /** Site → painel: overlay montado. */
  | { type: "cms:ready" }
  /** Site → painel: a pessoa clicou num elemento editável. */
  | { type: "cms:select"; ref: string; value: string; count: number }
  /** Painel → site: aplica o novo valor na hora (otimista). */
  | { type: "cms:patch"; ref: string; value: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCmsMessage(data: unknown): data is CmsMessage {
  if (!isRecord(data) || typeof data.type !== "string") {
    return false;
  }
  switch (data.type) {
    case "cms:enable":
    case "cms:ready":
      return true;
    case "cms:patch":
      return typeof data.ref === "string" && typeof data.value === "string";
    case "cms:select":
      return (
        typeof data.ref === "string" &&
        typeof data.value === "string" &&
        typeof data.count === "number"
      );
    default:
      return false;
  }
}

export interface TrustedInput {
  origin: string;
  source: unknown;
  data: unknown;
}

/**
 * Só aceita mensagem da mesma origem, vinda da janela esperada e dentro do
 * protocolo. A proteção real dos dados é a sessão exigida pela API — isto
 * evita que outra página embutida converse com o editor.
 */
export function isTrustedEditMessage(
  event: TrustedInput,
  expectedOrigin: string,
  expectedSource: unknown
): boolean {
  return (
    event.origin === expectedOrigin &&
    event.source === expectedSource &&
    isCmsMessage(event.data)
  );
}
```

- [ ] **Step 8: Rodar tudo e ver passar**

Run: `npx vitest run && npx tsc --noEmit && npx eslint src`
Expected: PASS — 20 testes anteriores + 17 novos = 37; tsc e eslint sem saída.

- [ ] **Step 9: Commit**

```bash
git add src/lib/cms
git commit -m "$(cat <<'EOF'
feat(cms): referências e protocolo do editor visual

Base do editor: parse de data-cms, leitura/escrita por caminho no dicionário
e a conferência de confiança das mensagens entre painel e iframe.

A conferência é função pura porque o vitest do projeto roda em node, sem DOM.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Marcação da home + teste de integridade

**Files:**
- Create: `src/lib/cms/marks.test.ts`
- Modify: `src/components/about/about-section.tsx`
- Modify: `src/components/services/services-section.tsx`
- Modify: `src/components/shared/process-section.tsx`
- Modify: `src/components/shared/faq-section.tsx`
- Modify: `src/components/shared/cta-section.tsx`
- Modify: `src/components/testimonials/testimonials-section.tsx`
- Modify: `src/components/home/latest-section.tsx`

**Interfaces:**
- Consumes: `getByPath` de `@/lib/cms/refs`.
- Produces: atributos `data-cms="text:<path>"` no HTML; nenhuma API nova.

**Regra da marcação:** o atributo vai **no elemento que já existe**. Só crie um
`<span>` quando o texto for um pedaço de um título maior (inline não quebra
layout). **Nunca** envolva blocos em `<div>` novo.

- [ ] **Step 1: Escrever o teste de integridade que falha**

Este é o teste mais importante do plano: um `data-cms` com caminho errado vira
um texto que nunca abre para editar, e ninguém descobre.

Create `src/lib/cms/marks.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/cms/marks.test.ts`
Expected: FAIL — "existe marcação no projeto": `expected +0 to be greater than +0`.

- [ ] **Step 3: Marcar a seção Sobre da home**

Em `src/components/about/about-section.tsx`, adicione o atributo aos elementos de
texto que hoje renderizam `{about.*}`. Padrão (confira os nomes reais no arquivo
antes de editar — os paths abaixo existem em `sections.about`):

```tsx
<p className="..." data-cms="text:sections.about.eyebrow">
  {about.eyebrow}
</p>
```

Para título com ênfase em itálico, marque cada pedaço:

```tsx
<h2 className="...">
  <span data-cms="text:sections.about.titleLead">{about.titleLead}</span>{" "}
  <span className="text-[#cf5a18] italic" data-cms="text:sections.about.titleEmphasis">
    {about.titleEmphasis}
  </span>
</h2>
```

Confirme cada caminho antes de escrever:

```bash
node -e "const d=require('./src/i18n/dictionaries/pt-BR.json');console.log(Object.keys(d.sections.about))"
```

- [ ] **Step 4: Marcar as demais seções da home**

Mesmo padrão em `services-section.tsx` (`sections.services.*`), `process-section.tsx`
(`sections.process.*`), `faq-section.tsx` (`sections.faq.*`), `cta-section.tsx`
(`sections.cta.*`), `testimonials-section.tsx` (`sections.testimonials.*`) e
`latest-section.tsx` (`sections.portfolio.*`).

**Não marque** conteúdo vindo do banco (título de projeto, pergunta de FAQ
cadastrada, texto de depoimento): esses têm tela própria e não estão no
dicionário — o teste do Step 1 rejeitaria o caminho.

Para itens de lista do dicionário, use índice:

```tsx
{process.steps.map((step, index) => (
  <h3 data-cms={`text:sections.process.steps.${index}.title`}>{step.title}</h3>
))}
```

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `npx vitest run src/lib/cms/marks.test.ts`
Expected: PASS — 3 testes. Se "todo text: aponta para um texto que existe"
falhar, a saída lista arquivo e caminho errado: corrija o caminho, não o teste.

- [ ] **Step 6: Conferir que nada quebrou visualmente**

Run: `npx tsc --noEmit && npx eslint src && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/`
Expected: sem saída de tsc/eslint; `200`.

Run: `curl -s http://localhost:3000/ | grep -o 'data-cms="[^"]*"' | sort -u | head`
Expected: lista dos caminhos marcados aparecendo no HTML renderizado.

- [ ] **Step 7: Commit**

```bash
git add src/lib/cms/marks.test.ts src/components
git commit -m "$(cat <<'EOF'
feat(cms): marcar os textos da home como editáveis

Cada texto do dicionário ganha data-cms com seu endereço, no elemento que já
existe — sem wrapper novo, que quebraria layout em flex e grid.

O teste varre os .tsx e falha se algum endereço não existir no dicionário: um
typo aí viraria um texto que nunca abre para editar, sem ninguém perceber.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Marcação das páginas, do rodapé e dos dados de contato

**Files:**
- Modify: `src/app/[locale]/sobre/page.tsx`
- Modify: `src/app/[locale]/servicos/page.tsx`
- Modify: `src/app/[locale]/portfolio/page.tsx`
- Modify: `src/app/[locale]/contato/page.tsx`
- Modify: `src/components/layout/footer.tsx`
- Modify: `src/components/layout/navbar.tsx`

**Interfaces:**
- Consumes: o teste de `src/lib/cms/marks.test.ts` (Task 2) já cobre estes arquivos.
- Produces: marcação `text:`, `set:` e `img:` nas páginas.

- [ ] **Step 1: Marcar os textos das quatro páginas**

Mesmo padrão da Task 2, com os caminhos de cada página: `aboutPage.*`,
`sections.services.*` (a página de serviços reusa a seção), `portfolioPage.*`,
`contactPage.*`.

Em `sobre/page.tsx`, o texto montado na hora fica **parcialmente** marcado — só o
pedaço fixo, porque o nome vem de outro campo:

```tsx
<h2 className="...">
  <span data-cms="text:aboutPage.founderGreeting">{page.founderGreeting}</span> {firstName}.
</h2>
```

- [ ] **Step 2: Marcar as fotos das configurações**

No elemento que envolve cada `<Image>` de foto vinda de `settings`:

```tsx
<div className="relative h-[26rem] lg:h-[38rem]" data-cms="img:aboutPhoto">
```

Fotos a marcar: `aboutPhoto` (sobre), `essencePhoto1`, `essencePhoto2` (sobre),
`contactPhoto` (contato).

- [ ] **Step 3: Marcar os dados de contato**

Em `contato/page.tsx`, no `<dd>` de cada canal, conforme a origem do dado:

```tsx
<dd className="..." data-cms="set:email">
```

Campos: `email`, `phone`, `instagram`, `address`, `locationNote`, `businessHours`.
Marque também os equivalentes no rodapé, se lá renderizarem o mesmo dado.

**Cuidado:** o bloco só existe quando o dado existe. Campo vazio não renderiza e
não tem o que marcar — é exatamente a limitação registrada na spec, e é por isso
que `/admin/ajustes` continua existindo (Task 7).

- [ ] **Step 4: Rodar o teste de integridade**

Run: `npx vitest run src/lib/cms/marks.test.ts`
Expected: PASS — 3 testes.

- [ ] **Step 5: Conferir as páginas**

Run:
```bash
for p in / /sobre /servicos /portfolio /contato; do
  echo -n "$p -> "; curl -s "http://localhost:3000$p" | grep -o 'data-cms' | wc -l
done
```
Expected: cada página com contagem > 0 (a home já vinha da Task 2).

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]" src/components/layout
git commit -m "$(cat <<'EOF'
feat(cms): marcar páginas, rodapé e dados de contato

Textos das páginas, fotos das configurações e os campos de contato ganham
data-cms. Em texto montado na hora, só o pedaço fixo é marcado — o nome vem
de outro campo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: EditBridge e overlay no site

**Files:**
- Create: `src/components/cms/edit-bridge.tsx`
- Create: `src/components/cms/edit-overlay.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `isTrustedEditMessage`, `isCmsMessage`, `CmsMessage` de `@/lib/cms/protocol`.
- Produces: `<EditBridge />` (sem props), montado no layout do site.

- [ ] **Step 1: Criar o EditBridge**

Create `src/components/cms/edit-bridge.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isTrustedEditMessage } from "@/lib/cms/protocol";

/**
 * Carregado só depois do handshake: o site público não paga o overlay.
 */
const EditOverlay = dynamic(() => import("./edit-overlay").then((m) => m.EditOverlay), {
  ssr: false,
});

/**
 * Ponte do modo de edição. Fica inerte no site público: só liga quando o
 * painel, na mesma origem e como janela-mãe, manda o handshake.
 *
 * Não lê cookie nem query no servidor de propósito — isso tornaria todas as
 * páginas dinâmicas e mataria o cache do site para beneficiar visitante nenhum.
 */
export function EditBridge() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Fora de um iframe não há editor nenhum para conversar.
    if (window.parent === window) {
      return;
    }

    function onMessage(event: MessageEvent) {
      if (!isTrustedEditMessage(event, window.location.origin, window.parent)) {
        return;
      }
      if ((event.data as { type: string }).type === "cms:enable") {
        setEnabled(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return enabled ? <EditOverlay /> : null;
}
```

- [ ] **Step 2: Criar o overlay**

Create `src/components/cms/edit-overlay.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { parseRef } from "@/lib/cms/refs";
import { isTrustedEditMessage, type CmsMessage } from "@/lib/cms/protocol";

/** Contorno do que é editável, injetado só no modo de edição. */
const STYLE = `
  [data-cms] {
    outline: 1px dashed rgba(207, 90, 24, 0.55);
    outline-offset: 2px;
    cursor: pointer;
    transition: outline-color 150ms;
  }
  [data-cms]:hover {
    outline: 2px solid #cf5a18;
    background: rgba(207, 90, 24, 0.08);
  }
`;

/**
 * Roda dentro do iframe: contorna os [data-cms], avisa o painel a cada clique
 * e aplica o valor novo na hora, para a prévia não esperar o servidor.
 */
export function EditOverlay() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    const send = (message: CmsMessage) =>
      window.parent.postMessage(message, window.location.origin);

    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cms]");
      if (!target) {
        return;
      }
      // Impede o link/botão sob o texto de navegar durante a edição.
      event.preventDefault();
      event.stopPropagation();
      const ref = target.dataset.cms ?? "";
      send({
        type: "cms:select",
        ref,
        value: target.textContent?.trim() ?? "",
        // Mesmo endereço em vários pontos da página muda todos de uma vez:
        // o painel avisa antes.
        count: document.querySelectorAll(`[data-cms="${ref}"]`).length,
      });
    }

    function onMessage(event: MessageEvent) {
      if (!isTrustedEditMessage(event, window.location.origin, window.parent)) {
        return;
      }
      const data = event.data as CmsMessage;
      if (data.type !== "cms:patch") {
        return;
      }
      // Só `text:` tem o valor como texto na tela. Em `set:`, o elemento pode
      // ser um rótulo fixo ("Instagram") cujo valor é uma URL; em `img:`, é a
      // moldura da foto. Escrever o valor neles apagaria o conteúdo visível —
      // nesses casos o editor recarrega a prévia em vez de adivinhar.
      if (parseRef(data.ref)?.kind !== "text") {
        return;
      }
      document.querySelectorAll<HTMLElement>(`[data-cms="${data.ref}"]`).forEach((element) => {
        element.textContent = data.value;
      });
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    send({ type: "cms:ready" });

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      style.remove();
    };
  }, []);

  return null;
}
```

- [ ] **Step 3: Montar no layout do site**

Em `src/app/[locale]/layout.tsx`, importe e monte junto dos outros providers
(dentro do `<body>`, ao lado de `<SmoothScroll />`):

```tsx
import { EditBridge } from "@/components/cms/edit-bridge";
```

```tsx
<EditBridge />
```

- [ ] **Step 4: Verificar que o site público não mudou**

Run: `npx tsc --noEmit && npx eslint src && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/`
Expected: sem saída; `200`.

Run: `curl -s http://localhost:3000/ | grep -c "outline: 1px dashed"`
Expected: `0` — o overlay **não** pode aparecer para visitante.

- [ ] **Step 5: Commit**

```bash
git add src/components/cms "src/app/[locale]/layout.tsx"
git commit -m "$(cat <<'EOF'
feat(cms): ponte e overlay de edição no site

O layout monta uma ponte inerte que só liga com o handshake do painel, na
mesma origem e como janela-mãe; só então o overlay é baixado sob demanda.

Nada é lido no servidor: ler cookie ou query nas páginas as tornaria
dinâmicas e mataria o cache do site inteiro.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Tela /admin/editor com iframe

**Files:**
- Create: `src/app/admin/(painel)/editor/page.tsx`
- Modify: `src/components/admin/admin-shell.tsx:9-19`

**Interfaces:**
- Consumes: `isTrustedEditMessage`, `CmsMessage` de `@/lib/cms/protocol`.
- Produces: a página `/admin/editor`; o estado `selected: { ref: string; value: string } | null`
  que a Task 6 consome via `<EditPanel />`.

- [ ] **Step 1: Criar a tela com iframe e barra**

Create `src/app/admin/(painel)/editor/page.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseRef, type CmsSelection } from "@/lib/cms/refs";
import { isTrustedEditMessage, type CmsMessage } from "@/lib/cms/protocol";
import { cn } from "@/lib/utils";

const PAGES = [
  { label: "Início", path: "" },
  { label: "Sobre", path: "/sobre" },
  { label: "Serviços", path: "/servicos" },
  { label: "Portfólio", path: "/portfolio" },
  { label: "Contato", path: "/contato" },
];

const LOCALES = [
  { label: "Português", value: "pt-BR" },
  { label: "English", value: "en" },
  { label: "Español", value: "es" },
];

/** Se o overlay não responder nisto, algo quebrou — melhor dizer do que fingir. */
const HANDSHAKE_TIMEOUT_MS = 5000;
/** Intervalo entre tentativas de handshake (ver enableEditing). */
const HANDSHAKE_RETRY_MS = 250;

export default function AdminEditorPage() {
  const [locale, setLocale] = useState("pt-BR");
  const [page, setPage] = useState("");
  const [selected, setSelected] = useState<CmsSelection | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** O laço de retry não enxerga o state: lê o ref. */
  const readyRef = useRef(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const source = iframeRef.current?.contentWindow;
      if (!isTrustedEditMessage(event, window.location.origin, source)) {
        return;
      }
      const data = event.data as CmsMessage;
      if (data.type === "cms:ready") {
        readyRef.current = true;
        setStatus("ready");
      }
      if (data.type === "cms:select") {
        setSelected({ ref: data.ref, value: data.value, count: data.count });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  /**
   * Chamado a cada carga do iframe: se ela clicar num link dentro da prévia, o
   * modo precisa voltar a ligar.
   *
   * Repete até o overlay confirmar com "cms:ready" porque o EditBridge só passa
   * a ouvir depois que o React hidrata — uma única mensagem no onLoad pode
   * chegar antes disso e se perder, deixando a prévia muda para sempre.
   */
  const enableEditing = useCallback(() => {
    readyRef.current = false;
    setStatus("loading");
    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      if (readyRef.current) {
        window.clearInterval(timer);
        return;
      }
      if (Date.now() - startedAt > HANDSHAKE_TIMEOUT_MS) {
        window.clearInterval(timer);
        // Sem "cms:ready" a tempo, a prévia ficaria muda e sem explicação.
        setStatus("failed");
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        { type: "cms:enable" } satisfies CmsMessage,
        window.location.origin
      );
    }, HANDSHAKE_RETRY_MS);
  }, []);

  return (
    <div className="-m-8 flex h-svh flex-col">
      <header className="border-border flex items-center gap-6 border-b px-6 py-3">
        <h1 className="font-heading text-lg tracking-tight">Editar site</h1>

        <div className="flex gap-1">
          {PAGES.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                setPage(item.path);
                setSelected(null);
                setStatus("loading");
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                page === item.path
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          value={locale}
          onChange={(event) => {
            setLocale(event.target.value);
            setSelected(null);
            setStatus("loading");
          }}
          className="border-border ml-auto rounded-md border px-3 py-1.5 text-sm"
        >
          {LOCALES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </header>

      <p
        className={cn(
          "border-border border-b px-6 py-2 text-sm",
          status === "failed" ? "text-error" : "text-muted-foreground"
        )}
      >
        {status === "ready"
          ? "Clique em qualquer texto ou foto da página para editar."
          : status === "loading"
            ? "Carregando a prévia..."
            : "Não foi possível ativar a edição nesta página. Recarregue para tentar de novo."}
      </p>

      <div className="flex min-h-0 flex-1">
        <iframe
          ref={iframeRef}
          src={`/${locale}${page}`}
          onLoad={enableEditing}
          title="Prévia do site"
          className="min-w-0 flex-1"
        />
        {/* Task 6 troca este bloco pelo <EditPanel /> */}
        <aside className="border-border w-96 shrink-0 overflow-y-auto border-l p-6">
          {selected ? (
            <pre className="text-xs">{JSON.stringify(selected, null, 2)}</pre>
          ) : (
            <p className="text-muted-foreground text-sm">Nada selecionado ainda.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Pôr no menu do painel**

Em `src/components/admin/admin-shell.tsx`, no array `navItems`, logo após Dashboard:

```tsx
  { href: "/admin/editor", label: "Editar site" },
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npx eslint src && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/editor`
Expected: sem saída; `200` (ou `307` para /admin/login se a sessão expirou — faça login e repita).

Verificação manual obrigatória (o resto é invisível para o teste automatizado):
abra `http://localhost:3000/admin/editor`, confirme o site na prévia, o contorno
tracejado nos textos ao passar o mouse, e que clicar num texto preenche o bloco
da direita com `ref` e `value`. Troque de página e de idioma e confirme que o
contorno volta (o handshake é reenviado no `onLoad`).

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(painel)/editor" src/components/admin/admin-shell.tsx
git commit -m "$(cat <<'EOF'
feat(admin): tela do editor visual com prévia do site

Barra com página e idioma, o site num iframe e o alvo do clique aparecendo ao
lado. O handshake é reenviado a cada carga do iframe para o modo sobreviver à
navegação dentro da prévia.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Painel de edição que salva

**Files:**
- Create: `src/components/admin/editor/edit-panel.tsx`
- Modify: `src/app/admin/(painel)/editor/page.tsx` (troca o `<aside>` pelo painel)

**Interfaces:**
- Consumes: `CmsSelection`, `parseRef`, `getByPath`, `setByPath` de
  `@/lib/cms/refs`; `api`, `AdminApiError` de `@/components/admin/api-client`;
  `ImageField` de `@/components/admin/image-field`.
- Produces: `<EditPanel selection={CmsSelection | null} locale={string} onSaved={(ref: string, value: string) => void} />`.

- [ ] **Step 1: Criar o painel**

Create `src/components/admin/editor/edit-panel.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getByPath, parseRef, setByPath, type CmsSelection } from "@/lib/cms/refs";

/**
 * Proporção do recorte por foto — a mesma que as Configurações usavam. Recortar
 * a foto da essência em 4/5 cortaria a imagem errada.
 */
const IMAGE_ASPECTS: Record<string, number> = {
  aboutPhoto: 4 / 5,
  essencePhoto1: 3 / 4,
  essencePhoto2: 3 / 4,
  contactPhoto: 4 / 5,
};

interface EditPanelProps {
  selection: CmsSelection | null;
  locale: string;
  /** Avisa a prévia para trocar o texto na hora. */
  onSaved: (ref: string, value: string) => void;
}

interface TranslationDoc {
  content: Record<string, unknown>;
}

type Settings = Record<string, string | undefined>;

export function EditPanel({ selection, locale, onSaved }: EditPanelProps) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const ref = selection ? parseRef(selection.ref) : null;

  // Busca o valor de verdade na fonte: o texto do DOM pode ser o base, não o
  // override salvo, e foto não tem texto nenhum.
  useEffect(() => {
    setError(null);
    setSaved(false);
    if (!selection || !ref) {
      setValue("");
      return;
    }
    void (async () => {
      try {
        if (ref.kind === "text") {
          const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
          setValue(getByPath(data?.content, ref.path) ?? selection.value);
          return;
        }
        const { data } = await api<Settings | null>("/settings");
        setValue(data?.[ref.path] ?? "");
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar o valor.");
        setValue(selection.value);
      }
    })();
  }, [selection, locale, ref?.kind, ref?.path]);

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
        const content = setByPath(data?.content ?? {}, ref.path, next);
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

  if (!selection) {
    return (
      <p className="text-muted-foreground text-sm">
        Clique num texto ou numa foto da página ao lado para editar.
      </p>
    );
  }

  if (!ref) {
    return <p className="text-error text-sm">Referência inválida: {selection.ref}</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg tracking-tight">
          {ref.kind === "img" ? "Foto" : ref.kind === "set" ? "Dado de contato" : "Texto"}
        </h2>
        <p className="text-muted-foreground mt-1 font-mono text-xs break-all">{ref.path}</p>
        {ref.kind === "text" ? (
          <p className="text-muted-foreground mt-1 text-xs">Idioma: {locale}</p>
        ) : null}
        {selection.count > 1 ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Este texto aparece em {selection.count} lugares desta página e muda em todos.
          </p>
        ) : null}
      </div>

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

      {error ? <p className="text-error text-sm">{error}</p> : null}
      {saved && !error ? <p className="text-success text-sm">Salvo.</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Ligar o painel na tela**

Em `src/app/admin/(painel)/editor/page.tsx`, importe o painel e troque o conteúdo
do `<aside>`. Adicione junto o envio do patch otimista:

```tsx
import { EditPanel } from "@/components/admin/editor/edit-panel";
```

```tsx
        <aside className="border-border w-96 shrink-0 overflow-y-auto border-l p-6">
          <EditPanel
            selection={selected}
            locale={locale}
            onSaved={(ref, value) => {
              // Foto e dado de contato não têm o valor como texto na tela:
              // recarrega a prévia em vez de escrever por cima do que aparece.
              if (parseRef(ref)?.kind !== "text") {
                iframeRef.current?.contentWindow?.location.reload();
                return;
              }
              iframeRef.current?.contentWindow?.postMessage(
                { type: "cms:patch", ref, value } satisfies CmsMessage,
                window.location.origin
              );
            }}
          />
        </aside>
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npx eslint src && npx vitest run`
Expected: sem saída de tsc/eslint; 40 testes passando.

Verificação manual obrigatória — o fluxo inteiro só existe no navegador:
1. Em `/admin/editor`, clique num título da home, mude o texto, salve. O texto
   deve mudar na prévia **na hora**.
2. Recarregue `http://localhost:3000/` numa aba normal: o texto novo continua lá.
3. Confirme no banco que só o caminho editado entrou:
   `mongosh test --eval 'db.translations.findOne({locale:"pt-BR"})'`
4. Repita com um dado de contato (`set:email`) e com uma foto (`img:aboutPhoto`).
5. Troque o idioma para `en`, edite um texto e confirme que o `pt-BR` não mudou.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/editor "src/app/admin/(painel)/editor"
git commit -m "$(cat <<'EOF'
feat(admin): painel que salva o texto, o dado e a foto do editor

O campo muda conforme o tipo (texto, dado de contato, foto com o uploader que
já existe). O valor vem da API, não do DOM: o texto na tela pode ser o base e
não o override salvo.

Em texto, parte do override salvo antes de gravar — a rota substitui o content
inteiro e apagaria os outros textos do idioma. Falha ao salvar mantém o que
foi digitado.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Fundir Configurações e Traduções em /admin/ajustes

**Files:**
- Create: `src/components/admin/settings/settings-form.tsx`
- Create: `src/components/admin/settings/texts-form.tsx`
- Create: `src/app/admin/(painel)/ajustes/page.tsx`
- Modify: `src/app/admin/(painel)/configuracoes/page.tsx` (vira redirect)
- Modify: `src/app/admin/(painel)/traducoes/page.tsx` (vira redirect)
- Modify: `src/components/admin/admin-shell.tsx:9-19`

**Interfaces:**
- Consumes: `EntityForm`, `EntityValues`, `FieldConfig` de `@/components/admin/entity-form`;
  `api`, `AdminApiError` de `@/components/admin/api-client`.
- Produces:
  - `<SettingsForm fields={FieldConfig[]} />` — carrega e salva `/settings`.
  - `<TextsForm filter={(path: string) => boolean} />` — o editor campo-a-campo
    do dicionário, restrito aos caminhos que passarem no filtro.

Decompor em dois componentes evita a página virar um arquivo gigante e permite
que "SEO" e "Textos avançados" sejam o **mesmo** componente com filtros
diferentes.

- [ ] **Step 1: Extrair o formulário de configurações**

Create `src/components/admin/settings/settings-form.tsx`. Mova para cá a lógica
que hoje está em `src/app/admin/(painel)/configuracoes/page.tsx` (estados
`initialValues`/`error`/`message`/`busy`, o `useEffect` que faz `api("/settings")`
e o `handleSubmit` com `PATCH`), trocando a constante `fields` por uma prop:

```tsx
"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { EntityForm, type EntityValues, type FieldConfig } from "@/components/admin/entity-form";

interface SettingsFormProps {
  fields: FieldConfig[];
}

/** Formulário de /settings restrito aos campos recebidos (uma aba dos Ajustes). */
export function SettingsForm({ fields }: SettingsFormProps) {
  const [initialValues, setInitialValues] = useState<EntityValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<EntityValues | null>("/settings");
        setInitialValues(data ?? {});
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
        setInitialValues({});
      }
    })();
  }, []);

  async function handleSubmit(values: EntityValues) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await api("/settings", { method: "PATCH", json: values });
      setMessage("Configurações salvas.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  if (!initialValues) {
    return <p className="text-muted-foreground text-sm">Carregando...</p>;
  }

  return (
    <div className="max-w-xl space-y-4">
      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}
      {message ? <p className="text-success text-sm">{message}</p> : null}
      <EntityForm
        fields={fields}
        initialValues={initialValues}
        submitLabel="Salvar"
        busy={busy}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

- [ ] **Step 2: Extrair o editor de textos com filtro**

Create `src/components/admin/settings/texts-form.tsx`. Mova para cá **toda** a
lógica de `src/app/admin/(painel)/traducoes/page.tsx` (as funções `flatten` e
`unflatten`, os estados, o `useEffect` que carrega `/translations?locale=`, o
`setField`, o `handleSave`, o `groupLabels` e o JSX dos grupos), com duas
mudanças: `filter` como prop e o `handleSave` do Step abaixo.

```tsx
"use client";

interface TextsFormProps {
  /** Quais caminhos do dicionário esta aba mostra. */
  filter: (path: string) => boolean;
}

export function TextsForm({ filter }: TextsFormProps) {
  // ...estados e helpers iguais aos de traducoes/page.tsx...

  const fields = useMemo(
    () => flatten(baseDictionaries[locale]).filter((field) => filter(field.path)),
    [locale, filter]
  );

  // ...groups, useEffect, setField e JSX idênticos ao arquivo atual...
}
```

**Cuidado com o `handleSave`:** hoje ele grava `unflatten(overrides)`, e
`overrides` só tem o que foi mexido nesta aba — mas a rota **substitui o
`content` inteiro**. Antes de gravar, parta do que já está salvo:

```tsx
  async function handleSave() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      // A rota troca o content inteiro: sem partir do salvo, a aba SEO apagaria
      // os textos gravados pela aba Avançados (e vice-versa).
      const { data } = await api<TranslationDoc | null>(`/translations?locale=${locale}`);
      const content = { ...(data?.content ?? {}), ...unflatten(overrides) };
      await api("/translations", { method: "PATCH", json: { locale, content } });
      setMessage("Textos salvos — o site já foi atualizado.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
```

- [ ] **Step 3: Criar a página com as abas**

Create `src/app/admin/(painel)/ajustes/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import type { FieldConfig } from "@/components/admin/entity-form";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { TextsForm } from "@/components/admin/settings/texts-form";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "site", label: "Site" },
  { id: "contato", label: "Contato e redes" },
  { id: "seo", label: "SEO" },
  { id: "textos", label: "Textos avançados" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SITE_FIELDS: FieldConfig[] = [
  { name: "siteName", label: "Nome do site", type: "text" },
  { name: "logo", label: "Logo (URL)", type: "url" },
  { name: "favicon", label: "Favicon (URL)", type: "url" },
];

const CONTACT_FIELDS: FieldConfig[] = [
  { name: "email", label: "E-mail de contato", type: "email" },
  { name: "phone", label: "Telefone", type: "text" },
  { name: "whatsapp", label: "WhatsApp (com DDI, ex.: 5511999999999)", type: "text" },
  { name: "address", label: "Endereço", type: "text" },
  {
    name: "locationNote",
    label: "Nota da localização (ex.: Atendimento online para todo o Brasil)",
    type: "text",
  },
  { name: "businessHours", label: "Horário (ex.: Segunda a Sexta das 9h às 18h)", type: "text" },
  { name: "instagram", label: "Instagram (URL)", type: "url" },
  { name: "linkedin", label: "LinkedIn (URL)", type: "url" },
  { name: "facebook", label: "Facebook (URL)", type: "url" },
  { name: "youtube", label: "YouTube (URL)", type: "url" },
  { name: "behance", label: "Behance (URL)", type: "url" },
];

/** SEO é tudo sob `meta.`; "avançados" é o resto sem lugar na tela. */
const isSeo = (path: string) => path.startsWith("meta.");
const isAdvanced = (path: string) => !isSeo(path);

export default function AdminAjustesPage() {
  const [tab, setTab] = useState<TabId>("site");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          O que não dá para clicar na página: dados que ainda não existem no site,
          SEO e textos sem lugar na tela. Para o resto, use{" "}
          <Link href="/admin/editor" className="hover:text-foreground underline">
            Editar site
          </Link>
          .
        </p>
      </div>

      <nav className="border-border flex gap-1 border-b">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
              tab === item.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "site" ? <SettingsForm fields={SITE_FIELDS} /> : null}
      {tab === "contato" ? <SettingsForm fields={CONTACT_FIELDS} /> : null}
      {tab === "seo" ? <TextsForm filter={isSeo} /> : null}
      {tab === "textos" ? <TextsForm filter={isAdvanced} /> : null}
    </div>
  );
}
```

**Os campos que o editor visual cobre saem daqui de propósito** (`aboutPhoto`,
`essencePhoto1/2`, `contactPhoto`, `founderName`, `founderRole`,
`stat1-3Value/Label`): têm lugar próprio na página, e duplicá-los recria a
confusão que este trabalho existe para acabar.

- [ ] **Step 4: Redirecionar as rotas antigas**

Substitua **todo** o conteúdo de `src/app/admin/(painel)/configuracoes/page.tsx`
e de `src/app/admin/(painel)/traducoes/page.tsx` por:

```tsx
import { redirect } from "next/navigation";

/** As duas telas viraram uma só: /admin/ajustes. */
export default function Page() {
  redirect("/admin/ajustes");
}
```

- [ ] **Step 5: Atualizar o menu**

Em `src/components/admin/admin-shell.tsx`, remova as entradas
`{ href: "/admin/traducoes", label: "Traduções" }` e
`{ href: "/admin/configuracoes", label: "Configurações" }`, e adicione no fim:

```tsx
  { href: "/admin/ajustes", label: "Ajustes" },
```

Ordem final: Dashboard · Editar site · Mensagens · Projetos · Categorias ·
Serviços · Depoimentos · FAQ · Ajustes.

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npx eslint src && npx vitest run`
Expected: sem saída; 40 testes.

Run:
```bash
for p in /admin/ajustes /admin/configuracoes /admin/traducoes; do
  echo -n "$p -> "; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$p"
done
```
Expected: `200` no primeiro; `307`/`308` nos dois seguintes.

Verificação manual: em cada aba, salve um campo e recarregue para confirmar que
persistiu. Salve algo na aba SEO e depois na aba Avançados, e confirme que o
primeiro **não** sumiu — é o risco do `content` inteiro descrito no Step 2.
Confirme que o menu não tem mais "Configurações" nem "Traduções".

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/settings "src/app/admin/(painel)/ajustes" "src/app/admin/(painel)/configuracoes" "src/app/admin/(painel)/traducoes" src/components/admin/admin-shell.tsx
git commit -m "$(cat <<'EOF'
feat(admin): fundir configurações e traduções em ajustes

Uma tela com quatro abas no lugar de duas telas com 188 e 28 campos soltos.
Fica só o que o editor visual não alcança: dado que ainda não existe no site
(campo vazio não renderiza, então não há o que clicar), SEO e textos sem lugar
na tela. As rotas antigas redirecionam.

Salvar parte do conteúdo já gravado: a rota substitui o content inteiro e uma
aba apagaria os textos da outra.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Verificação final

- [ ] `npx tsc --noEmit` — sem saída
- [ ] `npx eslint src` — sem saída
- [ ] `npx vitest run` — 40 testes passando (37 + os 3 da marcação)
- [ ] `curl -s http://localhost:3000/ | grep -c "outline: 1px dashed"` → `0`
      (o overlay nunca vaza para o site público)
- [ ] Rede de segurança da spec — as rotas que o editor usa exigem sessão:
      ```bash
      for r in translations settings; do
        echo -n "PATCH /$r sem sessao -> "
        curl -s -o /dev/null -w "%{http_code}\n" -X PATCH \
          "http://localhost:3000/api/v1/$r" \
          -H "Content-Type: application/json" -d '{}'
      done
      ```
      Expected: `401` nas duas — o overlay é pintura, a proteção é a API.
- [ ] As 5 páginas em 200
- [ ] Fluxo manual completo: editar texto, dado e foto pelo `/admin/editor`,
      conferir no site em aba normal e no banco
