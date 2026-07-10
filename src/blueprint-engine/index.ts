/**
 * API pública da Blueprint Engine (ADR-003/ADR-010).
 * O website conversa APENAS com o que é exportado aqui —
 * nunca com Three.js diretamente.
 */
export { BlueprintCanvas } from "./components/blueprint-canvas";
export { blueprintProgress } from "./core/progress-store";
export { useBlueprintProgress } from "./hooks/use-blueprint-progress";
export { useBlueprintScroll } from "./systems/scroll-system";
export { ASSEMBLY_END, FINALE, phases } from "./timeline/phases";
export { phaseProgress } from "./utils/math";
