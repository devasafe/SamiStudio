"use client";

import { Suspense } from "react";
import { BlueprintAtmosphere } from "./blueprint-atmosphere";
import { BlueprintCamera } from "./blueprint-camera";
import { BlueprintLights } from "./blueprint-lights";
import { InteriorModel } from "./interior-model";

/**
 * Composição da cena do Hero (Docs/17).
 * O modelo vem do pipeline Blender → GLB; enquanto carrega,
 * a atmosfera e as luzes já preenchem o quadro.
 */
export function BlueprintScene() {
  return (
    <>
      <BlueprintAtmosphere />
      <BlueprintCamera />
      <BlueprintLights />
      <Suspense fallback={null}>
        <InteriorModel />
      </Suspense>
    </>
  );
}
