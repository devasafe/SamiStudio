# Portfólio Masonry — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir o portfólio como um álbum de fotos em masonry (colunas, gap 0) — na página `/portfolio` (uma capa por projeto, foto → projeto) e na página do projeto `/portfolio/[slug]` (galeria com lightbox).

**Architecture:** Um componente de apresentação `PhotoMasonry` (CSS columns, sem lib) reutilizado nos dois lugares. A página `/portfolio` (já client, `PortfolioGrid`) troca os cards por masonry de capas. A página do projeto usa `ProjectGallery` (client) = `PhotoMasonry` + `PhotoLightbox`. A `gallery` já existe no schema Mongo; só é exposta via um helper puro `toMasonryPhotos`.

**Tech Stack:** Next.js 16, React, TypeScript strict, Tailwind v4, `next/image`, vitest (node).

## Global Constraints

- **Sem novas dependências** (masonry via CSS columns, não lib).
- **i18n obrigatório**: nenhum texto hardcoded; chaves em `pt-BR`, `en`, `es`.
- **TypeScript strict**: proibido `any` e `@ts-*` (regras do eslint do projeto).
- **next/image**: só hosts permitidos (`res.cloudinary.com`); URLs passam por `safeImageUrl`.
- **Ícones**: importar de `@/components/icons` (`ArrowLeft`, `ArrowRight`, `X`).
- Cada task termina com `npx tsc --noEmit`, `npx eslint <arquivos>` e `npx prettier --write <arquivos>` limpos.
- Testes vitest são `*.test.ts` em ambiente node (só lógica pura — não há testing-library).

---

### Task 1: Tipo `MasonryPhoto` + helper puro `toMasonryPhotos`

**Files:**
- Modify: `src/types/project.ts`
- Create: `src/lib/gallery.ts`
- Test: `src/lib/gallery.test.ts`

**Interfaces:**
- Produces: `MasonryPhoto = { url: string; alt: string; width?: number; height?: number; href?: string }`; `toMasonryPhotos(gallery: GalleryItem[] | undefined, fallbackAlt: string): MasonryPhoto[]`.
- Consumes: `safeImageUrl` de `@/lib/images`, `GalleryItem` de `@/models/project`.

- [ ] **Step 1: Add `MasonryPhoto` ao tipo e `gallery` ao `PortfolioItem`**

Em `src/types/project.ts`, adicione antes de `PortfolioItem`:

```ts
/** Foto para o mosaico masonry (portfólio e galerias). */
export interface MasonryPhoto {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  /** Quando presente, a foto é um link (mosaico geral → projeto). */
  href?: string;
}
```

E dentro de `PortfolioItem`, adicione o campo:

```ts
  /** Galeria do projeto pronta para o masonry (vazia se não houver). */
  gallery?: MasonryPhoto[];
```

- [ ] **Step 2: Write the failing test**

Crie `src/lib/gallery.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { toMasonryPhotos } from "@/lib/gallery";

describe("toMasonryPhotos", () => {
  it("ordena por order, aplica fallback de alt e descarta host não permitido", () => {
    const photos = toMasonryPhotos(
      [
        { url: "https://res.cloudinary.com/demo/b.jpg", order: 2, width: 800, height: 600 },
        { url: "https://res.cloudinary.com/demo/a.jpg", order: 1, alt: "Capa" },
        { url: "https://evil.com/x.jpg", order: 0 },
      ],
      "Projeto X"
    );
    expect(photos.map((p) => p.url)).toEqual([
      "https://res.cloudinary.com/demo/a.jpg",
      "https://res.cloudinary.com/demo/b.jpg",
    ]);
    expect(photos[0].alt).toBe("Capa");
    expect(photos[1].alt).toBe("Projeto X");
    expect(photos[1].width).toBe(800);
  });

  it("retorna [] para galeria vazia ou ausente", () => {
    expect(toMasonryPhotos(undefined, "X")).toEqual([]);
    expect(toMasonryPhotos([], "X")).toEqual([]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/gallery.test.ts`
Expected: FAIL — `toMasonryPhotos` não existe (módulo `@/lib/gallery` inexistente).

- [ ] **Step 4: Write minimal implementation**

Crie `src/lib/gallery.ts`:

```ts
import { safeImageUrl } from "@/lib/images";
import type { GalleryItem } from "@/models/project";
import type { MasonryPhoto } from "@/types/project";

/** Converte a galeria do Mongo em fotos prontas para o masonry:
 * ordena por `order`, aplica `alt` de fallback e descarta URLs inválidas. */
export function toMasonryPhotos(
  gallery: GalleryItem[] | undefined,
  fallbackAlt: string
): MasonryPhoto[] {
  if (!gallery || gallery.length === 0) {
    return [];
  }
  return gallery
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item): MasonryPhoto | null => {
      const url = safeImageUrl(item.url);
      if (!url) {
        return null;
      }
      return {
        url,
        alt: item.alt && item.alt.trim() ? item.alt : fallbackAlt,
        width: item.width,
        height: item.height,
      };
    })
    .filter((photo): photo is MasonryPhoto => photo !== null);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/gallery.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 6: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/lib/gallery.ts src/types/project.ts && npx prettier --write src/lib/gallery.ts src/lib/gallery.test.ts src/types/project.ts`
Expected: sem erros.

- [ ] **Step 7: Commit**

```bash
git add src/types/project.ts src/lib/gallery.ts src/lib/gallery.test.ts
git commit -m "feat(portfolio): helper toMasonryPhotos e tipo MasonryPhoto"
```

---

### Task 2: Expor `gallery` no `content.ts`

**Files:**
- Modify: `src/lib/content.ts:28-39` (`toPortfolioItem`)

**Interfaces:**
- Consumes: `toMasonryPhotos` (Task 1).
- Produces: `PortfolioItem.gallery` preenchido por `getPublishedProjects` e `getProjectBySlug`.

- [ ] **Step 1: Importar o helper**

No topo de `src/lib/content.ts`, junto aos imports, adicione:

```ts
import { toMasonryPhotos } from "@/lib/gallery";
```

- [ ] **Step 2: Preencher `gallery` em `toPortfolioItem`**

Substitua a função `toPortfolioItem` por:

```ts
function toPortfolioItem(doc: ProjectDoc, locale: Locale, categoryName?: string): PortfolioItem {
  const title = translated(doc, locale, "title", doc.title) ?? doc.title;
  return {
    slug: doc.slug,
    title,
    description: translated(doc, locale, "description", doc.description),
    client: doc.client,
    city: doc.city,
    year: doc.year,
    coverImage: safeImageUrl(doc.coverImage),
    categoryLabel: categoryName,
    gallery: toMasonryPhotos(doc.gallery, title),
  };
}
```

- [ ] **Step 3: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/lib/content.ts && npx prettier --write src/lib/content.ts`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat(portfolio): expor gallery nos itens de portfolio"
```

---

### Task 3: Chaves i18n do lightbox

**Files:**
- Modify: `src/i18n/dictionaries/pt-BR.json`, `en.json`, `es.json` (objeto `projectPage`)

**Interfaces:**
- Produces: `dictionary.projectPage.lightbox = { close, prev, next }`.

- [ ] **Step 1: Adicionar `lightbox` em cada dicionário**

Em `projectPage` de **pt-BR.json**, adicione:

```json
"lightbox": { "close": "Fechar", "prev": "Foto anterior", "next": "Próxima foto" }
```

Em **en.json**:

```json
"lightbox": { "close": "Close", "prev": "Previous photo", "next": "Next photo" }
```

Em **es.json**:

```json
"lightbox": { "close": "Cerrar", "prev": "Foto anterior", "next": "Foto siguiente" }
```

- [ ] **Step 2: Typecheck + format**

Run: `npx tsc --noEmit && npx prettier --write src/i18n/dictionaries/pt-BR.json src/i18n/dictionaries/en.json src/i18n/dictionaries/es.json`
Expected: sem erros (o tipo `Dictionary` deriva do pt-BR; as três chaves precisam existir nos três arquivos).

- [ ] **Step 3: Commit**

```bash
git add src/i18n/dictionaries/pt-BR.json src/i18n/dictionaries/en.json src/i18n/dictionaries/es.json
git commit -m "feat(portfolio): i18n dos controles do lightbox"
```

---

### Task 4: Componente `PhotoMasonry`

**Files:**
- Create: `src/components/portfolio/photo-masonry.tsx`

**Interfaces:**
- Consumes: `MasonryPhoto` (Task 1).
- Produces: `PhotoMasonry({ photos, onPhotoClick?, sizes? })`.

- [ ] **Step 1: Criar o componente**

Crie `src/components/portfolio/photo-masonry.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { MasonryPhoto } from "@/types/project";

interface PhotoMasonryProps {
  photos: MasonryPhoto[];
  /** Modo galeria: dispara o índice clicado (abre o lightbox no wrapper). */
  onPhotoClick?: (index: number) => void;
  /** `sizes` do next/image; default coerente com 2/3/4 colunas. */
  sizes?: string;
}

const DEFAULT_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

/**
 * Mosaico masonry por CSS columns (2/3/4), sem gaps. Cada foto mantém a
 * proporção pelas dimensões reais (sem layout shift). Vira link quando a
 * foto tem `href`; vira botão quando há `onPhotoClick`; senão só exibe.
 */
export function PhotoMasonry({ photos, onPhotoClick, sizes }: PhotoMasonryProps) {
  return (
    <div className="columns-2 gap-0 sm:columns-3 lg:columns-4">
      {photos.map((photo, index) => {
        const image = (
          <Image
            src={photo.url}
            alt={photo.alt}
            width={photo.width ?? 1200}
            height={photo.height ?? 900}
            sizes={sizes ?? DEFAULT_SIZES}
            className="block h-auto w-full"
          />
        );
        const key = `${photo.url}-${index}`;
        const base = "block w-full break-inside-avoid";

        if (photo.href) {
          return (
            <Link key={key} href={photo.href} className={base}>
              {image}
            </Link>
          );
        }
        if (onPhotoClick) {
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPhotoClick(index)}
              className={`${base} cursor-zoom-in`}
            >
              {image}
            </button>
          );
        }
        return (
          <div key={key} className={base}>
            {image}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/components/portfolio/photo-masonry.tsx && npx prettier --write src/components/portfolio/photo-masonry.tsx`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/photo-masonry.tsx
git commit -m "feat(portfolio): componente PhotoMasonry (css columns, gap 0)"
```

---

### Task 5: Componente `PhotoLightbox`

**Files:**
- Create: `src/components/portfolio/photo-lightbox.tsx`

**Interfaces:**
- Consumes: `MasonryPhoto` (Task 1); ícones `ArrowLeft`, `ArrowRight`, `X`.
- Produces: `PhotoLightbox({ photos, index, onClose, onNavigate, labels })` com `labels: { close, prev, next }`.

- [ ] **Step 1: Criar o componente**

Crie `src/components/portfolio/photo-lightbox.tsx`:

```tsx
"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "@/components/icons";
import type { MasonryPhoto } from "@/types/project";

interface LightboxLabels {
  close: string;
  prev: string;
  next: string;
}

interface PhotoLightboxProps {
  photos: MasonryPhoto[];
  /** Índice aberto; `null` = fechado. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  labels: LightboxLabels;
}

/** Overlay full-screen com a foto ampliada; navegação por setas e teclado. */
export function PhotoLightbox({ photos, index, onClose, onNavigate, labels }: PhotoLightboxProps) {
  const isOpen = index !== null;

  const go = useCallback(
    (direction: number) => {
      if (index === null) {
        return;
      }
      onNavigate((index + direction + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        go(1);
      } else if (event.key === "ArrowLeft") {
        go(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, go]);

  if (index === null) {
    return null;
  }
  const photo = photos[index];
  const iconButton =
    "absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5" aria-hidden />
      </button>

      {photos.length > 1 ? (
        <button
          type="button"
          aria-label={labels.prev}
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
          className={`${iconButton} left-4`}
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
      ) : null}

      <div
        className="relative flex max-h-[86vh] max-w-[90vw] items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.alt}
          width={photo.width ?? 1600}
          height={photo.height ?? 1200}
          sizes="90vw"
          className="max-h-[86vh] w-auto object-contain"
          priority
        />
      </div>

      {photos.length > 1 ? (
        <button
          type="button"
          aria-label={labels.next}
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
          className={`${iconButton} right-4`}
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/components/portfolio/photo-lightbox.tsx && npx prettier --write src/components/portfolio/photo-lightbox.tsx`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/photo-lightbox.tsx
git commit -m "feat(portfolio): componente PhotoLightbox com teclado e setas"
```

---

### Task 6: `ProjectGallery` (masonry + lightbox)

**Files:**
- Create: `src/components/portfolio/project-gallery.tsx`

**Interfaces:**
- Consumes: `PhotoMasonry` (Task 4), `PhotoLightbox` (Task 5), `MasonryPhoto` (Task 1).
- Produces: `ProjectGallery({ photos, labels })` com `labels: { close, prev, next }`.

- [ ] **Step 1: Criar o wrapper**

Crie `src/components/portfolio/project-gallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import { PhotoLightbox } from "@/components/portfolio/photo-lightbox";
import { PhotoMasonry } from "@/components/portfolio/photo-masonry";
import type { MasonryPhoto } from "@/types/project";

interface ProjectGalleryProps {
  photos: MasonryPhoto[];
  labels: { close: string; prev: string; next: string };
}

/** Galeria do projeto: masonry clicável que abre o lightbox no índice certo. */
export function ProjectGallery({ photos, labels }: ProjectGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <PhotoMasonry photos={photos} onPhotoClick={setOpenIndex} />
      <PhotoLightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
        labels={labels}
      />
    </>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/components/portfolio/project-gallery.tsx && npx prettier --write src/components/portfolio/project-gallery.tsx`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/project-gallery.tsx
git commit -m "feat(portfolio): ProjectGallery unindo masonry e lightbox"
```

---

### Task 7: Integrar o masonry na página `/portfolio`

**Files:**
- Modify: `src/components/portfolio/portfolio-grid.tsx`

**Interfaces:**
- Consumes: `PhotoMasonry` (Task 4), `MasonryPhoto` (Task 1), `localePath` de `@/i18n/config`.

- [ ] **Step 1: Trocar o grid de cards por masonry de capas**

Substitua o conteúdo de `src/components/portfolio/portfolio-grid.tsx` por:

```tsx
"use client";

import { useState } from "react";
import { PhotoMasonry } from "@/components/portfolio/photo-masonry";
import { useLanguage } from "@/components/providers/language-provider";
import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { MasonryPhoto, PortfolioItem } from "@/types/project";

interface PortfolioGridProps {
  projects: PortfolioItem[];
}

/** Portfólio como mosaico masonry: 1 capa por projeto, foto → projeto. */
export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const { locale, dictionary } = useLanguage();
  const [filter, setFilter] = useState<string>("all");

  const labels = [...new Set(projects.map((p) => p.categoryLabel).filter(Boolean))] as string[];
  const filtered = filter === "all" ? projects : projects.filter((p) => p.categoryLabel === filter);

  const photos: MasonryPhoto[] = filtered
    .filter((project) => project.coverImage)
    .map((project) => ({
      url: project.coverImage as string,
      alt: project.title,
      href: localePath(locale, `/portfolio/${project.slug}`),
    }));

  const filterButton = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={cn(
        "text-small rounded-md border px-4 py-2 transition-colors",
        filter === value
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {filterButton("all", dictionary.portfolioPage.all)}
          {labels.map((label) => filterButton(label, label))}
        </div>
      ) : null}

      {photos.length === 0 ? (
        <p className="text-body text-muted-foreground mt-16">{dictionary.portfolioPage.empty}</p>
      ) : (
        <div className="mt-12">
          <PhotoMasonry photos={photos} />
        </div>
      )}
    </div>
  );
}
```

Nota: projetos sem `coverImage` (placeholders) ficam de fora do mosaico. O `ProjectCard` deixa de ser usado por este componente — não removê-lo (ainda é usado por `portfolio-section.tsx` na home).

- [ ] **Step 2: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/components/portfolio/portfolio-grid.tsx && npx prettier --write src/components/portfolio/portfolio-grid.tsx`
Expected: sem erros.

- [ ] **Step 3: Smoke test no dev**

Run (com o dev server ativo): `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/portfolio`
Expected: `200`. Abrir no navegador: as capas aparecem em colunas coladas; clicar leva ao projeto; filtro por categoria funciona.

- [ ] **Step 4: Commit**

```bash
git add src/components/portfolio/portfolio-grid.tsx
git commit -m "feat(portfolio): pagina /portfolio como mosaico masonry de capas"
```

---

### Task 8: Integrar a galeria na página do projeto `/portfolio/[slug]`

**Files:**
- Modify: `src/app/[locale]/portfolio/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ProjectGallery` (Task 6); `project.gallery` (Task 2); `dictionary.projectPage.lightbox` (Task 3).

- [ ] **Step 1: Importar o `ProjectGallery`**

No topo de `src/app/[locale]/portfolio/[slug]/page.tsx`, adicione:

```tsx
import { ProjectGallery } from "@/components/portfolio/project-gallery";
```

- [ ] **Step 2: Renderizar a galeria quando houver fotos**

Logo **após** o bloco `<div>` da capa (o `div` com `aspect-[4/3]` que contém a capa/placeholder) e **antes** do `<dl>` de metadados, insira:

```tsx
          {project.gallery && project.gallery.length > 0 ? (
            <div className="mt-12">
              <ProjectGallery photos={project.gallery} labels={labels.lightbox} />
            </div>
          ) : null}
```

(`labels` já é `dictionary.projectPage` neste arquivo — ver a linha `const labels = dictionary.projectPage;`.)

- [ ] **Step 3: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint "src/app/[locale]/portfolio/[slug]/page.tsx" && npx prettier --write "src/app/[locale]/portfolio/[slug]/page.tsx"`
Expected: sem erros.

- [ ] **Step 4: Smoke test no dev**

Run: abrir `http://localhost:3000/portfolio/<slug-de-um-projeto-com-gallery>`.
Expected: as fotos da galeria aparecem em masonry colado; clicar abre o lightbox; setas e Esc funcionam; projetos sem galeria mantêm só a capa + "galeria em breve".

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/portfolio/[slug]/page.tsx"
git commit -m "feat(portfolio): galeria do projeto em masonry com lightbox"
```

---

## Self-Review

**Spec coverage:**
- Componente `PhotoMasonry` reutilizável, CSS columns 2/3/4, gap 0 → Task 4. ✓
- `PhotoLightbox` (teclado, setas, aria-modal, trava scroll) → Task 5. ✓
- `ProjectGallery` (estado do índice) → Task 6. ✓
- `/portfolio` como mosaico de 1 capa por projeto, filtro mantido, foto → projeto → Task 7. ✓
- `/portfolio/[slug]` com galeria em masonry + lightbox, fallback quando vazia → Task 8. ✓
- `content.ts` expõe `gallery`; dimensões reais no `next/image` → Tasks 1, 2, 4. ✓
- i18n dos controles do lightbox (pt/en/es) → Task 3. ✓
- Sem novas dependências; sem `any`/`@ts-*` → Global Constraints. ✓

**Fora de escopo (da spec, não implementado aqui):** cadastro de galeria no admin, reordenação drag-and-drop, zoom/pan no lightbox. Se `Project.gallery` estiver vazia no banco, a galeria do projeto simplesmente não aparece (fallback mantido) — sem erro.

**Type consistency:** `MasonryPhoto` (Task 1) é consumido igual em Tasks 2, 4, 5, 6, 7. `labels: { close, prev, next }` idêntico em Tasks 3, 5, 6, 8. `onPhotoClick(index)` / `onNavigate(index)` coerentes entre 4, 5, 6. ✓

**Placeholder scan:** nenhum TBD/TODO; todo passo de código traz o código completo. ✓
