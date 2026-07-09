"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { blueprintProgress } from "../core/progress-store";
import { easeOutCubic } from "../utils/math";

// Percurso cinematográfico (Docs/04): plano técnico aberto → enquadramento final do render.
const startPosition = new Vector3(7.5, 6, 9);
const endPosition = new Vector3(3.4, 1.8, 5.2);
const startTarget = new Vector3(0, 0.6, -0.6);
const endTarget = new Vector3(-0.2, 1.1, -1.2);

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
