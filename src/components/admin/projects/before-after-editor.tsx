"use client";

import { ImageUploader } from "@/components/admin/projects/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { moveItem, removeItem } from "@/lib/order";
import type { BeforeAfterItem } from "@/models/project";

/** Teto de pares. O site mostra a tira sem rolagem, e foi o combinado. */
export const MAX_PAIRS = 5;

interface BeforeAfterEditorProps {
  value: BeforeAfterItem[];
  onChange: (items: BeforeAfterItem[]) => void;
}

/**
 * Os pares da transformação. Cada card tem a foto de antes, a de depois e uma
 * legenda; o site mostra os dois no comparador de arrastar.
 *
 * Um par só entra na lista quando tem as duas fotos — meio par não compara
 * nada, e o site precisaria inventar o que mostrar do outro lado.
 */
export function BeforeAfterEditor({ value, onChange }: BeforeAfterEditorProps) {
  const full = value.length >= MAX_PAIRS;

  function update(index: number, patch: Partial<BeforeAfterItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Antes e depois</Label>
        <span className="text-muted-foreground text-xs">
          {value.length} de {MAX_PAIRS}
        </span>
      </div>

      {value.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum par ainda. Cada par vira um comparador de arrastar na página do projeto.
        </p>
      ) : null}

      <ul className="space-y-4">
        {value.map((item, index) => (
          <li key={index} className="border-border space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Par {index + 1}</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(value, index, index - 1))}
                  aria-label={`Subir o par ${index + 1}`}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === value.length - 1}
                  onClick={() => onChange(moveItem(value, index, index + 1))}
                  aria-label={`Descer o par ${index + 1}`}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onChange(removeItem(value, index))}
                  aria-label={`Remover o par ${index + 1}`}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploader
                label="Antes"
                value={item.before}
                onChange={(url) => update(index, { before: url })}
              />
              <ImageUploader
                label="Depois"
                value={item.after}
                onChange={(url) => update(index, { after: url })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`ba-label-${index}`}>Legenda</Label>
              <Input
                id={`ba-label-${index}`}
                value={item.label ?? ""}
                onChange={(event) => update(index, { label: event.target.value })}
                placeholder="ex.: Fachada"
              />
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="outline"
        disabled={full}
        onClick={() => onChange([...value, { before: "", after: "", order: value.length }])}
      >
        {full ? `Máximo de ${MAX_PAIRS} pares` : "Adicionar par"}
      </Button>
    </div>
  );
}
