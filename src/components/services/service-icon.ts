import { Box, Building2, Camera, PencilRuler, Sparkles } from "@/components/icons";

const iconMap: Record<string, typeof Box> = {
  box: Box,
  camera: Camera,
  building: Building2,
  building2: Building2,
  "pencil-ruler": PencilRuler,
  pencilruler: PencilRuler,
  sparkles: Sparkles,
};

// Ordem padrão dos serviços do dicionário (Docs/01).
const defaultIcons = [Box, Camera, Building2, PencilRuler, Sparkles];

/** Resolve o ícone de um serviço: nome cadastrado no CMS ou fallback por posição. */
export function serviceIcon(name: string | undefined, index: number): typeof Box {
  if (name) {
    const found = iconMap[name.trim().toLowerCase()];
    if (found) {
      return found;
    }
  }
  return defaultIcons[index % defaultIcons.length] ?? Box;
}
