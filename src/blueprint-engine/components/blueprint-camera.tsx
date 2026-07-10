"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { blueprintPointer } from "../core/pointer-store";
import { blueprintProgress } from "../core/progress-store";
import { ASSEMBLY_END, FINALE } from "../timeline/phases";
import { clamp01, damp, phaseProgress } from "../utils/math";

interface Pose {
  position: Vector3;
  target: Vector3;
}

/**
 * Uma perspectiva da vinheta por seção (decisão do cliente, 2026-07-10):
 * o scroll conduz a câmera de pose em pose, mostrando a mobília de
 * ângulos diferentes a cada slide.
 */
// Estilo maquete/diorama (referência ICG, 2026-07-10): 3/4 altas com
// lente longa (fov 30), sensação quase isométrica.
const POSES: Pose[] = [
  // Hero (atrás da imagem estática)
  { position: new Vector3(14, 10, 14), target: new Vector3(0, 0.5, 0) },
  // Sobre — 3/4 direita alta
  { position: new Vector3(13, 9, 13), target: new Vector3(0, 0.5, 0) },
  // Serviços — 3/4 esquerda
  { position: new Vector3(-14, 8, 11), target: new Vector3(0, 0.4, 0) },
  // Processo — quase top-down (eco do render do hero)
  { position: new Vector3(7, 17, 8), target: new Vector3(0, 0, 0) },
  // Portfólio — frontal ao nível dos olhos da maquete
  { position: new Vector3(2, 4, 18), target: new Vector3(0, 0.8, 0) },
  // FAQ — traseira alta
  { position: new Vector3(-12, 10, -13), target: new Vector3(0, 0.3, 0) },
  // CTA — retorno suave (a foto real cobre a cena no finale)
  { position: new Vector3(13, 9.5, 13), target: new Vector3(0, 0.5, 0) },
];

// Amplitude do parallax (movimento máximo com o mouse nos cantos).
const PARALLAX_POS = 0.55;
const PARALLAX_TARGET = 0.25;

/** Fração da largura que desloca a vinheta para o centro da metade direita. */
const RIGHT_SHIFT = 0.24;

/** Suaviza a transição dentro de cada trecho entre poses. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function BlueprintCamera() {
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const parallaxX = useRef(0);
  const parallaxY = useRef(0);

  // Limpa o view offset ao desmontar (câmera é compartilhada pelo canvas).
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    return () => {
      if (camera instanceof PerspectiveCamera) {
        camera.clearViewOffset();
      }
    };
  }, [camera]);

  useFrame(({ camera, size }, delta) => {
    const progress = blueprintProgress.get();

    // Pose por seção, com easing por trecho.
    const f = clamp01(progress) * (POSES.length - 1);
    const index = Math.min(POSES.length - 2, Math.floor(f));
    const t = smoothstep(f - index);
    position.current.lerpVectors(POSES[index].position, POSES[index + 1].position, t);
    target.current.lerpVectors(POSES[index].target, POSES[index + 1].target, t);

    // Finale: recentraliza o enquadramento para o crossfade com a foto.
    const finale = phaseProgress(progress, FINALE.from, FINALE.to);

    if (camera instanceof PerspectiveCamera) {
      camera.setViewOffset(
        size.width,
        size.height,
        -(1 - finale) * size.width * RIGHT_SHIFT,
        0,
        size.width,
        size.height
      );
    }

    // Parallax só com a vinheta montada; congela no finale.
    const pointer = blueprintPointer.get();
    const interactive = progress >= ASSEMBLY_END ? 1 - finale : 0;
    parallaxX.current = damp(parallaxX.current, pointer.x * interactive, 4, delta);
    parallaxY.current = damp(parallaxY.current, pointer.y * interactive, 4, delta);

    position.current.x += parallaxX.current * PARALLAX_POS;
    position.current.y += -parallaxY.current * PARALLAX_POS * 0.5;
    target.current.x += parallaxX.current * PARALLAX_TARGET;
    target.current.y += -parallaxY.current * PARALLAX_TARGET * 0.4;

    camera.position.copy(position.current);
    camera.lookAt(target.current);
  });

  return null;
}
