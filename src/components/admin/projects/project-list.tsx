"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { coverFromGallery } from "@/components/admin/projects/gallery-utils";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "@/models/project";

interface ProjectRow {
  _id: string;
  title: string;
  city?: string;
  year?: number;
  status: string;
  coverImage?: string;
  gallery?: GalleryItem[];
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function ProjectList() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api<ProjectRow[]>("/projects");
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function handleDelete(row: ProjectRow) {
    if (!window.confirm(`Remover "${row.title}"?`)) {
      return;
    }
    try {
      await api(`/projects/${row._id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Projetos</h1>
        <Link href="/admin/projetos/novo">
          <Button>Novo projeto</Button>
        </Link>
      </div>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum projeto ainda.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const cover = coverFromGallery(row.gallery ?? []) ?? row.coverImage;
            return (
              <li
                key={row._id}
                className="border-border bg-background overflow-hidden rounded-lg border"
              >
                <div className="bg-muted relative aspect-[4/3]">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={row.title}
                      fill
                      sizes="360px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                      Sem foto
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-medium">{row.title}</h2>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {[row.city, row.year].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/admin/projetos/${row._id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error"
                      onClick={() => handleDelete(row)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
