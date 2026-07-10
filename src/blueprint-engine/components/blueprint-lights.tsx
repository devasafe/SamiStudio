"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DirectionalLight, AmbientLight, PointLight } from "three";
import { blueprintPointer } from "../core/pointer-store";
import { blueprintProgress } from "../core/progress-store";
import { damp, lerp, phaseProgress } from "../utils/math";
import { ASSEMBLY_END, phases } from "../timeline/phases";

// Luz técnica fria no blueprint → golden hour no render final (Docs/04).
const coolKey = new Color("#dfe6f0");
const warmKey = new Color("#ffc98a");
const coolFill = new Color("#f4f6f9");
const warmFill = new Color("#ffe9cf");

/** O aquecimento continua um pouco além da montagem (sol "entrando"). */
const WARMTH_END = 0.3;

/**
 * Lighting System (Docs/17): temperatura acompanha o progress e,
 * no modo interativo, passar o mouse sobre o ambiente "acende" a
 * luminária e intensifica o golden hour (decisão de 2026-07-10).
 */
export function BlueprintLights() {
  const keyRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<AmbientLight>(null);
  const lampRef = useRef<PointLight>(null);
  const color = useRef(new Color());
  const glow = useRef(0);

  useFrame((_, delta) => {
    const progress = blueprintProgress.get();
    const warmth = phaseProgress(progress, phases.details.from, WARMTH_END);

    // Hover no lado do ambiente (direita da tela), só após a montagem.
    const pointer = blueprintPointer.get();
    const hoverTarget = progress >= ASSEMBLY_END && pointer.x > 0 ? 1 : 0;
    glow.current = damp(glow.current, hoverTarget, 5, delta);

    const key = keyRef.current;
    if (key) {
      key.intensity = lerp(0.7, 2.6, warmth) + glow.current * 0.5;
      key.color.copy(color.current.copy(coolKey).lerp(warmKey, warmth));
    }

    const fill = fillRef.current;
    if (fill) {
      fill.intensity = lerp(0.55, 0.35, warmth);
      fill.color.copy(color.current.copy(coolFill).lerp(warmFill, warmth));
    }

    const lamp = lampRef.current;
    if (lamp) {
      lamp.intensity = glow.current * 2.4;
    }
  });

  return (
    <>
      {/* Key light entrando pela janela (parede esquerda). */}
      <directionalLight ref={keyRef} position={[-6, 4.5, 2.5]} intensity={0.7} />
      <ambientLight ref={fillRef} intensity={0.55} />
      {/* Luminária de piso: acende no hover (posição do Details_Lamp). */}
      <pointLight
        ref={lampRef}
        position={[-1.6, 1.75, -2.3]}
        color="#ffb066"
        intensity={0}
        distance={7}
        decay={1.8}
      />
    </>
  );
}
