"use client";

import { BlueprintAtmosphere } from "./blueprint-atmosphere";
import { BlueprintCamera } from "./blueprint-camera";
import { BlueprintLights } from "./blueprint-lights";
import { TempInterior } from "./temp-interior";

/** Composição da cena do Hero (Docs/17). */
export function BlueprintScene() {
  return (
    <>
      <BlueprintAtmosphere />
      <BlueprintCamera />
      <BlueprintLights />
      <TempInterior />
    </>
  );
}
