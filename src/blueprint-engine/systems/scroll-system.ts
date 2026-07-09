"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { blueprintProgress } from "../core/progress-store";

/**
 * Scroll System (Docs/18): o scroll é o único controlador da narrativa.
 * Fixa (pin) a seção do Hero e converte o scroll em progress (scrub).
 */
export function useBlueprintScroll(sectionRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    // Acessibilidade: com movimento reduzido, entrega o render final direto.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      blueprintProgress.set(1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%",
      pin: true,
      scrub: true,
      onUpdate: (self) => blueprintProgress.set(self.progress),
    });

    return () => {
      trigger.kill();
      blueprintProgress.set(0);
    };
  }, [sectionRef]);
}
