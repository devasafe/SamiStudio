"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ImageUploader } from "@/components/admin/projects/image-uploader";
import { Star } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TestimonialFormValues {
  name: string;
  company: string;
  role: string;
  photo: string;
  text: string;
  rating: string;
  order: string;
  featured: boolean;
}

const EMPTY: TestimonialFormValues = {
  name: "",
  company: "",
  role: "",
  photo: "",
  text: "",
  rating: "",
  order: "",
  featured: false,
};

interface TestimonialFormProps {
  initial?: Partial<TestimonialFormValues>;
  /** Presente = edição; ausente = criação. */
  testimonialId?: string;
}

export function TestimonialForm({ initial, testimonialId }: TestimonialFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TestimonialFormValues>({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof TestimonialFormValues>(key: K, value: TestimonialFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: values.name.trim(),
        company: values.company.trim() || undefined,
        role: values.role.trim() || undefined,
        photo: values.photo || undefined,
        text: values.text.trim(),
        rating: values.rating ? Number(values.rating) : undefined,
        order: values.order ? Number(values.order) : undefined,
        featured: values.featured,
      };
      if (testimonialId) {
        await api(`/testimonials/${testimonialId}`, { method: "PATCH", json: payload });
      } else {
        await api("/testimonials", { method: "POST", json: payload });
      }
      router.push("/admin/depoimentos");
      router.refresh();
    } catch (err) {
      // Mantém o que foi digitado: refazer o depoimento inteiro por um erro de
      // rede é o tipo de coisa que faz desistir.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
      setBusy(false);
    }
  }

  const rating = Number(values.rating) || 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={values.name}
            required
            onChange={(event) => set("name", event.target.value)}
            placeholder="ex.: Amanda Ferreira"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={values.company}
            onChange={(event) => set("company", event.target.value)}
            placeholder="ex.: Studio Aurora"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Cargo</Label>
        <Input
          id="role"
          value={values.role}
          onChange={(event) => set("role", event.target.value)}
          placeholder="ex.: Arquiteta"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Depoimento</Label>
        <Textarea
          id="text"
          value={values.text}
          required
          onChange={(event) => set("text", event.target.value)}
          className="min-h-32"
          placeholder="O que o cliente falou, nas palavras dele."
        />
      </div>

      {/* Upload, não link: o site só aceita imagem do Cloudinary, e uma URL de
          fora quebra a página com "Invalid src prop". */}
      <ImageUploader
        label="Foto do cliente"
        hint="160 × 160 px (1:1)"
        value={values.photo}
        onChange={(url) => set("photo", url)}
      />
      <p className="text-muted-foreground -mt-4 text-xs">
        Sem foto, o site mostra as iniciais do nome num círculo.
      </p>

      <div className="space-y-2">
        <Label>Nota</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => set("rating", rating === value ? "" : String(value))}
              aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
              aria-pressed={rating === value}
              className="p-1"
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  value <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                )}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
          ))}
          {rating > 0 ? (
            <button
              type="button"
              onClick={() => set("rating", "")}
              className="text-muted-foreground hover:text-foreground ml-2 text-xs underline"
            >
              limpar
            </button>
          ) : null}
        </div>
        <p className="text-muted-foreground text-xs">Sem nota, o site não mostra estrelas.</p>
      </div>

      <div className="flex items-end gap-6">
        <div className="space-y-2">
          <Label htmlFor="order">Ordem</Label>
          <Input
            id="order"
            type="number"
            value={values.order}
            onChange={(event) => set("order", event.target.value)}
            className="max-w-32"
            placeholder="0"
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) => set("featured", event.target.checked)}
            className="size-4"
          />
          Exibir em destaque
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando..." : testimonialId ? "Salvar" : "Criar depoimento"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/depoimentos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
