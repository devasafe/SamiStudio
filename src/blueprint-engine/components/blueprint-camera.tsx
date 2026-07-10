"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { blueprintPointer } from "../core/pointer-store";
import { blueprintProgress } from "../core/progress-store";
import { ASSEMBLY_END, FINALE } from "../timeline/phases";
import { clamp01, damp, easeOutCubic, phaseProgress } from "../utils/math";

/**
 * Percurso (decisão do cliente, 2026-07-10): começa perto do wireframe e
 * AFASTA enquanto o ambiente monta — completo, o objeto fica menor e
 * inteiro na tela. Depois da montagem, parallax sutil segue o mouse.
 */
// Poses derivadas da RefCam do Blender (ângulo do render real da Sami):
// o destino é o MESMO enquadramento da foto — base do crossfade final.
const startPosition = new Vector3(-0.3, 1.6, 2.6);
const endPosition = new Vector3(-2.3, 1.45, 7.6);
const startTarget = new Vector3(1.0, 1.2, -1.5);
const endTarget = new Vector3(1.3, 1.0, -2.0);

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

    // Finale: recentraliza o enquadramento e assenta a câmera para o
    // crossfade com a foto real (mesmo ângulo da RefCam).
    const finale = phaseProgress(progress, FINALE.from, FINALE.to);

    // Conforme monta, o enquadramento desliza para a metade direita;
    // no finale, volta ao centro para casar com a foto.
    if (camera instanceof PerspectiveCamera) {
      camera.setViewOffset(
        size.width,
        size.height,
        -t * (1 - finale) * size.width * RIGHT_SHIFT,
        0,
        size.width,
        size.height
      );
    }

    // Parallax só com o ambiente montado; congela no finale.
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
