"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { BlueprintScene } from "./blueprint-scene";

/**
 * Canvas da Blueprint Engine (Docs/17): ACES tone mapping,
 * DPR adaptativo para performance (Docs/21).
 */
export function BlueprintCanvas() {
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
