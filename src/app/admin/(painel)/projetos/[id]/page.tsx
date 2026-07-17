"use client";

import { use, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/projects/project-form";
import type { BeforeAfterItem, GalleryItem, ProjectStage } from "@/models/project";

interface ProjectResponse {
  title?: string;
  slug?: string;
  description?: string;
  client?: string;
  city?: string;
  country?: string;
  year?: number;
  area?: number;
  stage?: ProjectStage;
  categoryId?: string;
  status?: "draft" | "published" | "archived";
  featured?: boolean;
  gallery?: GalleryItem[];
  checkpoint?: boolean;
  beforeAfter?: BeforeAfterItem[];
}

export default function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initial, setInitial] = useState<Partial<ProjectFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<ProjectResponse>(`/projects/${id}`);
        setInitial({
          title: data.title ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          client: data.client ?? "",
          city: data.city ?? "",
          country: data.country ?? "",
          year: data.year ? String(data.year) : "",
          area: data.area ? String(data.area) : "",
          stage: data.stage ?? "",
          categoryId: data.categoryId ?? "",
          status: data.status ?? "draft",
          featured: data.featured ?? false,
          gallery: data.gallery ?? [],
          checkpoint: data.checkpoint ?? false,
          beforeAfter: data.beforeAfter ?? [],
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Editar projeto</h1>
      {error ? <p className="text-error text-sm">{error}</p> : null}
      {initial ? (
        <ProjectForm initial={initial} projectId={id} />
      ) : (
        <p className="text-muted-foreground text-sm">Carregando…</p>
      )}
    </div>
  );
}
