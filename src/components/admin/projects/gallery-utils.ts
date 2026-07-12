import type { GalleryItem } from "@/models/project";

/** Renumera `order` sequencialmente conforme a posição no array. */
export function reindex(items: GalleryItem[]): GalleryItem[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

/** Move o item de `from` para `to` e reindexa. Índices inválidos → sem efeito. */
export function moveItem(items: GalleryItem[], from: number, to: number): GalleryItem[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
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
