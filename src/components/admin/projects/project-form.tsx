"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { BeforeAfterEditor } from "@/components/admin/projects/before-after-editor";
import { GalleryUploader } from "@/components/admin/projects/gallery-uploader";
import { coverFromGallery } from "@/components/admin/projects/gallery-utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { BeforeAfterItem, GalleryItem, ProjectStage } from "@/models/project";

export interface ProjectFormValues {
  title: string;
  slug: string;
  description: string;
  client: string;
  city: string;
  country: string;
  year: string;
  area: string;
  stage: "" | ProjectStage;
  categoryId: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  gallery: GalleryItem[];
  checkpoint: boolean;
  beforeAfter: BeforeAfterItem[];
}

const EMPTY: ProjectFormValues = {
  title: "",
  slug: "",
  description: "",
  client: "",
  city: "",
  country: "",
  year: "",
  area: "",
  stage: "",
  categoryId: "",
  status: "draft",
  featured: false,
  gallery: [],
  checkpoint: false,
  beforeAfter: [],
};

interface CategoryOption {
  _id: string;
  name: string;
}

interface ProjectFormProps {
  initial?: Partial<ProjectFormValues>;
  projectId?: string;
}

const inputClass = "border-border w-full rounded-md border px-3 py-2 text-sm";

export function ProjectForm({ initial, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>({ ...EMPTY, ...initial });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<CategoryOption[]>("/categories");
        setCategories(data);
      } catch {
        // sem categorias o select fica vazio; não bloqueia
      }
    })();
  }, []);

  function set<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description || undefined,
      client: values.client || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      year: values.year ? Number(values.year) : undefined,
      area: values.area ? Number(values.area) : undefined,
      stage: values.stage || undefined,
      categoryId: values.categoryId || undefined,
      status: values.status,
      featured: values.featured,
      gallery: values.gallery,
      coverImage: coverFromGallery(values.gallery),
      checkpoint: values.checkpoint,
      // Só vai o par completo: meio par não compara nada, e a validação da API
      // exige as duas fotos. Sem o checkpoint, nada é enviado.
      beforeAfter: values.checkpoint
        ? values.beforeAfter
            .filter((item) => item.before && item.after)
            .map((item, index) => ({ ...item, order: index }))
        : [],
    };
    try {
      if (projectId) {
        await api(`/projects/${projectId}`, { method: "PATCH", json: payload });
      } else {
        await api("/projects", { method: "POST", json: payload });
      }
      router.push("/admin/projetos");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Título</Label>
          <input
            id="title"
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug (URL)</Label>
          <input
            id="slug"
            required
            value={values.slug}
            placeholder="ex.: interior-miraflores"
            onChange={(e) => set("slug", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="client">Cliente</Label>
          <input
            id="client"
            value={values.client}
            onChange={(e) => set("client", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">Cidade</Label>
          <input
            id="city"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="country">País</Label>
          <input
            id="country"
            value={values.country}
            onChange={(e) => set("country", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="year">Ano</Label>
          <input
            id="year"
            type="number"
            value={values.year}
            onChange={(e) => set("year", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="area">Área (m²)</Label>
          <input
            id="area"
            type="number"
            value={values.area}
            onChange={(e) => set("area", e.target.value)}
            className={inputClass}
            placeholder="ex.: 620"
          />
        </div>
        <div className="space-y-1">
          {/* Etapa da obra — nada a ver com o status de publicação abaixo. */}
          <Label htmlFor="stage">Etapa da obra</Label>
          <select
            id="stage"
            value={values.stage}
            onChange={(e) => set("stage", e.target.value as ProjectStage | "")}
            className={inputClass}
          >
            <option value="">Não informar</option>
            <option value="concept">Conceito</option>
            <option value="inProgress">Em andamento</option>
            <option value="done">Finalizado</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => set("status", e.target.value as ProjectFormValues["status"])}
            className={inputClass}
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => set("featured", e.target.checked)}
        />
        Projeto em destaque
      </label>

      <GalleryUploader value={values.gallery} onChange={(gallery) => set("gallery", gallery)} />

      <div className="border-border space-y-4 rounded-md border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.checkpoint}
            onChange={(e) => set("checkpoint", e.target.checked)}
          />
          Checkpoint (comparação Antes / Depois)
        </label>
        <p className="text-muted-foreground text-xs">
          Liga a aba &quot;Antes e Depois&quot; na página do projeto, com o comparador de arrastar.
        </p>
        {values.checkpoint ? (
          <BeforeAfterEditor
            value={values.beforeAfter}
            onChange={(items) => set("beforeAfter", items)}
          />
        ) : null}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando..." : projectId ? "Salvar" : "Criar projeto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projetos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
