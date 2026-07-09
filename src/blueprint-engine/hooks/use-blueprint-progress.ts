"use client";

import { useSyncExternalStore } from "react";
import { blueprintProgress } from "../core/progress-store";

/** Progresso da narrativa para componentes React (UI). */
export function useBlueprintProgress(): number {
  return useSyncExternalStore(
    (listener) => blueprintProgress.subscribe(listener),
    () => blueprintProgress.get(),
    () => 0
  );
}
