# Reforma da página Portfólio: banner de destaques + grade mesclada + faixa de números — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformar a página `/portfolio` com um banner de hero em carrossel (alimentado pelos projetos marcados como "destaque" no admin), a grade de projetos mesclando o mosaico atual com um filtro em coluna vertical + selo de categoria na foto, e uma faixa de 5 números editáveis no fim da página.

**Architecture:** Server components buscam os dados (projetos destacados via nova `getFeaturedProjects`, configurações via `getSiteSettings` já existente) e passam props prontas para componentes de apresentação; só o carrossel do banner precisa de estado local (`"use client"`). "Editar o banner" reaproveita o campo `featured` que já existe em `Project` — nenhuma tela nova no admin.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript strict, Tailwind v4, Mongoose 9, vitest.

## Global Constraints

- TypeScript strict: `any`/`ts-ignore` proibidos (Claude.md do projeto).
- Nenhum texto novo hardcoded fora dos dicionários `src/i18n/dictionaries/{pt-BR,en,es}.json` — toda string visível no site precisa das 3 traduções.
- `Dictionary` é inferido via `typeof` do `pt-BR.json` (`src/i18n/get-dictionary.ts:4`) — adicionar chaves só no pt-BR já basta para o TypeScript enxergar; en/es precisam do mesmo shape para não quebrar em runtime.
- Elementos editáveis pelo painel visual (`/admin/editor`) usam `data-cms="text:<caminho>"` (textos do dicionário) ou `data-cms="set:<campo>"` (campos de `SiteSettings`) — ver padrão em `src/app/[locale]/sobre/page.tsx`.
- Commits seguem Conventional Commits com **um único tipo** no cabeçalho (commitlint já configurado); subject não pode começar com maiúscula.
- Não editar nada dentro de `Docs/`, `Adr/`, `Claude.md`, `Readme.md`, `PROJECT_STATUS.md`, `IMPLEMENTATION_PLAN.md` além deste próprio plano (estão no `.prettierignore` por decisão do projeto).

---

### Task 1: `wrapIndex` — utilitário puro do carrossel (TDD)

**Files:**
- Create: `src/components/portfolio/carousel-index.ts`
- Test: `src/components/portfolio/carousel-index.test.ts`

**Interfaces:**
- Produces: `wrapIndex(current: number, delta: number, length: number): number` — índice seguinte do carrossel com wrap-around nas duas pontas; `length <= 0` sempre devolve `0`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/components/portfolio/carousel-index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { wrapIndex } from "./carousel-index";

describe("carousel-index", () => {
  it("avança dentro dos limites", () => {
    expect(wrapIndex(0, 1, 3)).toBe(1);
  });

  it("dá a volta do último para o primeiro", () => {
    expect(wrapIndex(2, 1, 3)).toBe(0);
  });

  it("dá a volta do primeiro para o último", () => {
    expect(wrapIndex(0, -1, 3)).toBe(2);
  });

  it("length zero sempre devolve 0", () => {
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- carousel-index`
Expected: FAIL — `Cannot find module './carousel-index'` (o arquivo ainda não existe).

- [ ] **Step 3: Implementação mínima**

Criar `src/components/portfolio/carousel-index.ts`:

```ts
/** Índice seguinte do carrossel, com wrap-around nas duas pontas. */
export function wrapIndex(current: number, delta: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return (current + delta + length) % length;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm test -- carousel-index`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/carousel-index.ts src/components/portfolio/carousel-index.test.ts
git commit -m "feat: utilitario de indice do carrossel do portfolio"
```

---

### Task 2: `getFeaturedProjects` em `lib/content.ts`

**Files:**
- Modify: `src/lib/content.ts` (inserir logo após o fechamento de `getPublishedProjects`, antes de `getProjectBySlug`)

**Interfaces:**
- Consumes: `Project`, `Category` (já importados no topo do arquivo), `toPortfolioItem` (função local já existente no arquivo), `getPublishedProjects(locale, dictionary): Promise<PortfolioItem[]>` (já existente).
- Produces: `getFeaturedProjects(locale: Locale, dictionary: Dictionary): Promise<PortfolioItem[]>` — projetos `published` com `featured: true`, mais recentes primeiro; sem nenhum, cai nos 3 projetos publicados mais recentes (`getPublishedProjects` já resolve o fallback de placeholder quando o banco está vazio).

- [ ] **Step 1: Localizar o ponto de inserção**

Abrir `src/lib/content.ts` e localizar o fechamento de `getPublishedProjects`:

```ts
export const getPublishedProjects = cache(
  async (locale: Locale, dictionary: Dictionary): Promise<PortfolioItem[]> => {
    try {
      await connectDb();
      const [projects, categories] = await Promise.all([
        Project.find({ status: "published", deletedAt: null }).sort({ createdAt: -1 }).lean(),
        Category.find({ deletedAt: null }).lean(),
      ]);
      if (projects.length > 0) {
        const categoryNames = new Map(categories.map((c) => [String(c._id), c.name]));
        return projects.map((doc) =>
          toPortfolioItem(doc, locale, categoryNames.get(String(doc.categoryId)))
        );
      }
    } catch {
      // fallback
    }
    return placeholderItems(dictionary);
  }
);
```

- [ ] **Step 2: Inserir a nova função logo abaixo**

```ts
/**
 * Projetos marcados como "destaque" no admin (checkbox em `project-form.tsx`),
 * usados no carrossel do banner da página Portfólio. Sem nenhum marcado, cai
 * nos publicados mais recentes — o banner nunca fica vazio.
 */
export const getFeaturedProjects = cache(
  async (locale: Locale, dictionary: Dictionary): Promise<PortfolioItem[]> => {
    try {
      await connectDb();
      const [projects, categories] = await Promise.all([
        Project.find({ status: "published", featured: true, deletedAt: null })
          .sort({ createdAt: -1 })
          .lean(),
        Category.find({ deletedAt: null }).lean(),
      ]);
      if (projects.length > 0) {
        const categoryNames = new Map(categories.map((c) => [String(c._id), c.name]));
        return projects.map((doc) =>
          toPortfolioItem(doc, locale, categoryNames.get(String(doc.categoryId)))
        );
      }
    } catch {
      // fallback
    }
    const fallback = await getPublishedProjects(locale, dictionary);
    return fallback.slice(0, 3);
  }
);
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat: busca de projetos em destaque para o portfolio"
```

---

### Task 3: Campos de estatísticas do Portfólio em `SiteSettings`

**Files:**
- Modify: `src/models/site-settings.ts`
- Modify: `src/lib/validation.ts`

**Interfaces:**
- Produces: 10 novos campos opcionais em `SiteSettingsDoc` e no schema Mongoose — `portfolioStat1Value`..`portfolioStat5Value`, `portfolioStat1Label`..`portfolioStat5Label` (todos `string | undefined`). Mesmos nomes usados depois em `data-cms="set:portfolioStatNValue|Label"` (Task 7) e em `PortfolioPage` (Task 9).

- [ ] **Step 1: Adicionar os campos na interface `SiteSettingsDoc`**

Em `src/models/site-settings.ts`, logo após `stat3Label?: string;`:

```ts
  stat3Value?: string;
  stat3Label?: string;
  /** Faixa de números do fim da página Portfólio (editáveis no painel). */
  portfolioStat1Value?: string;
  portfolioStat1Label?: string;
  portfolioStat2Value?: string;
  portfolioStat2Label?: string;
  portfolioStat3Value?: string;
  portfolioStat3Label?: string;
  portfolioStat4Value?: string;
  portfolioStat4Label?: string;
  portfolioStat5Value?: string;
  portfolioStat5Label?: string;
  seo?: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
```

- [ ] **Step 2: Adicionar os campos no schema Mongoose**

No mesmo arquivo, logo após `stat3Label: String,`:

```ts
    stat3Value: String,
    stat3Label: String,
    portfolioStat1Value: String,
    portfolioStat1Label: String,
    portfolioStat2Value: String,
    portfolioStat2Label: String,
    portfolioStat3Value: String,
    portfolioStat3Label: String,
    portfolioStat4Value: String,
    portfolioStat4Label: String,
    portfolioStat5Value: String,
    portfolioStat5Label: String,
    seo: { title: String, description: String, keywords: [String], ogImage: String },
```

- [ ] **Step 3: Adicionar os campos no schema de validação**

Em `src/lib/validation.ts`, logo após `stat3Label: z.string().max(60).optional(),`:

```ts
  stat3Value: z.string().max(20).optional(),
  stat3Label: z.string().max(60).optional(),
  portfolioStat1Value: z.string().max(20).optional(),
  portfolioStat1Label: z.string().max(60).optional(),
  portfolioStat2Value: z.string().max(20).optional(),
  portfolioStat2Label: z.string().max(60).optional(),
  portfolioStat3Value: z.string().max(20).optional(),
  portfolioStat3Label: z.string().max(60).optional(),
  portfolioStat4Value: z.string().max(20).optional(),
  portfolioStat4Label: z.string().max(60).optional(),
  portfolioStat5Value: z.string().max(20).optional(),
  portfolioStat5Label: z.string().max(60).optional(),
  seo: seoSchema,
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sem erros novos.

- [ ] **Step 5: Commit**

```bash
git add src/models/site-settings.ts src/lib/validation.ts
git commit -m "feat: campos de estatisticas do portfolio nas configuracoes"
```

---

### Task 4: Novas chaves de dicionário (`portfolioPage`)

**Files:**
- Modify: `src/i18n/dictionaries/pt-BR.json`
- Modify: `src/i18n/dictionaries/en.json`
- Modify: `src/i18n/dictionaries/es.json`

**Interfaces:**
- Produces: `dictionary.portfolioPage.{heroCta,heroPrev,heroNext,featuredBadge,featuredCta,statsEyebrow,stats}` em pt-BR/en/es, mesmo shape nos três arquivos. `stats` é um array de 5 `{ value: string; label: string }` (mesmo formato de `dictionary.sections.about.stats`, ver `pt-BR.json:59-72`). Consumido por `PortfolioHero` (Task 5) e `PortfolioPage`/`PortfolioStats` (Tasks 7 e 9).

- [ ] **Step 1: pt-BR — inserir as novas chaves**

Em `src/i18n/dictionaries/pt-BR.json`, dentro do bloco `"portfolioPage"`, logo após `"pageStatus": "Página {current} de {total}"`:

```json
    "pageStatus": "Página {current} de {total}",
    "heroCta": "Ver todos os projetos",
    "heroPrev": "Destaque anterior",
    "heroNext": "Próximo destaque",
    "featuredBadge": "Destaque",
    "featuredCta": "Ver projeto",
    "statsEyebrow": "Números que refletem nossa jornada",
    "stats": [
      { "value": "48", "label": "Projetos realizados" },
      { "value": "23", "label": "Clientes atendidos" },
      { "value": "6", "label": "Anos de experiência" },
      { "value": "12", "label": "Estados atendidos" },
      { "value": "98%", "label": "Clientes satisfeitos" }
    ]
```

- [ ] **Step 2: en — inserir as mesmas chaves traduzidas**

Em `src/i18n/dictionaries/en.json`, dentro do bloco `"portfolioPage"`, logo após `"pageStatus": "Page {current} of {total}"`:

```json
    "pageStatus": "Page {current} of {total}",
    "heroCta": "View all projects",
    "heroPrev": "Previous highlight",
    "heroNext": "Next highlight",
    "featuredBadge": "Featured",
    "featuredCta": "View project",
    "statsEyebrow": "Numbers that reflect our journey",
    "stats": [
      { "value": "48", "label": "Projects delivered" },
      { "value": "23", "label": "Clients served" },
      { "value": "6", "label": "Years of experience" },
      { "value": "12", "label": "States served" },
      { "value": "98%", "label": "Satisfied clients" }
    ]
```

- [ ] **Step 3: es — inserir as mesmas chaves traduzidas**

Em `src/i18n/dictionaries/es.json`, dentro do bloco `"portfolioPage"`, logo após `"pageStatus": "Página {current} de {total}"`:

```json
    "pageStatus": "Página {current} de {total}",
    "heroCta": "Ver todos los proyectos",
    "heroPrev": "Destacado anterior",
    "heroNext": "Próximo destacado",
    "featuredBadge": "Destacado",
    "featuredCta": "Ver proyecto",
    "statsEyebrow": "Números que reflejan nuestro camino",
    "stats": [
      { "value": "48", "label": "Proyectos realizados" },
      { "value": "23", "label": "Clientes atendidos" },
      { "value": "6", "label": "Años de experiencia" },
      { "value": "12", "label": "Estados atendidos" },
      { "value": "98%", "label": "Clientes satisfechos" }
    ]
```

- [ ] **Step 4: Validar JSON e typecheck**

Run: `npm run typecheck`
Expected: sem erros (os 3 arquivos precisam ser JSON válido — um vírgula/chave errada quebra o build inteiro).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/dictionaries/pt-BR.json src/i18n/dictionaries/en.json src/i18n/dictionaries/es.json
git commit -m "feat: textos do banner e da faixa de numeros do portfolio"
```

---

### Task 5: Componente `PortfolioHero` (banner + carrossel)

**Files:**
- Create: `src/components/portfolio/portfolio-hero.tsx`

**Interfaces:**
- Consumes: `wrapIndex` (Task 1), `dictionary.portfolioPage.{heroEyebrow,heroTitleLead,heroTitleEmphasis,heroText,heroCta,heroPrev,heroNext,featuredBadge,featuredCta}` (Task 4, `heroEyebrow`/`heroTitleLead`/`heroTitleEmphasis`/`heroText` já existiam), `useLanguage()` de `@/components/providers/language-provider` (já usado em `portfolio-grid.tsx`), `localePath` de `@/i18n/config`, `PortfolioItem` de `@/types/project`.
- Produces: `<PortfolioHero items={PortfolioItem[]} />` — consumido por `src/app/[locale]/portfolio/page.tsx` (Task 9).

- [ ] **Step 1: Criar o componente**

Criar `src/components/portfolio/portfolio-hero.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "@/components/icons";
import { Container } from "@/components/layout/container";
import { useLanguage } from "@/components/providers/language-provider";
import { wrapIndex } from "@/components/portfolio/carousel-index";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/project";

interface PortfolioHeroProps {
  items: PortfolioItem[];
}

/** Âncora da grade abaixo — mesmo id usado em `PortfolioGrid` (Task 6). */
const GRID_ANCHOR = "grade";

/**
 * Banner da página Portfólio: texto fixo à esquerda + carrossel dos projetos
 * marcados como "destaque" no admin. `items` já chega com o fallback
 * resolvido pelo servidor (getFeaturedProjects), então nunca fica vazio.
 */
export function PortfolioHero({ items }: PortfolioHeroProps) {
  const { locale, dictionary } = useLanguage();
  const page = dictionary.portfolioPage;
  const [index, setIndex] = useState(0);
  const current = items[index];

  function go(delta: number) {
    setIndex((value) => wrapIndex(value, delta, items.length));
  }

  return (
    <section className="relative overflow-hidden bg-[#141009] text-[#f2ece0]">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
        <Container className="py-16 lg:py-24">
          <p
            className="text-caption flex items-center gap-3 tracking-[0.22em] text-[#cf5a18] uppercase"
            data-cms="text:portfolioPage.heroEyebrow"
          >
            <span className="h-px w-8 bg-[#cf5a18]" aria-hidden />
            {page.heroEyebrow}
          </p>
          <h1 className="font-heading mt-6 text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] tracking-tight text-balance">
            <span data-cms="text:portfolioPage.heroTitleLead">{page.heroTitleLead}</span>{" "}
            <span className="text-[#cf5a18] italic" data-cms="text:portfolioPage.heroTitleEmphasis">
              {page.heroTitleEmphasis}
            </span>
          </h1>
          <p
            className="text-small mt-7 max-w-md leading-relaxed text-[#d8cdba]"
            data-cms="text:portfolioPage.heroText"
          >
            {page.heroText}
          </p>
          <Link
            href={`#${GRID_ANCHOR}`}
            className="text-caption group mt-10 inline-flex items-center gap-3 tracking-[0.18em] text-[#cf5a18] uppercase"
            data-cms="text:portfolioPage.heroCta"
          >
            {page.heroCta}
            <span className="flex size-9 items-center justify-center rounded-full border border-[#cf5a18]/50 transition-colors duration-300 group-hover:bg-[#cf5a18] group-hover:text-[#141009]">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </Link>
        </Container>

        <div className="relative h-[24rem] lg:h-[36rem]">
          {current ? (
            <>
              {current.coverImage ? (
                <Image
                  src={current.coverImage}
                  alt={current.title}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className={cn("absolute inset-0", current.coverClass ?? "bg-[#221a13]")} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c09]/80 via-[#0f0c09]/10 to-transparent" />

              <div className="absolute right-6 bottom-6 max-w-xs border border-[#f2ece0]/15 bg-[#0f0c09]/85 p-5 backdrop-blur-sm lg:right-10 lg:bottom-10">
                <p className="text-caption tracking-[0.18em] text-[#cf5a18] uppercase">
                  {page.featuredBadge}
                </p>
                <h2 className="font-heading mt-2 text-xl leading-tight">{current.title}</h2>
                <p className="text-caption mt-2 text-[#d8cdba]/70">
                  {[current.categoryLabel, current.city, current.year].filter(Boolean).join(" · ")}
                </p>
                <Link
                  href={localePath(locale, `/portfolio/${current.slug}`)}
                  className="text-caption group mt-4 inline-flex items-center gap-2 tracking-[0.16em] text-[#cf5a18] uppercase"
                >
                  {page.featuredCta}
                  <ArrowUpRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>
              </div>

              {items.length > 1 ? (
                <div className="absolute bottom-6 left-6 flex gap-2 lg:bottom-10 lg:left-10">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={page.heroPrev}
                    className="flex size-11 items-center justify-center rounded-full border border-[#f2ece0]/30 text-[#f2ece0] transition-colors duration-300 hover:bg-[#f2ece0] hover:text-[#141009]"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={page.heroNext}
                    className="flex size-11 items-center justify-center rounded-full border border-[#f2ece0]/30 text-[#f2ece0] transition-colors duration-300 hover:bg-[#f2ece0] hover:text-[#141009]"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros. (`useLanguage`, `Container`, `localePath`, `cn` e os ícones já existem no projeto — conferir os caminhos de import se algum erro de módulo aparecer.)

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/portfolio-hero.tsx
git commit -m "feat: banner com carrossel de projetos em destaque no portfolio"
```

---

### Task 6: `PortfolioGrid` — selo de categoria + filtro em coluna vertical

**Files:**
- Modify: `src/components/portfolio/portfolio-grid.tsx`

**Interfaces:**
- Consumes: nada novo — usa apenas o que o arquivo já importa (`cn`, ícones, `PortfolioItem`).
- Produces: mesma assinatura pública `<PortfolioGrid projects={PortfolioItem[]} />`; agora com `id="grade"` na âncora do topo (alvo do `PortfolioHero`, Task 5) e a mesma estrutura de estado/filtros/paginação, só a marcação visual muda.

- [ ] **Step 1: Adicionar `id="grade"` na âncora do topo**

Em `src/components/portfolio/portfolio-grid.tsx`, trocar:

```tsx
      {/* Âncora do topo da lista (compensa o cabeçalho fixo) */}
      <div ref={topRef} className="scroll-mt-28" />
```

por:

```tsx
      {/* Âncora do topo da lista (compensa o cabeçalho fixo) — também alvo do
          link "Ver todos os projetos" do banner da hero. */}
      <div ref={topRef} id="grade" className="scroll-mt-28" />
```

- [ ] **Step 2: Trocar o cabeçalho de filtros por sidebar vertical + conteúdo**

Trocar todo o bloco desde `{/* Filtros + ordenação */}` até o fechamento do `</div>` que antecede `{visible.length === 0 ? (` — ou seja, substituir:

```tsx
      {/* Filtros + ordenação */}
      <div className="flex flex-col gap-6 border-b border-[#f2ece0]/10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value);
                setPageIndex(1);
              }}
              aria-pressed={filter === value}
              className={cn(
                "text-caption -mb-px border-b-2 pb-4 tracking-[0.18em] uppercase transition-colors duration-300",
                filter === value
                  ? "border-[#cf5a18] text-[#cf5a18]"
                  : "border-transparent text-[#f2ece0]/55 hover:text-[#f2ece0]"
              )}
              // A aba "Todos" é o único texto de dicionário aqui; as demais vêm das categorias do banco.
              data-cms={value === "all" ? "text:portfolioPage.all" : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mb-4 inline-flex shrink-0 items-center gap-2 border border-[#f2ece0]/15 px-4 py-3">
          <span className="sr-only">{page.sortLabel}</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortOrder);
              setPageIndex(1);
            }}
            className="text-caption cursor-pointer appearance-none bg-transparent tracking-[0.14em] text-[#f2ece0] outline-none"
          >
            <option value="recent" className="bg-[#141009]">
              {page.sortRecent}
            </option>
            <option value="oldest" className="bg-[#141009]">
              {page.sortOldest}
            </option>
          </select>
          <span className="text-[#f2ece0]/50" aria-hidden>
            ▾
          </span>
        </label>
      </div>

      {visible.length === 0 ? (
```

por:

```tsx
      {/* Filtro em coluna vertical (desktop) + grade. Sem categorias
          cadastradas, `tabs` vem vazio e a coluna lateral some — a grade
          ocupa a largura toda. */}
      <div className={cn(tabs.length > 0 && "lg:grid lg:grid-cols-[13rem_1fr] lg:items-start lg:gap-12")}>
        {tabs.length > 0 ? (
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-[#f2ece0]/10 pb-6 lg:sticky lg:top-28 lg:flex-col lg:items-start lg:gap-y-4 lg:border-r lg:border-b-0 lg:pr-8 lg:pb-0">
            {tabs.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFilter(value);
                  setPageIndex(1);
                }}
                aria-pressed={filter === value}
                className={cn(
                  "text-caption -mb-px border-b-2 pb-4 tracking-[0.18em] uppercase transition-colors duration-300 lg:mb-0 lg:border-b-0 lg:border-l-2 lg:pb-1 lg:pl-4",
                  filter === value
                    ? "border-[#cf5a18] text-[#cf5a18]"
                    : "border-transparent text-[#f2ece0]/55 hover:text-[#f2ece0]"
                )}
                // A aba "Todos" é o único texto de dicionário aqui; as demais vêm das categorias do banco.
                data-cms={value === "all" ? "text:portfolioPage.all" : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div>
          <div className="flex justify-end border-b border-[#f2ece0]/10 pb-6">
            <label className="mb-4 inline-flex shrink-0 items-center gap-2 border border-[#f2ece0]/15 px-4 py-3">
              <span className="sr-only">{page.sortLabel}</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortOrder);
                  setPageIndex(1);
                }}
                className="text-caption cursor-pointer appearance-none bg-transparent tracking-[0.14em] text-[#f2ece0] outline-none"
              >
                <option value="recent" className="bg-[#141009]">
                  {page.sortRecent}
                </option>
                <option value="oldest" className="bg-[#141009]">
                  {page.sortOldest}
                </option>
              </select>
              <span className="text-[#f2ece0]/50" aria-hidden>
                ▾
              </span>
            </label>
          </div>

          {visible.length === 0 ? (
```

- [ ] **Step 3: Fechar a nova div de conteúdo e a grid wrapper**

O final do arquivo (inalterado até aqui) é exatamente:

```tsx
          ) : null}
        </>
      )}
    </div>
  );
}
```

Trocar por (o `</div>` original fechava só a div externa; agora precisa fechar também a coluna de conteúdo e o grid wrapper abertos no Step 2, nessa ordem — de dentro para fora):

```tsx
          ) : null}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
```

Não se preocupe com a indentação exata — o `prettier --write` do lint-staged reformata tudo automaticamente no commit (Step 7). O que importa é a contagem: 1 `</div>` fecha a coluna de conteúdo (aberta no Step 2 logo antes de `{visible.length === 0 ? (`), 1 `</div>` fecha o grid wrapper (aberto no Step 2 no lugar do antigo cabeçalho de filtros), e o `</div>` que já existia continua fechando a div externa do componente.

- [ ] **Step 4: Selo de categoria sobreposto na foto (`ProjectCard`)**

Em `ProjectCard`, trocar:

```tsx
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
        {project.coverImage ? (
```

por:

```tsx
      <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
        {project.categoryLabel ? (
          <span className="absolute top-3 left-3 z-10 bg-[#0f0c09]/75 px-3 py-1 text-[10px] tracking-[0.14em] text-[#f2ece0] uppercase backdrop-blur-sm">
            {project.categoryLabel}
          </span>
        ) : null}
        {project.coverImage ? (
```

- [ ] **Step 5: Ajustar o breakpoint das colunas do mosaico**

A coluna lateral (Step 2) reduz a largura disponível a partir de `lg:`; trocar `lg:columns-3` por `xl:columns-3` para não espremer o mosaico:

```tsx
          <div className="mt-10 gap-4 sm:columns-2 xl:columns-3">
```

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros. JSX com tags mal fechadas aparece aqui como erro de parse — conferir a contagem de `</div>` do Step 3 com cuidado.

- [ ] **Step 7: Commit**

```bash
git add src/components/portfolio/portfolio-grid.tsx
git commit -m "feat: filtro vertical e selo de categoria na grade do portfolio"
```

---

### Task 7: Componente `PortfolioStats` (faixa de números)

**Files:**
- Create: `src/components/portfolio/portfolio-stats.tsx`

**Interfaces:**
- Consumes: `Container` de `@/components/layout/container`.
- Produces: `<PortfolioStats eyebrow={string} stats={Array<{ value: string; label: string }>} />` (exatamente 5 itens em uso real, mas o componente aceita qualquer tamanho) — consumido por `src/app/[locale]/portfolio/page.tsx` (Task 9), que resolve os valores via `pick()` a partir de `SiteSettings` (Task 3) com fallback em `dictionary.portfolioPage.stats` (Task 4).

- [ ] **Step 1: Criar o componente**

Criar `src/components/portfolio/portfolio-stats.tsx`:

```tsx
import { Container } from "@/components/layout/container";

interface PortfolioStatsProps {
  eyebrow: string;
  stats: Array<{ value: string; label: string }>;
}

/**
 * Faixa de números no fim da página Portfólio — mesmo padrão de `stat1..3`
 * da página Sobre (editável clicando na página via /admin/editor), só que
 * com 5 itens em vez de 3.
 */
export function PortfolioStats({ eyebrow, stats }: PortfolioStatsProps) {
  return (
    <section className="border-t border-[#f2ece0]/10 bg-[#141009] text-[#f2ece0]">
      <Container className="py-16 lg:py-20">
        <p
          className="text-caption tracking-[0.22em] text-[#f2ece0]/45 uppercase"
          data-cms="text:portfolioPage.statsEyebrow"
        >
          {eyebrow}
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-[#f2ece0]/12">
          {stats.map((stat, index) => (
            <div key={stat.label} className="px-2 lg:px-6">
              <dt
                className="font-heading text-[clamp(1.8rem,3vw,2.6rem)] leading-none"
                data-cms={`set:portfolioStat${index + 1}Value`}
              >
                {stat.value}
              </dt>
              <dd
                className="text-caption mt-2 tracking-[0.16em] text-[#f2ece0]/50 uppercase"
                data-cms={`set:portfolioStat${index + 1}Label`}
              >
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/portfolio-stats.tsx
git commit -m "feat: faixa de numeros do portfolio"
```

---

### Task 8: Ajuda no checkbox "Projeto em destaque" (admin)

**Files:**
- Modify: `src/components/admin/projects/project-form.tsx`

**Interfaces:**
- Nenhuma nova — só copy.

- [ ] **Step 1: Adicionar a linha de ajuda**

Em `src/components/admin/projects/project-form.tsx`, trocar:

```tsx
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
        Projeto em destaque
      </label>
```

por:

```tsx
      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Projeto em destaque
        </label>
        <p className="text-muted-foreground mt-1 text-xs">
          Aparece no carrossel do banner da página Portfólio.
        </p>
      </div>
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/projects/project-form.tsx
git commit -m "docs: explica o efeito do checkbox de projeto em destaque"
```

---

### Task 9: Montar `PortfolioPage`

**Files:**
- Modify: `src/app/[locale]/portfolio/page.tsx`

**Interfaces:**
- Consumes: `getFeaturedProjects` (Task 2), `getSiteSettings` de `@/lib/settings` (já existente, usado em `sobre/page.tsx`), `PortfolioHero` (Task 5), `PortfolioStats` (Task 7), `PortfolioGrid` (já existente, ajustado na Task 6).
- Produces: página `/portfolio` completa — banner de destaques, grade e faixa de números, na ordem.

- [ ] **Step 1: Reescrever o arquivo**

Substituir todo o conteúdo de `src/app/[locale]/portfolio/page.tsx` por:

```tsx
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { CTASection } from "@/components/shared/cta-section";
import { resolveLocale } from "@/i18n/resolve-locale";
import { getFeaturedProjects, getPublishedProjects } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/settings";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, dictionary } = await resolveLocale(params);
  return buildPageMetadata({
    title: dictionary.meta.portfolio.title,
    description: dictionary.meta.portfolio.description,
    locale,
    path: "/portfolio",
  });
}

// Valor do painel quando preenchido; senão, o do dicionário (mesmo padrão da página Sobre).
const pick = (custom: string | undefined, fallback: string) =>
  custom && custom.trim() ? custom : fallback;

export default async function PortfolioPage({ params }: PageProps) {
  const { locale, dictionary } = await resolveLocale(params);
  const [projects, featured, settings] = await Promise.all([
    getPublishedProjects(locale, dictionary),
    getFeaturedProjects(locale, dictionary),
    getSiteSettings(),
  ]);
  const page = dictionary.portfolioPage;

  const statValues = [
    settings?.portfolioStat1Value,
    settings?.portfolioStat2Value,
    settings?.portfolioStat3Value,
    settings?.portfolioStat4Value,
    settings?.portfolioStat5Value,
  ];
  const statLabels = [
    settings?.portfolioStat1Label,
    settings?.portfolioStat2Label,
    settings?.portfolioStat3Label,
    settings?.portfolioStat4Label,
    settings?.portfolioStat5Label,
  ];
  const stats = page.stats.map((stat, index) => ({
    value: pick(statValues[index], stat.value),
    label: pick(statLabels[index], stat.label),
  }));

  return (
    <main className="theme-dark-warm bg-background text-foreground flex-1 pt-22">
      <PortfolioHero items={featured} />

      <Container>
        <div className="border-t border-[#f2ece0]/10 pt-10 pb-20">
          <PortfolioGrid projects={projects} />
        </div>
      </Container>

      <PortfolioStats eyebrow={page.statsEyebrow} stats={stats} />

      <CTASection locale={locale} dictionary={dictionary} />
    </main>
  );
}
```

- [ ] **Step 2: Typecheck + lint + testes**

Run: `npm run typecheck && npm run lint && npm test`
Expected: tudo passa. Se o typecheck reclamar de `page.stats` não existir no tipo `Dictionary`, conferir se a Task 4 (Step 1, pt-BR) foi salva corretamente — o tipo é inferido do JSON.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/portfolio/page.tsx
git commit -m "feat: monta banner de destaques e faixa de numeros na pagina portfolio"
```

---

### Task 10: Verificação manual ponta a ponta

**Files:** nenhum (só verificação — usar a skill `run`/`verify` do projeto).

- [ ] **Step 1: Subir o servidor**

```bash
npm run dev
```

Aguardar `http://localhost:3000/portfolio` responder 200.

- [ ] **Step 2: Cenário sem projetos em destaque**

Com o banco atual (nenhum projeto tem `featured: true` ainda), abrir `/portfolio` e confirmar que o banner mostra um projeto (fallback dos 3 mais recentes) sem quebrar, e sem setas se só sobrar 1 no fallback.

- [ ] **Step 3: Marcar 2+ projetos como destaque**

No admin (`/admin/projetos`), editar 2 ou mais projetos publicados e marcar "Projeto em destaque" (nova linha de ajuda deve aparecer sob o checkbox). Voltar em `/portfolio` (F5) e confirmar:
- O banner mostra um desses projetos, com título/categoria/cidade/ano reais e link "Ver projeto" funcionando.
- As setas ‹ › alternam entre os projetos marcados, dando a volta nas duas pontas.
- "Ver todos os projetos" rola até a grade (âncora `#grade`).

- [ ] **Step 4: Grade e filtro**

Confirmar que a grade abaixo do banner mostra o filtro em coluna vertical no desktop (lg+) e horizontal no mobile, o selo de categoria aparece no canto de cada foto, e que filtro/ordenação/paginação continuam funcionando como antes.

- [ ] **Step 5: Faixa de números via editor visual**

Abrir `/admin/editor`, aba Portfólio, clicar em um dos 5 números no rodapé da prévia e confirmar que abre o painel de edição (`data-cms="set:portfolioStat1Value"` etc.), salvar um valor novo e ver refletido na prévia.

- [ ] **Step 6: Console limpo**

Conferir no DevTools que não há erros no console em nenhuma das telas visitadas acima.

Se algo não sair como esperado, reportar antes de considerar a task concluída — não seguir adiante com um cenário quebrado.
