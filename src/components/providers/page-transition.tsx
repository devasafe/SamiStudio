"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Entrada de página: o conteúdo aparece num fade curto a cada navegação.
 *
 * A `key` no pathname é o que dispara a animação — sem ela o React reaproveita
 * o nó e a animação só rodaria no primeiro carregamento. Envolve apenas o
 * conteúdo: navbar e rodapé ficam fora, então a moldura do site não pisca.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    // flex-1 repassa para o <main> a altura que o body distribui: sem isso o
    // rodapé sobe em páginas curtas.
    <div key={pathname} className="page-in flex flex-1 flex-col">
      {children}
    </div>
  );
}
