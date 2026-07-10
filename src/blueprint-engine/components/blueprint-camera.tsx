"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { blueprintPointer } from "../core/pointer-store";
import { blueprintProgress } from "../core/progress-store";
import { ASSEMBLY_END } from "../timeline/phases";
import { clamp01, damp, easeOutCubic } from "../utils/math";

/**
 * Percurso (decisão do cliente, 2026-07-10): começa perto do wireframe e
 * AFASTA enquanto o ambiente monta — completo, o objeto fica menor e
 * inteiro na tela. Depois da montagem, parallax sutil segue o mouse.
 */
const startPosition = new Vector3(4.6, 2.2, 6.6);
const endPosition = new Vector3(7.0, 3.9, 10.2);
const startTarget = new Vector3(-0.3, 1.0, -0.8);
const endTarget = new Vector3(0, 0.9, -0.5);

// Amplitude do parallax (movimento máximo com o mouse nos cantos).
const PARALLAX_POS = 0.55;
const PARALLAX_TARGET = 0.25;

/** Fração da largura que desloca o ambiente para o centro da metade direita. */
const RIGHT_SHIFT = 0.24;

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
    const t = easeOutCubic(clamp01(progress / ASSEMBLY_END));
    position.current.lerpVectors(startPosition, endPosition, t);
    target.current.lerpVectors(startTarget, endTarget, t);

    // Conforme monta, o enquadramento desliza para a metade direita
    // (offset negativo move o conteúdo da cena para a direita da tela).
    if (camera instanceof PerspectiveCamera) {
      camera.setViewOffset(
        size.width,
        size.height,
        -t * size.width * RIGHT_SHIFT,
        0,
        size.width,
        size.height
      );
    }

    // Parallax só com o ambiente montado, com amortecimento suave.
    const pointer = blueprintPointer.get();
    const interactive = progress >= ASSEMBLY_END ? 1 : 0;
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
