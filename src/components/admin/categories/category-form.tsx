"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/slug";

export interface CategoryFormValues {
  name: string;
  slug: string;
  order: string;
}

const EMPTY: CategoryFormValues = { name: "", slug: "", order: "" };

interface CategoryFormProps {
  initial?: Partial<CategoryFormValues>;
  /** Presente = edição; ausente = criação. */
  categoryId?: string;
}

export function CategoryForm({ initial, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormValues>({ ...EMPTY, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Slug editado à mão para de seguir o nome: quem mexeu tem um motivo, e o
  // slug já publicado aparece no filtro do portfólio.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim() || slugify(values.name),
        order: values.order ? Number(values.order) : undefined,
      };
      if (categoryId) {
        await api(`/categories/${categoryId}`, { method: "PATCH", json: payload });
      } else {
        await api("/categories", { method: "POST", json: payload });
      }
      router.push("/admin/categorias");
      router.refresh();
    } catch (err) {
      // Mantém o que foi digitado: refazer o formulário por um erro de rede é
      // o tipo de coisa que faz desistir.
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={values.name}
          required
          onChange={(event) => {
            const name = event.target.value;
            setValues((current) => ({
              ...current,
              name,
              slug: slugTouched ? current.slug : slugify(name),
            }));
          }}
          placeholder="ex.: Interiores"
        />
        <p className="text-muted-foreground text-xs">
          É o que aparece no filtro do portfólio e na legenda dos projetos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Endereço no site</Label>
        <Input
          id="slug"
          value={values.slug}
          required
          onChange={(event) => {
            setSlugTouched(true);
            setValues((current) => ({ ...current, slug: slugify(event.target.value) }));
          }}
          placeholder="ex.: interiores"
        />
        <p className="text-muted-foreground text-xs">
          Preenchido pelo nome. Só letras minúsculas, números e hífen.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Ordem</Label>
        <Input
          id="order"
          type="number"
          value={values.order}
          onChange={(event) => setValues((current) => ({ ...current, order: event.target.value }))}
          className="max-w-32"
          placeholder="0"
        />
        <p className="text-muted-foreground text-xs">
          Menor aparece primeiro. Dá para arrastar na lista.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando..." : categoryId ? "Salvar" : "Criar categoria"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/categorias")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
