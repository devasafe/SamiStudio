"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scroll global (Lenis): momentum suave na roda e no toque. Desliga-se
 * para quem pede `prefers-reduced-motion`. Roda um único loop de rAF.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.2, wheelMultiplier: 1 });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
