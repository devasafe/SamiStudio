import Image from "next/image";
import Link from "next/link";
import type { MasonryPhoto } from "@/types/project";

interface LatestCarouselProps {
  photos: MasonryPhoto[];
  /** Texto do overlay no hover (i18n). */
  ctaLabel: string;
}

const ROWS = 3;
/** Ritmo lento e uniforme entre as fileiras (segundos por unidade de largura). */
const SECONDS_PER_UNIT = 7;

/**
 * Faixa infinita em 3 fileiras (só CSS): cada fileira desliza sozinha em loop
 * contínuo e lento, na mesma velocidade (a duração é proporcional à largura da
 * fileira). Passar o mouse escurece a foto, mostra "Ver projeto" e pausa
 * aquela fileira; clicar leva ao projeto. Full-bleed, sem molduras.
 */
export function LatestCarousel({ photos, ctaLabel }: LatestCarouselProps) {
  // Bin-packing pela largura (aspecto, já que a altura é fixa): as 3 fileiras
  // ficam com comprimentos parecidos.
  const rows: MasonryPhoto[][] = Array.from({ length: ROWS }, () => []);
  const rowWidths = new Array<number>(ROWS).fill(0);
  for (const photo of photos) {
    const ratio = photo.width && photo.height ? photo.width / photo.height : 3 / 2;
    let shortest = 0;
    for (let row = 1; row < ROWS; row += 1) {
      if (rowWidths[row] < rowWidths[shortest]) {
        shortest = row;
      }
    }
    rows[shortest].push(photo);
    rowWidths[shortest] += ratio;
  }

  return (
    <div className="flex flex-col">
      {rows.map((row, rowIndex) => {
        const duration = Math.max(30, rowWidths[rowIndex] * SECONDS_PER_UNIT);
        const loop = [...row, ...row]; // duplicado 2x para o loop -50%
        return (
          <div key={rowIndex} className="group/row overflow-hidden">
            <div
              className="flex w-max will-change-transform group-hover/row:[animation-play-state:paused] motion-reduce:[animation:none]"
              style={{ animation: `marquee-left ${duration}s linear infinite` }}
            >
              {loop.map((photo, index) => {
                const ratio = photo.width && photo.height ? photo.width / photo.height : 3 / 2;
                const isClone = index >= row.length;
                return (
                  <Link
                    key={`${photo.url}-${rowIndex}-${index}`}
                    href={photo.href ?? "#"}
                    aria-hidden={isClone}
                    tabIndex={isClone ? -1 : undefined}
                    className="group/item relative block h-[clamp(7.5rem,14vw,11rem)] shrink-0"
                    style={{ aspectRatio: ratio }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141009]/0 opacity-0 transition-all duration-300 group-hover/item:bg-[#141009]/65 group-hover/item:opacity-100">
                      <span className="text-caption inline-flex items-center gap-1.5 tracking-[0.18em] text-[#f2ece0] uppercase">
                        {ctaLabel}
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
