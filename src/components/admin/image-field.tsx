"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { safeImageUrl } from "@/lib/images";

interface ImageFieldProps {
  label: string;
  value: string;
  /** Proporção do frontend (ex.: 4/3 para capas de projeto). */
  aspect: number;
  /** Dimensão recomendada, mostrada sob o rótulo (ex.: "1200 × 1500 px (4:5)"). */
  hint?: string;
  onChange: (url: string) => void;
}

/** Recorta a área escolhida em um canvas e devolve como WebP. */
async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
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

interface MediaResponse {
  url: string;
}

/**
 * Campo de imagem do painel (Docs/12): upload com recorte na
 * proporção exibida no site, enviado ao Cloudinary via API.
 */
export function ImageField({ label, value, aspect, hint, onChange }: ImageFieldProps) {
  // Só o que veio do upload (Cloudinary) pode ir para o next/image.
  const preview = safeImageUrl(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  function pickFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSource(String(reader.result));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!source || !area) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blob = await cropToBlob(source, area);
      const formData = new FormData();
      formData.append("file", new File([blob], "imagem.webp", { type: "image/webp" }));
      const { data } = await api<MediaResponse>("/upload/image", {
        method: "POST",
        body: formData,
      });
      onChange(data.url);
      setSource(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint ? <p className="text-muted-foreground -mt-1 text-xs">Recomendado: {hint}</p> : null}

      {preview ? (
        <div
          className="border-border relative overflow-hidden rounded-md border"
          style={{ aspectRatio: aspect, maxWidth: 320 }}
        >
          <Image src={preview} alt={label} fill sizes="320px" className="object-cover" />
        </div>
      ) : null}

      {/* Valor salvo que não é uma imagem do upload (ex.: link de página colado
          no banco): avisa em vez de derrubar a página no next/image. */}
      {value && !preview ? (
        <p className="text-error text-sm">
          Valor atual não é uma imagem enviada pelo painel. Envie uma imagem para substituí-lo.
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {value ? "Trocar imagem" : "Enviar imagem"}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remover
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />
      {error ? <p className="text-error text-sm">{error}</p> : null}

      <Dialog open={source !== null} onOpenChange={(open) => !open && setSource(null)}>
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
          <div className="flex items-center gap-3">
            <Label htmlFor="zoom" className="text-xs">
              Zoom
            </Label>
            <input
              id="zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="accent-foreground w-full"
            />
          </div>
          <Button onClick={handleUpload} disabled={busy}>
            {busy ? "Enviando..." : "Cortar e enviar"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
