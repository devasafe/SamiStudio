"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { blueprintProgress } from "../core/progress-store";
import { FINALE } from "../timeline/phases";
import { phaseProgress } from "../utils/math";

/**
 * Câmera FIXA (decisão de performance, 2026-07-10): sem poses por seção
 * e sem parallax — o espetáculo é a casa se montando bloco a bloco.
 * Só o finale mexe no enquadramento (recentraliza para a foto real).
 */
const CAMERA_POSITION = new Vector3(21, 14, 21);
const CAMERA_TARGET = new Vector3(0, 1.9, 0);

/** Fração da largura que desloca a casa para o centro da metade direita. */
const RIGHT_SHIFT = 0.24;

export function BlueprintCamera() {
  // Limpa o view offset ao desmontar (câmera é compartilhada pelo canvas).
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    return () => {
      if (camera instanceof PerspectiveCamera) {
        camera.clearViewOffset();
      }
    };
  }, [camera]);

  useFrame(({ camera, size }) => {
    const finale = phaseProgress(blueprintProgress.get(), FINALE.from, FINALE.to);
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
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);
  });

  return null;
}
