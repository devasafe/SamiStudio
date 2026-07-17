"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { coverFromGallery } from "@/components/admin/projects/gallery-utils";
import { Archive, Eye } from "@/components/icons";
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

  /**
   * Arquivar tira do site sem excluir — é decisão editorial, não remoção. Um
   * projeto arquivado continua na lista, editável, e volta com um clique.
   */
  async function toggleArchive(row: ProjectRow) {
    const next = row.status === "published" ? "archived" : "published";
    setBusyId(row._id);
    try {
      await api(`/projects/${row._id}`, { method: "PATCH", json: { status: next } });
      setRows(
        (current) =>
          current?.map((item) => (item._id === row._id ? { ...item, status: next } : item)) ?? null
      );
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao mudar o status.");
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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {/* Cinco colunas: são dezenas de projetos, e cartão grande vira rolagem. */}
          {rows.map((row) => {
            // Só imagens do upload vão para o next/image (dado antigo/inválido
            // no banco não pode derrubar a listagem).
            const cover = safeImageUrl(coverFromGallery(row.gallery ?? []) ?? row.coverImage);
            const published = row.status === "published";
            return (
              <li key={row._id} className="border-border overflow-hidden rounded-lg border">
                <div className="bg-muted relative aspect-[4/3]">
                  {cover ? (
                    <Image src={cover} alt="" fill sizes="220px" className="object-cover" />
                  ) : (
                    <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                      Sem foto
                    </span>
                  )}
                  <span
                    className={cn(
                      "bg-background/85 absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-xs",
                      published ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </div>

                <div className="space-y-2 p-3">
                  <div>
                    <h2 className="truncate text-sm font-medium">{row.title}</h2>
                    <p className="text-muted-foreground truncate text-xs">
                      {[row.city, row.year].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>

                  {/* Arquivar é editorial (tira do site); excluir manda para a
                      lixeira. O apagar definitivo só existe lá dentro. */}
                  <div className="flex gap-1">
                    {tab === "active" ? (
                      <>
                        <Link href={`/admin/projetos/${row._id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === row._id}
                          onClick={() => toggleArchive(row)}
                          title={published ? "Arquivar (tira do site)" : "Publicar no site"}
                          aria-label={published ? `Arquivar ${row.title}` : `Publicar ${row.title}`}
                        >
                          {published ? (
                            <Archive className="size-4" aria-hidden />
                          ) : (
                            <Eye className="size-4" aria-hidden />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={busyId === row._id}
                          onClick={() => handleDelete(row)}
                          title="Mandar para a lixeira"
                          aria-label={`Excluir ${row.title}`}
                        >
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
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
                          title="Apagar de vez"
                          aria-label={`Apagar ${row.title} de vez`}
                        >
                          ✕
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
