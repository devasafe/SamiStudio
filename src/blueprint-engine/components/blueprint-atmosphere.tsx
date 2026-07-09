"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color } from "three";
import { blueprintProgress } from "../core/progress-store";
import { phases } from "../timeline/phases";
import { phaseProgress } from "../utils/math";

// Fundo papel técnico → tom quente do render final.
const paper = new Color("#fafafa");
const warm = new Color("#f4ede3");

/** Atualiza o fundo da cena conforme a narrativa avança. */
export function BlueprintAtmosphere() {
  const { scene } = useThree();
  const background = useRef(new Color("#fafafa"));

  useFrame(() => {
    const warmth = phaseProgress(blueprintProgress.get(), phases.details.from, phases.render.to);
    background.current.copy(paper).lerp(warm, warmth);
    scene.background = background.current;
  });

  return null;
}
