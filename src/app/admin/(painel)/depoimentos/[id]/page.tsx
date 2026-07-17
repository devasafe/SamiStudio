"use client";

import { use, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import {
  TestimonialForm,
  type TestimonialFormValues,
} from "@/components/admin/testimonials/testimonial-form";

interface TestimonialResponse {
  name?: string;
  company?: string;
  role?: string;
  photo?: string;
  text?: string;
  rating?: number;
  order?: number;
  featured?: boolean;
}

export default function EditarDepoimentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<TestimonialFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<TestimonialResponse>(`/testimonials/${id}`);
        setInitial({
          name: data.name ?? "",
          company: data.company ?? "",
          role: data.role ?? "",
          photo: data.photo ?? "",
          text: data.text ?? "",
          rating: data.rating !== undefined ? String(data.rating) : "",
          order: data.order !== undefined ? String(data.order) : "",
          featured: data.featured ?? false,
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Editar depoimento</h1>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {initial ? (
        <TestimonialForm initial={initial} testimonialId={id} />
      ) : (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      )}
    </div>
  );
}
