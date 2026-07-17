"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { GripVertical } from "@/components/icons";
import { serviceIcon } from "@/components/services/service-icon";
import { Button } from "@/components/ui/button";
import { safeImageUrl } from "@/lib/images";
import { moveItem } from "@/lib/order";
import { cn } from "@/lib/utils";

interface ServiceRow {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  order?: number;
}

export function ServiceList() {
  const [rows, setRows] = useState<ServiceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api<ServiceRow[]>("/services");
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  /**
   * Solta o cartão na posição nova: a lista se reordena na hora e só depois a
   * ordem vai para o banco. Esperar cinco PATCHes para ver o cartão andar
   * pareceria travado.
   */
  async function handleDrop(to: number) {
    if (dragIndex === null || rows === null) {
      return;
    }
    const previous = rows;
    const next = moveItem(rows, dragIndex, to);
    setDragIndex(null);
    if (next === previous) {
      return;
    }
    setRows(next);
    setSavingOrder(true);
    setError(null);
    try {
      // Só quem trocou de posição é gravado; o `moveItem` já renumerou o
      // `order` de cada um pela posição nova.
      const changed = next.filter((row, index) => previous[index]?._id !== row._id);
      await Promise.all(
        changed.map((row) =>
          api(`/services/${row._id}`, { method: "PATCH", json: { order: row.order } })
        )
      );
    } catch (err) {
      // Falhou: volta ao que estava, senão a tela mostra uma ordem que o site
      // não tem.
      setRows(previous);
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar a ordem.");
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleDelete(row: ServiceRow) {
    if (!window.confirm(`Remover "${row.title}"?`)) {
      return;
    }
    try {
      await api(`/services/${row._id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Serviços</h1>
        <Link href="/admin/servicos/novo">
          <Button>Novo serviço</Button>
        </Link>
      </div>

      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {rows === null ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum serviço ainda. Sem nenhum cadastrado, o site mostra os cinco textos de reserva.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Arraste os cartões para mudar a ordem em que aparecem no site.
            {savingOrder ? <span className="text-primary ml-2">Salvando a ordem...</span> : null}
          </p>

          {/* Cinco colunas: é a mesma fileira que o site mostra. */}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {rows.map((row, index) => {
              // A mesma resolução do site: o ícone cadastrado, ou o da posição.
              const Icon = serviceIcon(row.icon, index);
              // Só imagem do upload vai para o next/image — dado inválido no
              // banco não pode derrubar a listagem.
              const cover = safeImageUrl(row.coverImage);
              return (
                <li
                  key={row._id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "border-border group overflow-hidden rounded-lg border transition-opacity",
                    dragIndex === index && "opacity-40"
                  )}
                >
                  <div className="bg-muted relative aspect-[4/3]">
                    {cover ? (
                      <Image src={cover} alt="" fill sizes="220px" className="object-cover" />
                    ) : (
                      <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                        Sem foto
                      </span>
                    )}
                    {/* A alça diz que dá para arrastar; o cartão inteiro arrasta. */}
                    <span className="bg-background/80 text-muted-foreground absolute top-1.5 left-1.5 cursor-grab rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                      <GripVertical className="size-4" aria-hidden />
                    </span>
                    <span className="bg-background/80 text-muted-foreground absolute top-1.5 right-1.5 rounded px-1.5 py-0.5 text-xs tabular-nums">
                      {index + 1}
                    </span>
                  </div>

                  <div className="space-y-2 p-3">
                    <div className="flex items-start gap-2">
                      <Icon
                        className="text-primary mt-0.5 size-4 shrink-0"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-medium">{row.title}</h2>
                        <p className="text-muted-foreground truncate font-mono text-xs">
                          {row.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/admin/servicos/${row._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(row)}
                        aria-label={`Excluir ${row.title}`}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
