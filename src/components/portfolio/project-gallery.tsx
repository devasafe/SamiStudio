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
