"use client";

import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { EntityForm, type EntityValues, type FieldConfig } from "@/components/admin/entity-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface ColumnConfig {
  key: string;
  label: string;
}

interface CrudPageProps {
  title: string;
  endpoint: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  /** Carrega opções remotas para um campo select (ex.: categorias). */
  remoteOptions?: { field: string; endpoint: string; valueKey: string; labelKey: string };
}

interface Row extends EntityValues {
  _id: string;
}

/** CRUD genérico do painel (Docs/12): listagem, criar, editar, excluir. */
export function CrudPage({ title, endpoint, columns, fields, remoteOptions }: CrudPageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [resolvedFields, setResolvedFields] = useState<FieldConfig[]>(fields);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api<Row[]>(endpoint);
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar.");
    }
  }, [endpoint]);

  useEffect(() => {
    // Agenda fora do tick síncrono do effect (react-hooks/set-state-in-effect).
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (!remoteOptions) {
      return;
    }
    void (async () => {
      try {
        const { data } = await api<Row[]>(remoteOptions.endpoint);
        const options = data.map((item) => ({
          value: String(item[remoteOptions.valueKey]),
          label: String(item[remoteOptions.labelKey]),
        }));
        setResolvedFields(
          fields.map((field) =>
            field.name === remoteOptions.field ? { ...field, options } : field
          )
        );
      } catch {
        // Sem opções remotas o campo fica vazio; não bloqueia a página.
      }
    })();
  }, [fields, remoteOptions]);

  async function handleCreate(values: EntityValues) {
    setBusy(true);
    setError(null);
    try {
      await api(endpoint, { method: "POST", json: values });
      setCreating(false);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(values: EntityValues) {
    if (!editing) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api(`${endpoint}/${editing._id}`, { method: "PATCH", json: values });
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(row: Row) {
    if (!window.confirm("Remover este registro?")) {
      return;
    }
    setError(null);
    try {
      await api(`${endpoint}/${row._id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao remover.");
    }
  }

  function initialValuesFor(row: Row): EntityValues {
    const values: EntityValues = {};
    for (const field of resolvedFields) {
      values[field.name] = row[field.name];
    }
    return values;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl tracking-tight">{title}</h1>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger render={<Button />}>Novo</DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo registro</DialogTitle>
            </DialogHeader>
            <EntityForm
              fields={resolvedFields}
              submitLabel="Criar"
              busy={busy}
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      <div className="border-border bg-background overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-muted-foreground px-4 py-8">
                  Nenhum registro ainda.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-border border-b last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className="max-w-xs truncate px-4 py-3">
                      {String(row[column.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error"
                      onClick={() => handleDelete(row)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
          </DialogHeader>
          {editing ? (
            <EntityForm
              key={editing._id}
              fields={resolvedFields}
              initialValues={initialValuesFor(editing)}
              submitLabel="Salvar"
              busy={busy}
              onSubmit={handleUpdate}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
