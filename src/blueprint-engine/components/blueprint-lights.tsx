"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DirectionalLight, AmbientLight } from "three";
import { blueprintProgress } from "../core/progress-store";
import { lerp, phaseProgress } from "../utils/math";
import { phases } from "../timeline/phases";

// Luz técnica fria no blueprint → golden hour no render final (Docs/04).
const coolKey = new Color("#dfe6f0");
const warmKey = new Color("#ffc98a");
const coolFill = new Color("#f4f6f9");
const warmFill = new Color("#ffe9cf");

/**
 * Lighting System (Docs/17): a intensidade e a temperatura da luz
 * acompanham o progress (Docs/16).
 */
export function BlueprintLights() {
  const keyRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<AmbientLight>(null);
  const color = useRef(new Color());

  useFrame(() => {
    const progress = blueprintProgress.get();
    // A atmosfera muda principalmente na fase final da narrativa.
    const warmth = phaseProgress(progress, phases.details.from, phases.render.to);

    const key = keyRef.current;
    if (key) {
      key.intensity = lerp(0.7, 2.6, warmth);
      key.color.copy(color.current.copy(coolKey).lerp(warmKey, warmth));
    }

    const fill = fillRef.current;
    if (fill) {
      fill.intensity = lerp(0.55, 0.35, warmth);
      fill.color.copy(color.current.copy(coolFill).lerp(warmFill, warmth));
    }
  });

  return (
    <>
      {/* Key light entrando pela janela (parede esquerda). */}
      <directionalLight ref={keyRef} position={[-6, 4.5, 2.5]} intensity={0.7} />
      <ambientLight ref={fillRef} intensity={0.55} />
    </>
  );
}
