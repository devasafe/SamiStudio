"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { ChevronDown, GripVertical } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { moveItem } from "@/lib/order";
import { cn } from "@/lib/utils";

interface FaqRow {
  _id: string;
  question: string;
  answer: string;
  order?: number;
}

/**
 * As perguntas em acordeão, como aparecem no site: a pergunta à mostra e a
 * resposta ao abrir. Assim a tela do painel mostra o que a visitante vê.
 */
type Tab = "active" | "trash";

export function FaqList() {
  const [tab, setTab] = useState<Tab>("active");
  const [rows, setRows] = useState<FaqRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (which: Tab) => {
    setRows(null);
    try {
      const { data } = await api<FaqRow[]>(which === "trash" ? "/faq?deleted=true" : "/faq");
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

  /** Tira da lista atual sem recarregar: a pergunta mudou de aba. */
  function drop(id: string) {
    setRows((current) => current?.filter((row) => row._id !== id) ?? null);
  }

  async function handleRestore(row: FaqRow) {
    setBusyId(row._id);
    try {
      await api(`/faq/${row._id}?restore=true`, { method: "PATCH", json: {} });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao restaurar.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDestroy(row: FaqRow) {
    // Não tem volta: o aviso diz isso com todas as letras.
    if (
      !window.confirm(`Apagar "${row.question}" de vez?

Isto não pode ser desfeito.`)
    ) {
      return;
    }
    setBusyId(row._id);
    try {
      await api(`/faq/${row._id}?permanent=true`, { method: "DELETE" });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao apagar.");
    } finally {
      setBusyId(null);
    }
  }

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
          api(`/faq/${row._id}`, { method: "PATCH", json: { order: row.order } })
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

  async function handleDelete(row: FaqRow) {
    if (!window.confirm(`Mandar "${row.question}" para a lixeira?`)) {
      return;
    }
    setBusyId(row._id);
    try {
      await api(`/faq/${row._id}`, { method: "DELETE" });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">Perguntas frequentes</h1>
        {tab === "active" ? (
          <Link href="/admin/faq/nova">
            <Button>Nova pergunta</Button>
          </Link>
        ) : null}
      </div>

      <nav className="border-border flex gap-1 border-b">
        {(
          [
            { id: "active", label: "Perguntas" },
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
        <p className="text-muted-foreground max-w-lg text-sm">
          {tab === "trash"
            ? "A lixeira está vazia."
            : "Nenhuma pergunta ainda. Sem nenhuma cadastrada, o site mostra as cinco de reserva."}
        </p>
      ) : (
        <>
          {tab === "active" ? (
            <p className="text-muted-foreground text-sm">
              Arraste para mudar a ordem no site.
              {savingOrder ? <span className="text-primary ml-2">Salvando a ordem...</span> : null}
            </p>
          ) : null}

          <ul className="max-w-3xl space-y-2">
            {rows.map((row, index) => {
              const isOpen = open === row._id;
              return (
                <li
                  key={row._id}
                  draggable={tab === "active"}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "border-border group overflow-hidden rounded-lg border transition-opacity",
                    dragIndex === index && "opacity-40"
                  )}
                >
                  <div className="flex items-center gap-3 p-3">
                    {tab === "active" ? (
                      <>
                        <GripVertical
                          className="text-muted-foreground size-4 shrink-0 cursor-grab active:cursor-grabbing"
                          aria-hidden
                        />
                        <span className="text-muted-foreground w-6 shrink-0 text-xs tabular-nums">
                          {index + 1}
                        </span>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : row._id)}
                      aria-expanded={isOpen}
                      className="min-w-0 flex-1 text-left text-sm"
                    >
                      <span className="block truncate">{row.question}</span>
                    </button>
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground size-4 shrink-0 transition-transform",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                    {/* O apagar definitivo só existe na lixeira: na lista
                        principal, um clique errado levaria a resposta junto. */}
                    {tab === "active" ? (
                      <>
                        <Link href={`/admin/faq/${row._id}`}>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={busyId === row._id}
                          onClick={() => handleDelete(row)}
                          title="Mandar para a lixeira"
                          aria-label={`Excluir ${row.question}`}
                        >
                          ✕
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
                          title="Apagar de vez"
                          aria-label={`Apagar ${row.question} de vez`}
                        >
                          ✕
                        </Button>
                      </>
                    )}
                  </div>

                  {isOpen ? (
                    <p className="text-muted-foreground border-border border-t p-4 text-sm whitespace-pre-wrap">
                      {row.answer}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
