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
        // Foto real → next/image; sem URL → bloco placeholder (CMS vazio).
        const image = photo.url ? (
          <Image
            src={photo.url}
            alt={photo.alt}
            width={photo.width ?? 1200}
            height={photo.height ?? 900}
            sizes={sizes ?? DEFAULT_SIZES}
            className="block h-auto w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={photo.alt}
            className={`aspect-[4/3] w-full ${photo.placeholderClass ?? "bg-muted"}`}
          />
        );
        const key = `${photo.url || photo.alt}-${index}`;
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
