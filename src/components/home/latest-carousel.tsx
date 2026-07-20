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

/* A altura do item é `clamp(7.5rem, 14vw, 11rem)`: trava em 120px até 857px de
 * viewport, acompanha 14vw entre 857px e 1257px, e trava em 176px daí pra cima. */
const MIN_H = 120;
const MAX_H = 176;
const FLOOR_VW = 857;
const CEIL_VW = 1257;

/**
 * Largura real que o item ocupa, declarada para o browser escolher no `srcset`.
 *
 * Como a altura é fixa e a largura sai do aspecto, cada foto tem um `sizes`
 * próprio. Antes havia um `30vw/50vw` fixo aqui: o browser acreditava e baixava
 * um 640w para exibir a ~100-300px — sozinho, esse engano respondia pela maior
 * parte dos 684 KB de desperdício apontados pelo Lighthouse.
 */
function sizesFor(ratio: number): string {
  return [
    `(max-width: ${FLOOR_VW}px) ${Math.ceil(MIN_H * ratio)}px`,
    `(max-width: ${CEIL_VW}px) ${(14 * ratio).toFixed(2)}vw`,
    `${Math.ceil(MAX_H * ratio)}px`,
  ].join(", ");
}

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
                    // Nome acessível único por item: o overlay diz só "Ver projeto",
                    // e vários links com o mesmo texto apontando para destinos
                    // diferentes confundem quem navega por leitor de tela.
                    aria-label={`${ctaLabel}: ${photo.alt}`}
                    className="group/item relative block h-[clamp(7.5rem,14vw,11rem)] shrink-0"
                    style={{ aspectRatio: ratio }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes={sizesFor(ratio)}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141009]/0 opacity-0 transition-all duration-300 group-hover/item:bg-[#141009]/65 group-hover/item:opacity-100">
                      <span
                        className="text-caption inline-flex items-center gap-1.5 tracking-[0.18em] text-[#f2ece0] uppercase"
                        data-cms="text:sections.latest.viewProject"
                      >
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
