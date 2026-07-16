"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";

interface Counts {
  mensagens: number | null;
  projetos: number | null;
  servicos: number | null;
  depoimentos: number | null;
  faq: number | null;
}

const cards = [
  { key: "mensagens" as const, label: "Mensagens não lidas", href: "/admin/mensagens" },
  { key: "projetos" as const, label: "Projetos", href: "/admin/projetos" },
  { key: "servicos" as const, label: "Serviços", href: "/admin/servicos" },
  { key: "depoimentos" as const, label: "Depoimentos", href: "/admin/depoimentos" },
  { key: "faq" as const, label: "Perguntas no FAQ", href: "/admin/faq" },
];

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({
    mensagens: null,
    projetos: null,
    servicos: null,
    depoimentos: null,
    faq: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [messages, projects, services, testimonials, faq] = await Promise.all([
          api<{ read: boolean }[]>("/messages"),
          api<unknown[]>("/projects?limit=1"),
          api<unknown[]>("/services"),
          api<unknown[]>("/testimonials"),
          api<unknown[]>("/faq"),
        ]);
        setCounts({
          mensagens: messages.data.filter((m) => !m.read).length,
          projetos: projects.meta?.total ?? projects.data.length,
          servicos: services.data.length,
          depoimentos: testimonials.data.length,
          faq: faq.data.length,
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar o resumo.");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl tracking-tight">Dashboard</h1>

      {error ? (
        <p className="border-error/30 text-error rounded-md border px-4 py-3 text-sm">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="border-border bg-background hover:border-foreground/30 block rounded-lg border p-6 transition-colors"
          >
            <p className="text-muted-foreground text-sm">{card.label}</p>
            <p className="font-heading mt-2 text-3xl">{counts[card.key] ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="border-border bg-background rounded-lg border p-6">
        <h2 className="font-heading text-lg">Atalhos</h2>
        <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
          <li>
            <Link href="/admin/mensagens" className="hover:text-foreground underline">
              Ler mensagens do formulário de contato
            </Link>
          </li>
          <li>
            <Link href="/admin/projetos" className="hover:text-foreground underline">
              Cadastrar novo projeto
            </Link>
          </li>
          <li>
            <Link href="/admin/configuracoes" className="hover:text-foreground underline">
              Editar configurações do site
            </Link>
          </li>
          <li>
            <Link href="/" target="_blank" className="hover:text-foreground underline">
              Ver o site publicado
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
