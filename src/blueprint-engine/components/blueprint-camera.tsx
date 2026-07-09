"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { blueprintProgress } from "../core/progress-store";
import { easeOutCubic } from "../utils/math";

// Percurso cinematográfico (Docs/04): plano técnico aberto → enquadramento final do render.
// Percurso: vista técnica alta → enquadramento final com o ambiente
// INTEIRO na tela (validado visualmente em 1440x900, fov 42).
const startPosition = new Vector3(7.5, 6, 9);
const endPosition = new Vector3(6.2, 3.4, 9.0);
const startTarget = new Vector3(0, 0.6, -0.6);
const endTarget = new Vector3(0, 0.9, -0.5);

/**
 * Camera System (Docs/17): movimento lento, suave e previsível,
 * controlado exclusivamente pelo progress.
 */
export function BlueprintCamera() {
  const target = useRef(new Vector3());
  const position = useRef(new Vector3());

  useFrame(({ camera }) => {
    const t = easeOutCubic(blueprintProgress.get());
    position.current.lerpVectors(startPosition, endPosition, t);
    target.current.lerpVectors(startTarget, endTarget, t);
    camera.position.copy(position.current);
    camera.lookAt(target.current);
  });

  return null;
}
