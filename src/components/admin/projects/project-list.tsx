"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { coverFromGallery } from "@/components/admin/projects/gallery-utils";
import { Button } from "@/components/ui/button";
import { safeImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
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

type Tab = "active" | "trash";

export function ProjectList() {
  const [tab, setTab] = useState<Tab>("active");
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (which: Tab) => {
    setRows(null);
    try {
      const { data } = await api<ProjectRow[]>(
        which === "trash" ? "/projects?deleted=true" : "/projects"
      );
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(tab));
  }, [load, tab]);

  /** Tira da lista atual sem recarregar: o projeto mudou de aba. */
  function drop(id: string) {
    setRows((current) => current?.filter((row) => row._id !== id) ?? null);
  }

  async function handleDelete(row: ProjectRow) {
    if (!window.confirm(`Mandar "${row.title}" para a lixeira?`)) {
      return;
    }
    setBusyId(row._id);
    try {
      await api(`/projects/${row._id}`, { method: "DELETE" });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRestore(row: ProjectRow) {
    setBusyId(row._id);
    try {
      await api(`/projects/${row._id}`, { method: "PATCH", json: { deleted: false } });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao restaurar.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDestroy(row: ProjectRow) {
    // Não tem volta: o aviso diz isso, e lembra do que vai junto — as fotos
    // ficam no Cloudinary, mas o projeto e a galeria montada somem.
    if (
      !window.confirm(
        `Apagar "${row.title}" de vez?

Isto não pode ser desfeito: o projeto e a ordem da galeria se perdem.`
      )
    ) {
      return;
    }
    setBusyId(row._id);
    try {
      await api(`/projects/${row._id}?permanent=true`, { method: "DELETE" });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao apagar.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Projetos</h1>
        {tab === "active" ? (
          <Link href="/admin/projetos/novo">
            <Button>Novo projeto</Button>
          </Link>
        ) : null}
      </div>

      <nav className="border-border flex gap-1 border-b">
        {(
          [
            { id: "active", label: "Projetos" },
            { id: "trash", label: "Lixeira" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
              tab === item.id
                ? "border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {rows === null ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {tab === "trash" ? "A lixeira está vazia." : "Nenhum projeto ainda."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            // Só imagens do upload vão para o next/image (dado antigo/inválido
            // no banco não pode derrubar a listagem).
            const cover = safeImageUrl(coverFromGallery(row.gallery ?? []) ?? row.coverImage);
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
                  {/* O apagar definitivo só existe na lixeira: na lista
                      principal, um clique errado destruiria o projeto. */}
                  <div className="flex gap-2">
                    {tab === "active" ? (
                      <>
                        <Link href={`/admin/projetos/${row._id}`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          disabled={busyId === row._id}
                          onClick={() => handleDelete(row)}
                        >
                          Excluir
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === row._id}
                          onClick={() => handleRestore(row)}
                        >
                          Restaurar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={busyId === row._id}
                          onClick={() => handleDestroy(row)}
                        >
                          Apagar de vez
                        </Button>
                      </>
                    )}
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
