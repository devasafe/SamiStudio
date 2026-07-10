"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { blueprintPointer } from "../core/pointer-store";
import { BlueprintScene } from "./blueprint-scene";

/**
 * Canvas da Blueprint Engine (Docs/17): ACES tone mapping,
 * DPR adaptativo para performance (Docs/21).
 * O mouse alimenta o modo interativo (parallax + luzes) via pointer store.
 */
export function BlueprintCanvas() {
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      blueprintPointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 42, near: 0.1, far: 60, position: [7.5, 6, 9] }}
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}
      aria-hidden
    >
      <BlueprintScene />
    </Canvas>
  );
}
