"use client";

import { useState, type FormEvent } from "react";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "url" | "email" | "image";
  options?: FieldOption[];
  placeholder?: string;
  required?: boolean;
  /** Proporção do recorte para type "image" (ex.: 4/3). */
  aspect?: number;
}

export type EntityValues = Record<string, unknown>;

interface EntityFormProps {
  fields: FieldConfig[];
  initialValues?: EntityValues;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (values: EntityValues) => void;
}

/** Converte os valores do formulário em payload da API (vazio → omitido). */
function toPayload(fields: FieldConfig[], values: EntityValues): EntityValues {
  const payload: EntityValues = {};
  for (const field of fields) {
    const raw = values[field.name];
    if (field.type === "checkbox") {
      payload[field.name] = Boolean(raw);
      continue;
    }
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      continue;
    }
    payload[field.name] = field.type === "number" ? Number(raw) : String(raw).trim();
  }
  return payload;
}

/** Formulário genérico dirigido por configuração (Docs/12 — produtividade). */
export function EntityForm({
  fields,
  initialValues,
  submitLabel,
  busy,
  onSubmit,
}: EntityFormProps) {
  const [values, setValues] = useState<EntityValues>(initialValues ?? {});

  function setValue(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(toPayload(fields, values));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => {
        const id = `field-${field.name}`;
        const value = values[field.name];

        if (field.type === "image") {
          return (
            <ImageField
              key={field.name}
              label={field.label}
              value={String(value ?? "")}
              aspect={field.aspect ?? 4 / 3}
              onChange={(url) => setValue(field.name, url)}
            />
          );
        }

        if (field.type === "checkbox") {
          return (
            <div key={field.name} className="flex items-center gap-3">
              <input
                id={id}
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => setValue(field.name, event.target.checked)}
                className="accent-foreground size-4"
              />
              <Label htmlFor={id}>{field.label}</Label>
            </div>
          );
        }

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={id}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={id}
                value={String(value ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => setValue(field.name, event.target.value)}
                className="min-h-24"
              />
            ) : field.type === "select" ? (
              <select
                id={id}
                value={String(value ?? "")}
                required={field.required}
                onChange={(event) => setValue(field.name, event.target.value)}
                className="border-input h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none"
              >
                <option value="">—</option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={id}
                type={field.type === "number" ? "number" : field.type}
                value={String(value ?? "")}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => setValue(field.name, event.target.value)}
                className="h-10"
              />
            )}
          </div>
        );
      })}
      <Button type="submit" disabled={busy}>
        {busy ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
