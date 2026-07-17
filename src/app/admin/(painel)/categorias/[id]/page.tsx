"use client";

import { use, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { CategoryForm, type CategoryFormValues } from "@/components/admin/categories/category-form";

interface CategoryResponse {
  name?: string;
  slug?: string;
  order?: number;
}

export default function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<CategoryFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<CategoryResponse>(`/categories/${id}`);
        setInitial({
          name: data.name ?? "",
          slug: data.slug ?? "",
          order: data.order !== undefined ? String(data.order) : "",
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Editar categoria</h1>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {initial ? (
        <CategoryForm initial={initial} categoryId={id} />
      ) : (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      )}
    </div>
  );
}
