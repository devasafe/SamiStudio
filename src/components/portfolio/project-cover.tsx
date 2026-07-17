"use client";

import Image from "next/image";
import { useState } from "react";
import { PhotoLightbox } from "@/components/portfolio/photo-lightbox";
import { Maximize2 } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { MasonryPhoto } from "@/types/project";

interface ProjectCoverProps {
  /** A capa é a primeira; as demais deixam navegar sem sair do lightbox. */
  photos: MasonryPhoto[];
  className?: string;
  labels: { close: string; prev: string; next: string; zoom: string };
}

/**
 * Capa da aba "Visão geral": clicar amplia, como na galeria.
 *
 * O lightbox recebe a capa **e** o resto da galeria, então quem abriu pela capa
 * pode seguir para as outras fotos com as setas em vez de fechar e trocar de aba.
 */
export function ProjectCover({ photos, className, labels }: ProjectCoverProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const cover = photos[0];

  if (!cover) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenIndex(0)}
        aria-label={labels.zoom}
        className={cn(
          "group relative block aspect-[21/9] w-full cursor-zoom-in overflow-hidden",
          className
        )}
      >
        <Image
          src={cover.url}
          alt={cover.alt}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          priority
        />
        <span className="absolute right-4 bottom-4 flex items-center gap-2 bg-[#141009]/70 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-4 text-[#f2ece0]" aria-hidden />
          <span className="text-caption text-[#f2ece0]">{labels.zoom}</span>
        </span>
      </button>

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
