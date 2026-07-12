# Admin de Projetos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformar o admin de projetos: lista com miniaturas, criar/editar em tela dedicada, upload de múltiplas fotos em qualquer tamanho (crop opcional) com reordenar por arrastar, e opção "checkpoint" que revela uploads Antes/Depois.

**Architecture:** Projetos sai do `CrudPage` genérico e ganha páginas próprias (`/admin/projetos`, `/novo`, `/[id]`). Componentes novos em `src/components/admin/projects/`: `ProjectList`, `ProjectForm`, `GalleryUploader`, `ImageUploader`, `CropDialog`, mais os helpers `upload.ts` (POST /upload/image) e `gallery-utils.ts` (puro). O backend já aceita `gallery`/`beforeImage`/`afterImage`; só ganha o campo `checkpoint`.

**Tech Stack:** Next.js 16 (App Router, client components), TypeScript strict, Tailwind v4, `react-easy-crop` 6.2 (já instalado), Cloudinary via `/api/v1/upload/image`, vitest (node).

## Global Constraints

- **Sem novas dependências** (crop usa `react-easy-crop` já instalado; drag usa HTML5 nativo).
- **TypeScript strict**: proibido `any` e `@ts-*`.
- **Admin usa texto PT direto** (sem dicionários i18n) — seguir esse padrão.
- **Upload** só via `POST /api/v1/upload/image` (limite 10 MB; JPG/PNG/WebP/AVIF); a resposta traz `{ url, width, height }`.
- **API client**: `api<T>(path, { method, json?, body? })` de `@/components/admin/api-client` retorna `{ data }`; erros são `AdminApiError`.
- **Capa** = 1ª foto da galeria (`coverImage = gallery[0].url` no envio).
- Cada task termina com `npx tsc --noEmit`, `npx eslint <arquivos>`, `npx prettier --write <arquivos>` limpos.
- Testes vitest são `*.test.ts` em ambiente node (só lógica pura).

---

### Task 1: Campo `checkpoint` no backend

**Files:**
- Modify: `src/models/project.ts`
- Modify: `src/lib/validation.ts:44-78`
- Test: `src/lib/validation.test.ts`

**Interfaces:**
- Produces: `ProjectDoc.checkpoint?: boolean`; `projectCreateSchema` aceita `checkpoint`.

- [ ] **Step 1: Write the failing test**

Acrescente ao final de `src/lib/validation.test.ts` (dentro do arquivo, mantendo os imports existentes; se `projectCreateSchema` ainda não é importado lá, importe de `@/lib/validation`):

```ts
import { projectCreateSchema } from "@/lib/validation";

describe("projectCreateSchema checkpoint", () => {
  it("aceita checkpoint booleano e mantém opcional", () => {
    const base = { slug: "casa-x", title: "Casa X" };
    expect(projectCreateSchema.parse({ ...base, checkpoint: true }).checkpoint).toBe(true);
    expect(projectCreateSchema.parse(base).checkpoint).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/validation.test.ts`
Expected: FAIL — `checkpoint` é removido pelo Zod (não está no schema), então `.checkpoint` é `undefined` mesmo quando enviado `true`.

- [ ] **Step 3: Add the field to schema + validation**

Em `src/lib/validation.ts`, dentro de `projectCreateSchema` (após a linha `afterImage: z.string().url().optional(),`):

```ts
  checkpoint: z.boolean().optional(),
```

Em `src/models/project.ts`, na interface `ProjectDoc` (após `afterImage?: string;`):

```ts
  checkpoint?: boolean;
```

E no `projectSchema` (após `afterImage: { type: String },`):

```ts
    checkpoint: { type: Boolean, default: false },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/validation.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck + lint + format + commit**

Run: `npx tsc --noEmit && npx eslint src/lib/validation.ts src/models/project.ts && npx prettier --write src/lib/validation.ts src/lib/validation.test.ts src/models/project.ts`

```bash
git add src/lib/validation.ts src/lib/validation.test.ts src/models/project.ts
git commit -m "feat(admin): campo checkpoint no projeto (schema + validacao)"
```

---

### Task 2: Helpers `gallery-utils` (puro) e `upload`

**Files:**
- Create: `src/components/admin/projects/gallery-utils.ts`
- Create: `src/components/admin/projects/upload.ts`
- Test: `src/components/admin/projects/gallery-utils.test.ts`

**Interfaces:**
- Produces: `reindex`, `moveItem`, `removeItem`, `coverFromGallery` (gallery-utils); `uploadImage(file): Promise<UploadedImage>` e o tipo `UploadedImage` (upload).
- Consumes: `GalleryItem` de `@/models/project`; `api` de `@/components/admin/api-client`.

- [ ] **Step 1: Write the failing test (gallery-utils)**

Create `src/components/admin/projects/gallery-utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { coverFromGallery, moveItem, reindex, removeItem } from "./gallery-utils";

const g = (url: string, order: number) => ({ url, order });

describe("gallery-utils", () => {
  it("reindex numera order pela posição", () => {
    expect(reindex([g("a", 5), g("b", 9)]).map((i) => i.order)).toEqual([0, 1]);
  });

  it("moveItem move e reindexa", () => {
    const out = moveItem([g("a", 0), g("b", 1), g("c", 2)], 0, 2);
    expect(out.map((i) => i.url)).toEqual(["b", "c", "a"]);
    expect(out.map((i) => i.order)).toEqual([0, 1, 2]);
  });

  it("moveItem ignora índices inválidos", () => {
    const items = [g("a", 0)];
    expect(moveItem(items, 0, 5)).toBe(items);
  });

  it("removeItem remove e reindexa", () => {
    const out = removeItem([g("a", 0), g("b", 1), g("c", 2)], 1);
    expect(out.map((i) => i.url)).toEqual(["a", "c"]);
    expect(out.map((i) => i.order)).toEqual([0, 1]);
  });

  it("coverFromGallery devolve a url da primeira", () => {
    expect(coverFromGallery([g("a", 0), g("b", 1)])).toBe("a");
    expect(coverFromGallery([])).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/admin/projects/gallery-utils.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implement gallery-utils**

Create `src/components/admin/projects/gallery-utils.ts`:

```ts
import type { GalleryItem } from "@/models/project";

/** Renumera `order` sequencialmente conforme a posição no array. */
export function reindex(items: GalleryItem[]): GalleryItem[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

/** Move o item de `from` para `to` e reindexa. Índices inválidos → sem efeito. */
export function moveItem(items: GalleryItem[], from: number, to: number): GalleryItem[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return reindex(next);
}

/** Remove o item no índice e reindexa. */
export function removeItem(items: GalleryItem[], index: number): GalleryItem[] {
  return reindex(items.filter((_, i) => i !== index));
}

/** Capa derivada = url da primeira foto (ou undefined se vazia). */
export function coverFromGallery(items: GalleryItem[]): string | undefined {
  return items[0]?.url;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/admin/projects/gallery-utils.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 5: Implement upload helper**

Create `src/components/admin/projects/upload.ts`:

```ts
import { api } from "@/components/admin/api-client";

export interface UploadedImage {
  url: string;
  width?: number;
  height?: number;
}

/** Envia um arquivo (ou blob recortado) a /upload/image e devolve url + dimensões. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api<UploadedImage>("/upload/image", {
    method: "POST",
    body: formData,
  });
  return { url: data.url, width: data.width, height: data.height };
}
```

- [ ] **Step 6: Typecheck + lint + format + commit**

Run: `npx tsc --noEmit && npx eslint src/components/admin/projects/gallery-utils.ts src/components/admin/projects/upload.ts && npx prettier --write src/components/admin/projects/gallery-utils.ts src/components/admin/projects/gallery-utils.test.ts src/components/admin/projects/upload.ts`

```bash
git add src/components/admin/projects/gallery-utils.ts src/components/admin/projects/gallery-utils.test.ts src/components/admin/projects/upload.ts
git commit -m "feat(admin): helpers de galeria (puro) e upload de imagem"
```

---

### Task 3: `CropDialog` (recorte opcional com proporções)

**Files:**
- Create: `src/components/admin/projects/crop-dialog.tsx`

**Interfaces:**
- Produces: `CropDialog({ source, onCancel, onCropped, busy? })` — `source: string | null` (dataURL ou URL Cloudinary), `onCropped: (blob: Blob) => void`.

- [ ] **Step 1: Create the component**

Create `src/components/admin/projects/crop-dialog.tsx`:

```tsx
"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ASPECTS = [
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

/** Recorta a área escolhida num canvas e devolve WebP. Aceita URL remota (Cloudinary). */
async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao ler a imagem."));
    img.src = imageSrc;
  });

  const MAX_WIDTH = 1920;
  const scale = Math.min(1, MAX_WIDTH / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponível.");
  }
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao recortar."))),
      "image/webp",
      0.85
    );
  });
}

interface CropDialogProps {
  /** dataURL ou URL da imagem a recortar; `null` = fechado. */
  source: string | null;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  busy?: boolean;
}

export function CropDialog({ source, onCancel, onCropped, busy }: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number>(4 / 3);
  const [area, setArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function handleConfirm() {
    if (!source || !area) {
      return;
    }
    try {
      onCropped(await cropToBlob(source, area));
    } catch {
      setError("Não foi possível recortar esta imagem.");
    }
  }

  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recortar imagem</DialogTitle>
        </DialogHeader>
        <div className="bg-muted relative h-96 w-full overflow-hidden rounded-md">
          {source ? (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs">Proporção</Label>
          {ASPECTS.map((option) => (
            <Button
              key={option.label}
              type="button"
              size="sm"
              variant={aspect === option.value ? "default" : "outline"}
              onClick={() => setAspect(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="crop-zoom" className="text-xs">
            Zoom
          </Label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="accent-foreground w-full"
          />
        </div>
        {error ? <p className="text-error text-sm">{error}</p> : null}
        <Button onClick={handleConfirm} disabled={busy || !area}>
          {busy ? "Enviando..." : "Cortar e usar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format + commit**

Run: `npx tsc --noEmit && npx eslint src/components/admin/projects/crop-dialog.tsx && npx prettier --write src/components/admin/projects/crop-dialog.tsx`

```bash
git add src/components/admin/projects/crop-dialog.tsx
git commit -m "feat(admin): CropDialog com proporcoes e recorte opcional"
```

---

### Task 4: `ImageUploader` (imagem única, crop opcional)

**Files:**
- Create: `src/components/admin/projects/image-uploader.tsx`

**Interfaces:**
- Consumes: `uploadImage` (Task 2), `CropDialog` (Task 3), `AdminApiError`.
- Produces: `ImageUploader({ label, value, onChange })` — `value: string`, `onChange: (url: string) => void`.

- [ ] **Step 1: Create the component**

Create `src/components/admin/projects/image-uploader.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AdminApiError } from "@/components/admin/api-client";
import { CropDialog } from "@/components/admin/projects/crop-dialog";
import { uploadImage } from "@/components/admin/projects/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

/** Imagem única: envia o original por padrão; "Recortar" abre o CropDialog. */
export function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(file: File) {
    setBusy(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
      setCropSource(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value ? (
        <div className="border-border relative w-full max-w-xs overflow-hidden rounded-md border">
          <Image
            src={value}
            alt={label}
            width={320}
            height={240}
            sizes="320px"
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Enviando..." : value ? "Trocar" : "Enviar imagem"}
        </Button>
        {value ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setCropSource(value)}>
              Recortar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Remover
            </Button>
          </>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void send(file);
          }
          event.target.value = "";
        }}
      />
      {error ? <p className="text-error text-sm">{error}</p> : null}

      <CropDialog
        source={cropSource}
        busy={busy}
        onCancel={() => setCropSource(null)}
        onCropped={(blob) => void send(new File([blob], "recorte.webp", { type: "image/webp" }))}
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format + commit**

Run: `npx tsc --noEmit && npx eslint src/components/admin/projects/image-uploader.tsx && npx prettier --write src/components/admin/projects/image-uploader.tsx`

```bash
git add src/components/admin/projects/image-uploader.tsx
git commit -m "feat(admin): ImageUploader com envio original e recorte opcional"
```

---

### Task 5: `GalleryUploader` (múltiplas fotos, arrastar-reordenar, crop opcional)

**Files:**
- Create: `src/components/admin/projects/gallery-uploader.tsx`

**Interfaces:**
- Consumes: `GalleryItem` (`@/models/project`); `uploadImage` (Task 2); `moveItem`, `removeItem`, `reindex` (Task 2); `CropDialog` (Task 3); `AdminApiError`.
- Produces: `GalleryUploader({ value, onChange })` — `value: GalleryItem[]`, `onChange: (items: GalleryItem[]) => void`.

- [ ] **Step 1: Create the component**

Create `src/components/admin/projects/gallery-uploader.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AdminApiError } from "@/components/admin/api-client";
import { CropDialog } from "@/components/admin/projects/crop-dialog";
import { moveItem, reindex, removeItem } from "@/components/admin/projects/gallery-utils";
import { uploadImage } from "@/components/admin/projects/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { GalleryItem } from "@/models/project";

interface GalleryUploaderProps {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

/**
 * Galeria do projeto: várias fotos no tamanho original (crop opcional),
 * reordenáveis por arrastar (com fallback ◄/►). A 1ª foto é a capa.
 */
export function GalleryUploader({ value, onChange }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  async function addFiles(files: FileList) {
    setBusy(true);
    setError(null);
    try {
      const uploaded: GalleryItem[] = [];
      for (const file of Array.from(files)) {
        const { url, width, height } = await uploadImage(file);
        uploaded.push({ url, width, height });
      }
      onChange(reindex([...value, ...uploaded]));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  async function replaceWithCrop(index: number, blob: Blob) {
    setBusy(true);
    try {
      const { url, width, height } = await uploadImage(
        new File([blob], "recorte.webp", { type: "image/webp" })
      );
      const next = value.slice();
      next[index] = { ...next[index], url, width, height };
      onChange(next);
      setCropIndex(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  function updateAlt(index: number, alt: string) {
    const next = value.slice();
    next[index] = { ...next[index], alt };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Fotos do projeto (a 1ª é a capa)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Enviando..." : "Adicionar fotos"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            void addFiles(event.target.files);
          }
          event.target.value = "";
        }}
      />
      {error ? <p className="text-error text-sm">{error}</p> : null}

      {value.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma foto ainda.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) {
                  onChange(moveItem(value, dragIndex, index));
                }
                setDragIndex(null);
              }}
              className="border-border bg-background space-y-2 rounded-md border p-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded">
                <Image src={item.url} alt={item.alt ?? ""} fill sizes="200px" className="object-cover" />
                {index === 0 ? (
                  <span className="bg-foreground text-background absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px]">
                    Capa
                  </span>
                ) : null}
              </div>
              <input
                type="text"
                value={item.alt ?? ""}
                placeholder="Descrição (alt)"
                onChange={(event) => updateAlt(index, event.target.value)}
                className="border-border w-full rounded border px-2 py-1 text-xs"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    aria-label="Mover para a esquerda"
                    onClick={() => onChange(moveItem(value, index, index - 1))}
                  >
                    ◄
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === value.length - 1}
                    aria-label="Mover para a direita"
                    onClick={() => onChange(moveItem(value, index, index + 1))}
                  >
                    ►
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCropIndex(index)}>
                    Recortar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-error"
                    onClick={() => onChange(removeItem(value, index))}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CropDialog
        source={cropIndex !== null ? value[cropIndex].url : null}
        busy={busy}
        onCancel={() => setCropIndex(null)}
        onCropped={(blob) => {
          if (cropIndex !== null) {
            void replaceWithCrop(cropIndex, blob);
          }
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format + commit**

Run: `npx tsc --noEmit && npx eslint src/components/admin/projects/gallery-uploader.tsx && npx prettier --write src/components/admin/projects/gallery-uploader.tsx`

```bash
git add src/components/admin/projects/gallery-uploader.tsx
git commit -m "feat(admin): GalleryUploader (multiplo, arrastar-reordenar, crop)"
```

---

### Task 6: `ProjectForm` (formulário completo em tela)

**Files:**
- Create: `src/components/admin/projects/project-form.tsx`

**Interfaces:**
- Consumes: `api`/`AdminApiError` (`@/components/admin/api-client`); `GalleryUploader` (Task 5); `ImageUploader` (Task 4); `coverFromGallery` (Task 2); `GalleryItem` (`@/models/project`); `Button`, `Label` de `@/components/ui/*`.
- Produces: `ProjectForm({ initial?, projectId? })` — `initial?: ProjectFormValues`, `projectId?: string` (presença = editar).

- [ ] **Step 1: Create the component**

Create `src/components/admin/projects/project-form.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { GalleryUploader } from "@/components/admin/projects/gallery-uploader";
import { coverFromGallery } from "@/components/admin/projects/gallery-utils";
import { ImageUploader } from "@/components/admin/projects/image-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { GalleryItem } from "@/models/project";

export interface ProjectFormValues {
  title: string;
  slug: string;
  description: string;
  client: string;
  city: string;
  country: string;
  year: string;
  categoryId: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  gallery: GalleryItem[];
  checkpoint: boolean;
  beforeImage: string;
  afterImage: string;
}

const EMPTY: ProjectFormValues = {
  title: "",
  slug: "",
  description: "",
  client: "",
  city: "",
  country: "",
  year: "",
  categoryId: "",
  status: "draft",
  featured: false,
  gallery: [],
  checkpoint: false,
  beforeImage: "",
  afterImage: "",
};

interface CategoryOption {
  _id: string;
  name: string;
}

interface ProjectFormProps {
  initial?: Partial<ProjectFormValues>;
  projectId?: string;
}

const inputClass = "border-border w-full rounded-md border px-3 py-2 text-sm";

export function ProjectForm({ initial, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>({ ...EMPTY, ...initial });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<CategoryOption[]>("/categories");
        setCategories(data);
      } catch {
        // sem categorias o select fica vazio; não bloqueia
      }
    })();
  }, []);

  function set<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description || undefined,
      client: values.client || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      year: values.year ? Number(values.year) : undefined,
      categoryId: values.categoryId || undefined,
      status: values.status,
      featured: values.featured,
      gallery: values.gallery,
      coverImage: coverFromGallery(values.gallery),
      checkpoint: values.checkpoint,
      beforeImage: values.checkpoint ? values.beforeImage || undefined : undefined,
      afterImage: values.checkpoint ? values.afterImage || undefined : undefined,
    };
    try {
      if (projectId) {
        await api(`/projects/${projectId}`, { method: "PATCH", json: payload });
      } else {
        await api("/projects", { method: "POST", json: payload });
      }
      router.push("/admin/projetos");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Título</Label>
          <input
            id="title"
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug (URL)</Label>
          <input
            id="slug"
            required
            value={values.slug}
            placeholder="ex.: interior-miraflores"
            onChange={(e) => set("slug", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="client">Cliente</Label>
          <input id="client" value={values.client} onChange={(e) => set("client", e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">Cidade</Label>
          <input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="country">País</Label>
          <input id="country" value={values.country} onChange={(e) => set("country", e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="year">Ano</Label>
          <input id="year" type="number" value={values.year} onChange={(e) => set("year", e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => set("status", e.target.value as ProjectFormValues["status"])}
            className={inputClass}
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} />
        Projeto em destaque
      </label>

      <GalleryUploader value={values.gallery} onChange={(gallery) => set("gallery", gallery)} />

      <div className="border-border space-y-4 rounded-md border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.checkpoint} onChange={(e) => set("checkpoint", e.target.checked)} />
          Checkpoint (comparação Antes / Depois)
        </label>
        {values.checkpoint ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Antes" value={values.beforeImage} onChange={(url) => set("beforeImage", url)} />
            <ImageUploader label="Depois" value={values.afterImage} onChange={(url) => set("afterImage", url)} />
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando..." : projectId ? "Salvar" : "Criar projeto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projetos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Typecheck + lint + format + commit**

Run: `npx tsc --noEmit && npx eslint src/components/admin/projects/project-form.tsx && npx prettier --write src/components/admin/projects/project-form.tsx`

```bash
git add src/components/admin/projects/project-form.tsx
git commit -m "feat(admin): ProjectForm em tela com galeria e checkpoint"
```

---

### Task 7: Páginas de criar e editar

**Files:**
- Create: `src/app/admin/(painel)/projetos/novo/page.tsx`
- Create: `src/app/admin/(painel)/projetos/[id]/page.tsx`

**Interfaces:**
- Consumes: `ProjectForm` + `ProjectFormValues` (Task 6); `api` (`@/components/admin/api-client`).

- [ ] **Step 1: Create the "novo" page**

Create `src/app/admin/(painel)/projetos/novo/page.tsx`:

```tsx
import { ProjectForm } from "@/components/admin/projects/project-form";

export default function NovoProjetoPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Novo projeto</h1>
      <ProjectForm />
    </div>
  );
}
```

- [ ] **Step 2: Create the "editar" page (client, loads by id)**

Create `src/app/admin/(painel)/projetos/[id]/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/projects/project-form";
import type { GalleryItem } from "@/models/project";

interface ProjectResponse {
  title?: string;
  slug?: string;
  description?: string;
  client?: string;
  city?: string;
  country?: string;
  year?: number;
  categoryId?: string;
  status?: "draft" | "published" | "archived";
  featured?: boolean;
  gallery?: GalleryItem[];
  checkpoint?: boolean;
  beforeImage?: string;
  afterImage?: string;
}

export default function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<ProjectFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<ProjectResponse>(`/projects/${id}`);
        setInitial({
          title: data.title ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          client: data.client ?? "",
          city: data.city ?? "",
          country: data.country ?? "",
          year: data.year ? String(data.year) : "",
          categoryId: data.categoryId ?? "",
          status: data.status ?? "draft",
          featured: data.featured ?? false,
          gallery: data.gallery ?? [],
          checkpoint: data.checkpoint ?? false,
          beforeImage: data.beforeImage ?? "",
          afterImage: data.afterImage ?? "",
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Editar projeto</h1>
      {error ? <p className="text-error text-sm">{error}</p> : null}
      {initial ? <ProjectForm initial={initial} projectId={id} /> : <p className="text-muted-foreground text-sm">Carregando…</p>}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint "src/app/admin/(painel)/projetos/novo/page.tsx" "src/app/admin/(painel)/projetos/[id]/page.tsx" && npx prettier --write "src/app/admin/(painel)/projetos/novo/page.tsx" "src/app/admin/(painel)/projetos/[id]/page.tsx"`

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(painel)/projetos/novo/page.tsx" "src/app/admin/(painel)/projetos/[id]/page.tsx"
git commit -m "feat(admin): telas de criar e editar projeto"
```

---

### Task 8: `ProjectList` + página da lista com miniaturas

**Files:**
- Create: `src/components/admin/projects/project-list.tsx`
- Modify: `src/app/admin/(painel)/projetos/page.tsx` (substitui o `CrudPage`)

**Interfaces:**
- Consumes: `api`/`AdminApiError`; `coverFromGallery` (Task 2); `GalleryItem` (`@/models/project`); `Button`, `Link`.

- [ ] **Step 1: Create ProjectList**

Create `src/components/admin/projects/project-list.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { coverFromGallery } from "@/components/admin/projects/gallery-utils";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "@/models/project";

interface ProjectRow {
  _id: string;
  title: string;
  city?: string;
  year?: number;
  status: string;
  coverImage?: string;
  gallery?: GalleryItem[];
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function ProjectList() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api<ProjectRow[]>("/projects");
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function handleDelete(row: ProjectRow) {
    if (!window.confirm(`Remover "${row.title}"?`)) {
      return;
    }
    try {
      await api(`/projects/${row._id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Projetos</h1>
        <Link href="/admin/projetos/novo">
          <Button>Novo projeto</Button>
        </Link>
      </div>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum projeto ainda.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const cover = coverFromGallery(row.gallery ?? []) ?? row.coverImage;
            return (
              <li key={row._id} className="border-border bg-background overflow-hidden rounded-lg border">
                <div className="bg-muted relative aspect-[4/3]">
                  {cover ? (
                    <Image src={cover} alt={row.title} fill sizes="360px" className="object-cover" />
                  ) : (
                    <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                      Sem foto
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium">{row.title}</h2>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {[row.city, row.year].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/admin/projetos/${row._id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-error" onClick={() => handleDelete(row)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace the projetos page**

Replace the entire contents of `src/app/admin/(painel)/projetos/page.tsx` with:

```tsx
import { ProjectList } from "@/components/admin/projects/project-list";

export default function AdminProjectsPage() {
  return <ProjectList />;
}
```

- [ ] **Step 3: Typecheck + lint + format**

Run: `npx tsc --noEmit && npx eslint src/components/admin/projects/project-list.tsx "src/app/admin/(painel)/projetos/page.tsx" && npx prettier --write src/components/admin/projects/project-list.tsx "src/app/admin/(painel)/projetos/page.tsx"`

- [ ] **Step 4: Smoke test (dev server running on :3000)**

The admin requires login, so a `curl` will redirect — that's expected. Just confirm the routes compile without runtime error:
Run: `curl -s -o /dev/null -w "lista:%{http_code} novo:" http://localhost:3000/admin/projetos ; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/projetos/novo`
Expected: HTTP codes `200` or `307`/`302` (redirect to login) — not `500`. If `500`, inspect the dev log and fix before committing.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/projects/project-list.tsx "src/app/admin/(painel)/projetos/page.tsx"
git commit -m "feat(admin): lista de projetos com miniaturas"
```

---

## Self-Review

**Spec coverage:**
- Lista com miniatura → Task 8 (`ProjectList`, capa via `coverFromGallery`). ✓
- Criar/editar em tela dedicada (não modal) → Tasks 6, 7 (`ProjectForm` + páginas `/novo` e `/[id]`). ✓
- Crop opcional (envia original por padrão) → Tasks 3, 4 (`CropDialog`, `ImageUploader`) e `GalleryUploader`. ✓
- Múltiplas fotos com reordenar por arrastar (+ fallback ◄/►) → Task 5 (`GalleryUploader`). ✓
- Checkpoint revela Antes/Depois → Tasks 1, 6 (campo + UI condicional). ✓
- Capa = 1ª foto (`coverImage` derivado) → Tasks 2, 6 (`coverFromGallery`, submit). ✓
- Backend só ganha `checkpoint`; galeria/antes/depois já aceitos → Task 1. ✓
- Admin em PT direto; sem novas deps → Global Constraints. ✓

**Type consistency:** `GalleryItem` (schema) usado igual em Tasks 2, 5, 6, 7, 8. `UploadedImage`/`uploadImage` (Task 2) consumidos em 4, 5. `ProjectFormValues` (Task 6) consumido em 7. `CropDialog` props (`source`, `onCropped`, `busy`) idênticos em 4, 5. `coverFromGallery` (Task 2) em 6, 8.

**Placeholder scan:** nenhum TBD/TODO; todo passo traz o código completo.

**Fora de escopo (da spec):** exibição do antes/depois no site público; upload por arrastar-da-área-de-trabalho; edição de vídeo/SEO/traduções na nova tela.

**Nota de risco para o review:** o crop de fotos já enviadas usa a URL do Cloudinary como `source` do canvas (`crossOrigin="anonymous"`) — depende do CORS do Cloudinary (que normalmente permite). Se o recorte de foto já hospedada falhar por CORS, o envio original (fluxo principal) não é afetado; tratar como melhoria isolada.
