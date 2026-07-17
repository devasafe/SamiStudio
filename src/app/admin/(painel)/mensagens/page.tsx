"use client";

import { useCallback, useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { whatsappUrl } from "@/lib/phone";
import { cn } from "@/lib/utils";

/** Primeiro nome, para a saudação da mensagem já vir pessoal. */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

interface WhatsAppLinkProps {
  phone: string;
  name: string;
}

/**
 * Telefone como atalho para o WhatsApp, com a conversa já aberta e a saudação
 * pronta.
 *
 * Sem DDI não há link: `wa.me` sem código de país abre conversa com o número
 * errado, e mandar a mensagem para um estranho é pior que copiar à mão.
 */
function WhatsAppLink({ phone, name }: WhatsAppLinkProps) {
  const url = whatsappUrl(phone, `Olá, ${firstName(name)}! Recebi sua mensagem pelo site.`);

  if (!url) {
    return (
      <span title="Sem código do país (+55), não dá para abrir o WhatsApp com segurança.">
        · {phone}
      </span>
    );
  }

  return (
    <>
      ·
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary inline-flex items-center gap-1.5 underline"
      >
        {phone}
        <span className="text-primary text-xs">WhatsApp</span>
      </a>
    </>
  );
}

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

type Tab = "inbox" | "archived";

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<Tab>("inbox");
  const [messages, setMessages] = useState<MessageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (which: Tab) => {
    setMessages(null);
    try {
      const { data } = await api<MessageRow[]>(
        which === "archived" ? "/messages?archived=true" : "/messages"
      );
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao carregar as mensagens.");
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load(tab));
  }, [load, tab]);

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

  /** Tira da lista atual sem recarregar: a mensagem mudou de aba. */
  function drop(id: string) {
    setMessages((current) => current?.filter((m) => m._id !== id) ?? null);
  }

  async function archive(row: MessageRow) {
    if (!window.confirm(`Arquivar a mensagem de ${row.name}?`)) {
      return;
    }
    setBusyId(row._id);
    setError(null);
    try {
      await api(`/messages/${row._id}`, { method: "DELETE" });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao arquivar.");
    } finally {
      setBusyId(null);
    }
  }

  async function restore(row: MessageRow) {
    setBusyId(row._id);
    setError(null);
    try {
      await api(`/messages/${row._id}`, { method: "PATCH", json: { archived: false } });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao restaurar.");
    } finally {
      setBusyId(null);
    }
  }

  async function destroy(row: MessageRow) {
    // Não tem volta: o aviso diz isso com todas as letras, e o nome de quem
    // escreveu aparece para não apagar a mensagem errada.
    if (
      !window.confirm(
        `Apagar de vez a mensagem de ${row.name}?

Isto não pode ser desfeito — o contato dela se perde.`
      )
    ) {
      return;
    }
    setBusyId(row._id);
    setError(null);
    try {
      await api(`/messages/${row._id}?permanent=true`, { method: "DELETE" });
      drop(row._id);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Falha ao apagar.");
    } finally {
      setBusyId(null);
    }
  }

  const unread = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-2xl tracking-tight">Mensagens</h1>
        {unread > 0 && tab === "inbox" ? (
          <span className="bg-foreground text-background rounded-full px-2.5 py-0.5 text-xs">
            {unread} não {unread === 1 ? "lida" : "lidas"}
          </span>
        ) : null}
      </div>

      <nav className="border-border flex gap-1 border-b">
        {(
          [
            { id: "inbox", label: "Recebidas" },
            { id: "archived", label: "Arquivadas" },
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

      {messages === null ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {tab === "archived"
            ? "Nenhuma mensagem arquivada."
            : "Nenhuma mensagem ainda. As que chegarem pelo formulário de contato aparecem aqui."}
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
                  <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-sm">
                    <a href={`mailto:${row.email}`} className="hover:text-foreground underline">
                      {row.email}
                    </a>
                    {row.phone ? <WhatsAppLink phone={row.phone} name={row.name} /> : null}
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

              {/* O apagar definitivo só existe no arquivo: na caixa de entrada,
                  um clique errado destruiria o contato de um cliente. */}
              <div className="mt-4 flex gap-3">
                {tab === "inbox" ? (
                  <>
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
                      onClick={() => void archive(row)}
                      disabled={busyId === row._id}
                      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                    >
                      Arquivar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => void restore(row)}
                      disabled={busyId === row._id}
                      className="border-border hover:border-foreground/30 rounded-md border px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                    >
                      Restaurar
                    </button>
                    <button
                      type="button"
                      onClick={() => void destroy(row)}
                      disabled={busyId === row._id}
                      className="text-muted-foreground hover:text-destructive rounded-md px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                    >
                      Apagar de vez
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
