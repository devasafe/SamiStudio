"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { GripVertical } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { moveItem } from "@/lib/order";
import { cn } from "@/lib/utils";

interface CategoryRow {
  _id: string;
  name: string;
  slug: string;
  order?: number;
}

/**
 * Categorias em linhas, não em cartões: são só um nome e um endereço — um
 * cartão com foto seria moldura sem quadro.
 */
export function CategoryList() {
  const [rows, setRows] = useState<CategoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api<CategoryRow[]>("/categories");
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
          api(`/categories/${row._id}`, { method: "PATCH", json: { order: row.order } })
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

  async function handleDelete(row: CategoryRow) {
    if (!window.confirm(`Remover "${row.name}"?`)) {
      return;
    }
    try {
      await api(`/categories/${row._id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Categorias</h1>
        <Link href="/admin/categorias/nova">
          <Button>Nova categoria</Button>
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
          Nenhuma categoria ainda. Sem elas, o filtro do portfólio não aparece no site e os projetos
          ficam sem legenda de categoria.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Arraste para mudar a ordem dos filtros no site.
            {savingOrder ? <span className="text-primary ml-2">Salvando a ordem...</span> : null}
          </p>

          <ul className="border-border max-w-2xl divide-y overflow-hidden rounded-lg border">
            {rows.map((row, index) => (
              <li
                key={row._id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => void handleDrop(index)}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  "group hover:bg-muted/40 flex items-center gap-3 p-3 transition-opacity",
                  dragIndex === index && "opacity-40"
                )}
              >
                <GripVertical
                  className="text-muted-foreground size-4 shrink-0 cursor-grab active:cursor-grabbing"
                  aria-hidden
                />
                <span className="text-muted-foreground w-6 shrink-0 text-xs tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{row.name}</span>
                  <span className="text-muted-foreground block truncate font-mono text-xs">
                    {row.slug}
                  </span>
                </span>
                <Link href={`/admin/categorias/${row._id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(row)}
                  aria-label={`Excluir ${row.name}`}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
