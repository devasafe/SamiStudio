"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AdminApiError } from "@/components/admin/api-client";
import { CropDialog } from "@/components/admin/projects/crop-dialog";
import { moveItem, reindex, removeItem } from "@/components/admin/projects/gallery-utils";
import { uploadImage } from "@/components/admin/projects/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { safeImageUrl } from "@/lib/images";
import type { GalleryItem } from "@/models/project";

interface GalleryUploaderProps {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

/**
 * Galeria do projeto: várias fotos no tamanho original (crop opcional),
 * reordenáveis por arrastar (com fallback ◄/►). A 1ª foto é a capa.
 */
export function GalleryUploader({ value, onChange }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  async function addFiles(files: FileList) {
    setBusy(true);
    setError(null);
    try {
      const uploaded: GalleryItem[] = [];
      for (const file of Array.from(files)) {
        const { url, width, height } = await uploadImage(file);
        uploaded.push({ url, width, height });
      }
      onChange(reindex([...value, ...uploaded]));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  async function replaceWithCrop(index: number, blob: Blob) {
    setBusy(true);
    try {
      const { url, width, height } = await uploadImage(
        new File([blob], "recorte.webp", { type: "image/webp" })
      );
      const next = value.slice();
      next[index] = { ...next[index], url, width, height };
      onChange(next);
      setCropIndex(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }

  function updateAlt(index: number, alt: string) {
    const next = value.slice();
    next[index] = { ...next[index], alt };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label>Fotos do projeto (a 1ª é a capa)</Label>
          <p className="text-muted-foreground text-xs">Recomendado: lado maior 1600 px</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Enviando..." : "Adicionar fotos"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) {
            void addFiles(event.target.files);
          }
          event.target.value = "";
        }}
      />
      {error ? <p className="text-error text-sm">{error}</p> : null}

      {value.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma foto ainda.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) {
                  onChange(moveItem(value, dragIndex, index));
                }
                setDragIndex(null);
              }}
              className="border-border bg-background space-y-2 rounded-md border p-2"
            >
              <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded">
                {safeImageUrl(item.url) ? (
                  <Image
                    src={item.url}
                    alt={item.alt ?? ""}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground absolute inset-0 flex items-center justify-center px-2 text-center text-[10px]">
                    Imagem inválida
                  </span>
                )}
                {index === 0 ? (
                  <span className="bg-foreground text-background absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px]">
                    Capa
                  </span>
                ) : null}
              </div>
              <input
                type="text"
                value={item.alt ?? ""}
                placeholder="Descrição (alt)"
                onChange={(event) => updateAlt(index, event.target.value)}
                className="border-border w-full rounded border px-2 py-1 text-xs"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    aria-label="Mover para a esquerda"
                    onClick={() => onChange(moveItem(value, index, index - 1))}
                  >
                    ◄
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === value.length - 1}
                    aria-label="Mover para a direita"
                    onClick={() => onChange(moveItem(value, index, index + 1))}
                  >
                    ►
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCropIndex(index)}
                  >
                    Recortar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-error"
                    onClick={() => onChange(removeItem(value, index))}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CropDialog
        source={cropIndex !== null ? value[cropIndex].url : null}
        busy={busy}
        onCancel={() => setCropIndex(null)}
        onCropped={(blob) => {
          if (cropIndex !== null) {
            void replaceWithCrop(cropIndex, blob);
          }
        }}
      />
    </div>
  );
}
