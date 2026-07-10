"use client";

import { Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { blueprintProgress } from "../core/progress-store";
import { ASSEMBLY_END } from "../timeline/phases";
import { BlueprintCamera } from "./blueprint-camera";
import { BlueprintLights } from "./blueprint-lights";
import { InteriorModel } from "./interior-model";
import { SceneEnvironment } from "./scene-environment";

/**
 * Congela o shadow map depois da montagem (performance): a sombra só
 * precisa re-renderizar enquanto os blocos aparecem.
 */
function ShadowFreeze() {
  const gl = useThree((state) => state.gl);
  useFrame(() => {
    const building = blueprintProgress.get() < ASSEMBLY_END + 0.02;
    if (gl.shadowMap.autoUpdate !== building) {
      gl.shadowMap.autoUpdate = building;
      gl.shadowMap.needsUpdate = true;
    }
  });
  return null;
}

/**
 * Composição da cena do Hero (Docs/17), formato vinheta (2026-07-10):
 * sem sala — o fundo do site é o ambiente. Um plano invisível
 * apara as sombras da mobília no "chão".
 */
export function BlueprintScene() {
  return (
    <>
      <ShadowFreeze />
      <SceneEnvironment />
      <BlueprintCamera />
      <BlueprintLights />
      {/* Apara-sombras: só a sombra é visível, o plano é transparente. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.13} />
      </mesh>
      <Suspense fallback={null}>
        <InteriorModel />
      </Suspense>
    </>
  );
}
