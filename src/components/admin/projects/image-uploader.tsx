"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AdminApiError } from "@/components/admin/api-client";
import { CropDialog } from "@/components/admin/projects/crop-dialog";
import { uploadImage } from "@/components/admin/projects/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { safeImageUrl } from "@/lib/images";

interface ImageUploaderProps {
  label: string;
  value: string;
  /** Dimensão recomendada, mostrada sob o rótulo (ex.: "400 × 400 px (1:1)"). */
  hint?: string;
  onChange: (url: string) => void;
}

/** Imagem única: envia o original por padrão; "Recortar" abre o CropDialog. */
export function ImageUploader({ label, value, hint, onChange }: ImageUploaderProps) {
  // Só o que veio do upload (Cloudinary) pode ir para o next/image.
  const preview = safeImageUrl(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(file: File) {
    setBusy(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
      setCropSource(null);
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
        <div className="border-border relative w-full max-w-xs overflow-hidden rounded-md border">
          <Image
            src={preview}
            alt={label}
            width={320}
            height={240}
            sizes="320px"
            className="h-auto w-full"
          />
        </div>
      ) : null}

      {value && !preview ? (
        <p className="text-error text-sm">
          Valor atual não é uma imagem enviada pelo painel. Envie uma imagem para substituí-lo.
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Enviando..." : value ? "Trocar" : "Enviar imagem"}
        </Button>
        {value ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setCropSource(value)}>
              Recortar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Remover
            </Button>
          </>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void send(file);
          }
          event.target.value = "";
        }}
      />
      {error ? <p className="text-error text-sm">{error}</p> : null}

      <CropDialog
        source={cropSource}
        busy={busy}
        onCancel={() => setCropSource(null)}
        onCropped={(blob) => void send(new File([blob], "recorte.webp", { type: "image/webp" }))}
      />
    </div>
  );
}
