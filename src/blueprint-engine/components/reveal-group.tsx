"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Material } from "three";
import { blueprintProgress } from "../core/progress-store";
import { easeOutCubic, lerp, phaseProgress } from "../utils/math";

interface RevealGroupProps {
  /** Início do trecho do progresso global em que o grupo aparece. */
  from: number;
  /** Fim do trecho. */
  to: number;
  position?: [number, number, number];
  children: ReactNode;
}

/**
 * Revela um grupo de meshes de forma orgânica (Docs/16):
 * fade + leve crescimento, nunca aparição instantânea.
 */
export function RevealGroup({ from, to, position, children }: RevealGroupProps) {
  const ref = useRef<Group>(null);

  useFrame(() => {
    const group = ref.current;
    if (!group) {
      return;
    }
    const t = easeOutCubic(phaseProgress(blueprintProgress.get(), from, to));
    group.visible = t > 0.001;
    if (!group.visible) {
      return;
    }
    group.scale.setScalar(lerp(0.88, 1, t));
    group.traverse((object) => {
      if (object instanceof Mesh) {
        const material = object.material as Material & { opacity: number };
        material.transparent = t < 1;
        material.opacity = t;
      }
    });
  });

  return (
    <group ref={ref} position={position} visible={false}>
      {children}
    </group>
  );
}
