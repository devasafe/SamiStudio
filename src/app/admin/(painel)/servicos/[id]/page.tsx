"use client";

import { use, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ServiceForm, type ServiceFormValues } from "@/components/admin/services/service-form";

interface ServiceResponse {
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  order?: number;
}

export default function EditarServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<ServiceFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<ServiceResponse>(`/services/${id}`);
        setInitial({
          title: data.title ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          icon: data.icon ?? "",
          coverImage: data.coverImage ?? "",
          order: data.order !== undefined ? String(data.order) : "",
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Editar serviço</h1>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {initial ? (
        <ServiceForm initial={initial} serviceId={id} />
      ) : (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      )}
    </div>
  );
}
