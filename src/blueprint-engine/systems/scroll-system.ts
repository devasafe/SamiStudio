"use client";

import { useEffect, type RefObject } from "react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { blueprintProgress } from "../core/progress-store";

/**
 * Scroll System (Docs/18): o scroll é o único controlador da narrativa.
 * O progress avança conforme o usuário percorre a zona de narrativa
 * (hero + seções com o 3D fixo), sem pin — o conteúdo flui ao lado.
 * GSAP é carregado sob demanda para manter o bundle inicial leve (Docs/21).
 */
export function useBlueprintScroll(zoneRef: RefObject<HTMLElement | null>, enabled = true): void {
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
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => blueprintProgress.set(self.progress),
      });
    })();

    return () => {
      cancelled = true;
      trigger?.kill();
      blueprintProgress.set(0);
    };
  }, [zoneRef, enabled]);
}
