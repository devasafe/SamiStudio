"use client";

import { use, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { FaqForm, type FaqFormValues } from "@/components/admin/faq/faq-form";

interface FaqResponse {
  question?: string;
  answer?: string;
  order?: number;
}

export default function EditarPerguntaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<FaqFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<FaqResponse>(`/faq/${id}`);
        setInitial({
          question: data.question ?? "",
          answer: data.answer ?? "",
          order: data.order !== undefined ? String(data.order) : "",
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Editar pergunta</h1>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {initial ? (
        <FaqForm initial={initial} faqId={id} />
      ) : (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      )}
    </div>
  );
}
