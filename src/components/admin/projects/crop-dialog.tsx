"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ASPECTS = [
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

/** Recorta a área escolhida num canvas e devolve WebP. Aceita URL remota (Cloudinary). */
async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao ler a imagem."));
    img.src = imageSrc;
  });

  const MAX_WIDTH = 1920;
  const scale = Math.min(1, MAX_WIDTH / area.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponível.");
  }
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao recortar."))),
      "image/webp",
      0.85
    );
  });
}

interface CropDialogProps {
  /** dataURL ou URL da imagem a recortar; `null` = fechado. */
  source: string | null;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
  busy?: boolean;
}

export function CropDialog({ source, onCancel, onCropped, busy }: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number>(4 / 3);
  const [area, setArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function handleConfirm() {
    if (!source || !area) {
      return;
    }
    try {
      onCropped(await cropToBlob(source, area));
    } catch {
      setError("Não foi possível recortar esta imagem.");
    }
  }

  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recortar imagem</DialogTitle>
        </DialogHeader>
        <div className="bg-muted relative h-96 w-full overflow-hidden rounded-md">
          {source ? (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs">Proporção</Label>
          {ASPECTS.map((option) => (
            <Button
              key={option.label}
              type="button"
              size="sm"
              variant={aspect === option.value ? "default" : "outline"}
              onClick={() => setAspect(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="crop-zoom" className="text-xs">
            Zoom
          </Label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="accent-foreground w-full"
          />
        </div>
        {error ? <p className="text-error text-sm">{error}</p> : null}
        <Button onClick={handleConfirm} disabled={busy || !area}>
          {busy ? "Enviando..." : "Cortar e usar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
