"use client";

import { useEffect, type RefObject } from "react";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { blueprintProgress } from "../core/progress-store";

/**
 * Scroll System (Docs/18): o scroll é o único controlador da narrativa.
 * Fixa (pin) a seção do Hero e converte o scroll em progress (scrub).
 * GSAP é carregado sob demanda — só quando a narrativa 3D está ativa —
 * para manter o bundle inicial leve (Docs/21).
 */
export function useBlueprintScroll(
  sectionRef: RefObject<HTMLElement | null>,
  enabled = true
): void {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled) {
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
        trigger: section,
        start: "top top",
        end: "+=300%",
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
  }, [sectionRef, enabled]);
}
