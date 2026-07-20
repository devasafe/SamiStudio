"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { GripVertical, Star } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { safeImageUrl } from "@/lib/images";
import { moveItem } from "@/lib/order";
import { cn } from "@/lib/utils";

interface TestimonialRow {
  _id: string;
  name: string;
  company?: string;
  role?: string;
  photo?: string;
  text: string;
  rating?: number;
  order?: number;
  featured?: boolean;
}

/** Iniciais, como o site faz quando não há foto. */
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function TestimonialList() {
  const [rows, setRows] = useState<TestimonialRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api<TestimonialRow[]>("/testimonials");
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
    // A lista anda na hora; a ordem vai para o banco em seguida.
    setRows(next);
    setSavingOrder(true);
    setError(null);
    try {
      const changed = next.filter((row, index) => previous[index]?._id !== row._id);
      await Promise.all(
        changed.map((row) =>
          api(`/testimonials/${row._id}`, { method: "PATCH", json: { order: row.order } })
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

  async function handleDelete(row: TestimonialRow) {
    if (!window.confirm(`Remover o depoimento de "${row.name}"?`)) {
      return;
    }
    try {
      await api(`/testimonials/${row._id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Depoimentos</h1>
        <Link href="/admin/depoimentos/novo">
          <Button>Novo depoimento</Button>
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
        <p className="text-muted-foreground max-w-lg text-sm">
          Nenhum depoimento ainda. Sem nenhum cadastrado, a seção não aparece na home — melhor uma
          seção a menos do que um elogio inventado.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Arraste para mudar a ordem em que aparecem na home.
            {savingOrder ? <span className="text-primary ml-2">Salvando a ordem...</span> : null}
          </p>

          {/* Três colunas: o depoimento é um texto, e espremer em cinco deixaria
              cada um com duas palavras por linha. */}
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((row, index) => {
              // Só imagem do upload vai para o next/image — dado inválido no
              // banco não pode derrubar a listagem.
              const photo = safeImageUrl(row.photo);
              return (
                <li
                  key={row._id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "border-border group flex flex-col rounded-lg border p-4 transition-opacity",
                    dragIndex === index && "opacity-40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical
                      className="text-muted-foreground size-4 shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                      aria-hidden
                    />
                    {photo ? (
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
                        <Image src={photo} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                    ) : (
                      <span className="border-border text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full border text-xs">
                        {initials(row.name)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{row.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {[row.role, row.company].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </span>
                    {row.featured ? (
                      <span className="text-primary shrink-0 text-xs">destaque</span>
                    ) : null}
                  </div>

                  {row.rating ? (
                    <p className="mt-3 flex gap-0.5" role="img" aria-label={`${row.rating} de 5`}>
                      {Array.from({ length: 5 }, (_, star) => (
                        <Star
                          key={star}
                          className={cn(
                            "size-3",
                            star < row.rating!
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/40"
                          )}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      ))}
                    </p>
                  ) : null}

                  <p className="text-muted-foreground mt-3 line-clamp-3 flex-1 text-sm">
                    {row.text}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/admin/depoimentos/${row._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(row)}
                      aria-label={`Excluir depoimento de ${row.name}`}
                    >
                      ✕
                    </Button>
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
