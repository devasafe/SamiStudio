"use client";

import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { cn } from "@/lib/utils";

interface MessageRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<MessageRow[]>("/messages");
        setMessages(data);
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar as mensagens.");
        setMessages([]);
      }
    })();
  }, []);

  async function toggleRead(row: MessageRow) {
    setBusyId(row._id);
    setError(null);
    try {
      await api(`/messages/${row._id}`, { method: "PATCH", json: { read: !row.read } });
      setMessages(
        (current) =>
          current?.map((m) => (m._id === row._id ? { ...m, read: !row.read } : m)) ?? null
      );
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao atualizar.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: MessageRow) {
    if (!window.confirm(`Arquivar a mensagem de ${row.name}?`)) {
      return;
    }
    setBusyId(row._id);
    setError(null);
    try {
      await api(`/messages/${row._id}`, { method: "DELETE" });
      setMessages((current) => current?.filter((m) => m._id !== row._id) ?? null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao arquivar.");
    } finally {
      setBusyId(null);
    }
  }

  const unread = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-2xl tracking-tight">Mensagens</h1>
        {unread > 0 ? (
          <span className="bg-foreground text-background rounded-full px-2.5 py-0.5 text-xs">
            {unread} não {unread === 1 ? "lida" : "lidas"}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      {messages === null ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma mensagem ainda. As que chegarem pelo formulário de contato aparecem aqui.
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((row) => (
            <li
              key={row._id}
              className={cn(
                "border-border bg-background rounded-lg border p-5",
                !row.read && "border-foreground/30"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    {!row.read ? (
                      <span
                        className="bg-foreground size-2 shrink-0 rounded-full"
                        aria-label="Não lida"
                      />
                    ) : null}
                    {row.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    <a href={`mailto:${row.email}`} className="hover:text-foreground underline">
                      {row.email}
                    </a>
                    {row.phone ? ` · ${row.phone}` : ""}
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  {new Date(row.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>

              {row.subject ? <p className="mt-4 text-sm font-medium">{row.subject}</p> : null}
              <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">
                {row.message}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => void toggleRead(row)}
                  disabled={busyId === row._id}
                  className="border-border hover:border-foreground/30 rounded-md border px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                >
                  {row.read ? "Marcar como não lida" : "Marcar como lida"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(row)}
                  disabled={busyId === row._id}
                  className="text-muted-foreground hover:text-error rounded-md px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                >
                  Arquivar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
