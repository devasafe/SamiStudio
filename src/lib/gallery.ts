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
