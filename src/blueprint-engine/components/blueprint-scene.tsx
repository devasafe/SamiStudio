"use client";

import { Suspense } from "react";
import { BlueprintCamera } from "./blueprint-camera";
import { BlueprintLights } from "./blueprint-lights";
import { InteriorModel } from "./interior-model";
import { SceneEnvironment } from "./scene-environment";

/**
 * Composição da cena do Hero (Docs/17), formato vinheta (2026-07-10):
 * sem sala — o fundo do site é o ambiente. Um plano invisível
 * apara as sombras da mobília no "chão".
 */
export function BlueprintScene() {
  return (
    <>
      <SceneEnvironment />
      <BlueprintCamera />
      <BlueprintLights />
      {/* Apara-sombras: só a sombra é visível, o plano é transparente. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.18} />
      </mesh>
      <Suspense fallback={null}>
        <InteriorModel />
      </Suspense>
    </>
  );
}
