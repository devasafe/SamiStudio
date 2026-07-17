"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { serviceIcon } from "@/components/services/service-icon";
import { Button } from "@/components/ui/button";
import { safeImageUrl } from "@/lib/images";

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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row, index) => {
            // A mesma resolução do site: o ícone cadastrado, ou o da posição.
            const Icon = serviceIcon(row.icon, index);
            // Só imagem do upload vai para o next/image — dado inválido no
            // banco não pode derrubar a listagem.
            const cover = safeImageUrl(row.coverImage);
            return (
              <li key={row._id} className="border-border overflow-hidden rounded-lg border">
                <div className="bg-muted relative aspect-[4/3]">
                  {cover ? (
                    <Image src={cover} alt="" fill sizes="360px" className="object-cover" />
                  ) : (
                    <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs">
                      Sem foto
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      className="text-primary mt-0.5 size-5 shrink-0"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-medium">{row.title}</h2>
                      <p className="text-muted-foreground font-mono text-xs">{row.slug}</p>
                    </div>
                    <span className="text-muted-foreground text-xs">#{row.order ?? 0}</span>
                  </div>
                  {row.description ? (
                    <p className="text-muted-foreground line-clamp-2 text-sm">{row.description}</p>
                  ) : null}
                  <div className="flex gap-2">
                    <Link href={`/admin/servicos/${row._id}`}>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
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
