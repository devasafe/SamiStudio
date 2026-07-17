import type { GalleryItem } from "@/models/project";

// Reordenar é a mesma coisa para foto e para serviço: a lógica vive em
// lib/order.ts. Reexportada aqui para quem já importava daqui seguir igual.
export { moveItem, reindex, removeItem } from "@/lib/order";

/** Capa derivada = url da primeira foto (ou undefined se vazia). */
export function coverFromGallery(items: GalleryItem[]): string | undefined {
  return items[0]?.url;
}
