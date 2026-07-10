"use client";

import { useEffect, type RefObject } from "react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { blueprintProgress } from "../core/progress-store";

interface ScrollOptions {
  /** Quantidade de telas de scroll da experiência (slides). */
  screens?: number;
}

/**
 * Scroll System (Docs/18): o scroll é o único controlador da narrativa.
 * A zona fica fixa (pin) e o usuário "percorre" a experiência: o progress
 * alimenta a cena 3D e as transições de seção.
 * GSAP é carregado sob demanda para manter o bundle inicial leve (Docs/21).
 */
export function useBlueprintScroll(
  zoneRef: RefObject<HTMLElement | null>,
  enabled = true,
  { screens = 4 }: ScrollOptions = {}
): void {
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || !enabled) {
      return;
    }

    // Acessibilidade: com movimento reduzido, entrega o render final direto.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      blueprintProgress.set(1);
      return;
    }

    let trigger: ScrollTriggerType | undefined;
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) {
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      trigger = ScrollTrigger.create({
        trigger: zone,
        start: "top top",
        end: `+=${Math.max(1, screens - 1) * 100}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => blueprintProgress.set(self.progress),
      });
    })();

    return () => {
      cancelled = true;
      trigger?.kill();
      blueprintProgress.set(0);
    };
  }, [zoneRef, enabled, screens]);
}
