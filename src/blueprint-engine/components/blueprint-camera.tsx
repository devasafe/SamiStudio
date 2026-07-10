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
const POSES: Pose[] = [
  // Hero (atrás da imagem estática)
  { position: new Vector3(9.5, 4.0, 11.5), target: new Vector3(0, 0.6, 0) },
  // Sobre — 3/4 direita
  { position: new Vector3(8.5, 3.4, 10.5), target: new Vector3(0, 0.6, 0) },
  // Serviços — lateral esquerda
  { position: new Vector3(-9.5, 3.0, 8.0), target: new Vector3(0, 0.5, 0) },
  // Processo — vista alta (eco do render top-down do hero)
  { position: new Vector3(4.0, 11.0, 5.0), target: new Vector3(0, 0, 0) },
  // Portfólio — frontal baixa
  { position: new Vector3(0.8, 1.8, 11.0), target: new Vector3(0, 0.7, 0) },
  // FAQ — traseira
  { position: new Vector3(-8.0, 5.0, -9.0), target: new Vector3(0, 0.4, 0) },
  // CTA — retorno suave (a foto real cobre a cena no finale)
  { position: new Vector3(9.0, 4.5, 10.5), target: new Vector3(0, 0.5, 0) },
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
