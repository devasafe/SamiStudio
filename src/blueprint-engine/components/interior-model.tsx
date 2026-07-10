"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
} from "three";
import { blueprintPointer } from "../core/pointer-store";
import { blueprintProgress } from "../core/progress-store";
import { ASSEMBLY_END, phases } from "../timeline/phases";
import { damp, easeOutCubic, lerp, phaseProgress } from "../utils/math";

/**
 * Modelo do Hero carregado via pipeline Blender → GLB (Docs/15, ADR-013).
 *
 * Convenção do pipeline: objetos nomeados por fase da narrativa —
 * `Shell_*` (casca), `Furniture_*` (mobiliário), `Details_*` (detalhes).
 * O modelo real da Sami (FASE 9) só precisa seguir a mesma convenção.
 */
const MODEL_URL = "/models/hero-interior.glb";

interface RevealEntry {
  node: Object3D;
  materials: (Material & { opacity: number })[];
  from: number;
  to: number;
  /** Casca não escala (paredes crescem estranho); mobiliário/detalhes sim. */
  scales: boolean;
}

function bucketPhase(name: string) {
  if (name.startsWith("Shell_")) return { phase: phases.shell, scales: false };
  if (name.startsWith("Furniture_")) return { phase: phases.furniture, scales: true };
  if (name.startsWith("Details_")) return { phase: phases.details, scales: true };
  return null;
}

/** Distribui os itens de um grupo em janelas escalonadas dentro da fase. */
function staggered(index: number, count: number, phase: { from: number; to: number }) {
  const span = phase.to - phase.from;
  const step = count > 1 ? (span * 0.5) / (count - 1) : 0;
  const from = phase.from + step * index;
  return { from, to: Math.min(from + span * 0.5, phase.to) };
}

export function InteriorModel() {
  const { scene } = useGLTF(MODEL_URL);
  const lampGlow = useRef(0);

  const { entries, wireMaterial, wires, lampMaterials } = useMemo(() => {
    const buckets = new Map<string, Object3D[]>();
    for (const node of scene.children) {
      const bucket = bucketPhase(node.name);
      if (bucket) {
        const key = node.name.split("_")[0];
        buckets.set(key, [...(buckets.get(key) ?? []), node]);
      }
    }

    const entries: RevealEntry[] = [];
    for (const nodes of buckets.values()) {
      nodes.forEach((node, index) => {
        const bucket = bucketPhase(node.name);
        if (!bucket) {
          return;
        }
        // Materiais do GLB são compartilhados entre meshes: clona para
        // animar opacidade individualmente.
        const materials: RevealEntry["materials"] = [];
        node.traverse((child) => {
          if (child instanceof Mesh) {
            // Vinheta sem sala: a mobília projeta sombra no apara-sombras.
            child.castShadow = true;
            child.receiveShadow = true;
            const cloned = (child.material as Material).clone() as Material & { opacity: number };
            child.material = cloned;
            materials.push(cloned);
          }
        });
        const window = bucket.scales ? staggered(index, nodes.length, bucket.phase) : bucket.phase;
        entries.push({ node, materials, ...window, scales: bucket.scales });
      });
    }

    // Wireframe técnico da casca (fase blueprint), dissolvido no furniture.
    const wireMaterial = new LineBasicMaterial({
      color: "#8a929e",
      transparent: true,
      opacity: 1,
    });
    const wires = new Group();
    for (const node of scene.children) {
      if (!node.name.startsWith("Shell_")) {
        continue;
      }
      node.traverse((child) => {
        if (child instanceof Mesh) {
          const edges = new LineSegments(new EdgesGeometry(child.geometry), wireMaterial);
          child.updateWorldMatrix(true, false);
          edges.applyMatrix4(child.matrixWorld);
          wires.add(edges);
        }
      });
    }

    // Cúpula da luminária: ganha brilho próprio no hover (modo interativo).
    const lampMaterials: MeshStandardMaterial[] = [];
    for (const entry of entries) {
      for (const material of entry.materials) {
        if (material.name.startsWith("LampShade") && material instanceof MeshStandardMaterial) {
          material.emissive.set("#ffb066");
          material.emissiveIntensity = 0;
          lampMaterials.push(material);
        }
      }
    }

    return { entries, wireMaterial, wires, lampMaterials };
  }, [scene]);

  // Descarta as EdgesGeometry ao desmontar.
  useEffect(() => {
    return () => {
      wires.traverse((child) => {
        if (child instanceof LineSegments) {
          child.geometry.dispose();
        }
      });
      wireMaterial.dispose();
    };
  }, [wires, wireMaterial]);

  useFrame((_, delta) => {
    const progress = blueprintProgress.get();

    wireMaterial.opacity = 1 - phaseProgress(progress, phases.furniture.from, phases.furniture.to);
    wires.visible = wireMaterial.opacity > 0.001;

    // Luminária acesa enquanto o mouse estiver sobre o ambiente.
    const hoverTarget = progress >= ASSEMBLY_END && blueprintPointer.get().x > 0 ? 1 : 0;
    lampGlow.current = damp(lampGlow.current, hoverTarget, 5, delta);
    for (const material of lampMaterials) {
      material.emissiveIntensity = lampGlow.current * 1.4;
    }

    for (const entry of entries) {
      const t = easeOutCubic(phaseProgress(progress, entry.from, entry.to));
      entry.node.visible = t > 0.001;
      if (!entry.node.visible) {
        continue;
      }
      if (entry.scales) {
        entry.node.scale.setScalar(lerp(0.85, 1, t));
      }
      for (const material of entry.materials) {
        material.transparent = t < 1;
        material.opacity = t;
      }
    }
  });

  return (
    <group>
      <primitive object={scene} />
      <primitive object={wires} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
