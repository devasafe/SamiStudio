"use client";

import { useEffect, useRef } from "react";

/**
 * Atmosfera de fundo: manchas escuras (preto / cinza) bem desfocadas, dando
 * profundidade/sombra sutil ao fundo claro, com um parallax leve no scroll.
 * Fica atrás de todo o conteúdo (-z-10); seções de fundo opaco a cobrem.
 * Estática para quem pede `prefers-reduced-motion`.
 */
export function AmbientBackground() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const layer = layerRef.current;
    if (!layer) {
      return;
    }
    let ticking = false;
    const update = () => {
      layer.style.transform = `translate3d(0, ${window.scrollY * 0.12}px, 0)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div ref={layerRef} className="absolute inset-0 will-change-transform">
        <div className="absolute top-[6%] left-[4%] h-[45rem] w-[45rem] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.20),transparent_65%)] blur-3xl" />
        <div className="absolute top-[40%] right-[2%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(38,38,38,0.17),transparent_66%)] blur-3xl" />
        <div className="absolute top-[72%] left-[26%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.14),transparent_68%)] blur-3xl" />
      </div>
    </div>
  );
}
