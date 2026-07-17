"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import { MessagesChart } from "@/components/admin/dashboard/messages-chart";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import {
  Briefcase,
  ChevronRight,
  CircleHelp,
  Eye,
  FolderOpen,
  Mail,
  MessageSquare,
  Settings,
  SquarePen,
} from "@/components/icons";
import { dailyCounts } from "@/lib/dashboard/series";
import { safeImageUrl } from "@/lib/images";

interface MessageRow {
  _id: string;
  name: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface ProjectRow {
  _id: string;
  slug: string;
  title: string;
  coverImage?: string;
  createdAt: string;
}

interface Session {
  name: string;
}

interface Data {
  session: Session | null;
  messages: MessageRow[];
  projects: ProjectRow[];
  projectTotal: number;
  services: number;
  testimonials: number;
  faqs: number;
}

/** Janela de "recente" nas linhas de apoio dos cartões. */
const RECENT_DAYS = 7;
/** Dias plotados na Visão geral. */
const CHART_DAYS = 7;

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function isRecent(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < RECENT_DAYS * 24 * 60 * 60 * 1000;
}

/** "23 jul, 14:32" */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [session, messages, projects, services, testimonials, faqs] = await Promise.all([
          api<Session>("/auth/me"),
          api<MessageRow[]>("/messages"),
          api<ProjectRow[]>("/projects?limit=4"),
          api<unknown[]>("/services"),
          api<unknown[]>("/testimonials"),
          api<unknown[]>("/faq"),
        ]);
        setData({
          session: session.data,
          messages: messages.data,
          projects: projects.data,
          projectTotal: projects.meta?.total ?? projects.data.length,
          services: services.data.length,
          testimonials: testimonials.data.length,
          faqs: faqs.data.length,
        });
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : "Falha ao carregar o resumo.");
      }
    })();
  }, []);

  const unread = data?.messages.filter((message) => !message.read) ?? [];
  const newToday = unread.filter((message) => isToday(message.createdAt)).length;
  const recentProjects =
    data?.projects.filter((project) => isRecent(project.createdAt)).length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl tracking-tight">
          Olá, {data?.session?.name ?? "Administrador"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Aqui está o resumo geral do seu site.</p>
      </header>

      {error ? (
        <p className="border-destructive/30 text-destructive rounded-md border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {/* Números */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Mensagens não lidas"
          value={data ? unread.length : null}
          hint={
            newToday > 0 ? `${newToday} ${newToday === 1 ? "nova hoje" : "novas hoje"}` : undefined
          }
          href="/admin/mensagens"
          icon={Mail}
        />
        <StatCard
          label="Projetos"
          value={data?.projectTotal ?? null}
          hint={recentProjects > 0 ? `${recentProjects} publicados esta semana` : undefined}
          href="/admin/projetos"
          icon={FolderOpen}
        />
        <StatCard
          label="Serviços"
          value={data?.services ?? null}
          href="/admin/servicos"
          icon={Briefcase}
        />
        <StatCard
          label="Depoimentos"
          value={data?.testimonials ?? null}
          href="/admin/depoimentos"
          icon={MessageSquare}
        />
        <StatCard
          label="Perguntas no FAQ"
          value={data?.faqs ?? null}
          href="/admin/faq"
          icon={CircleHelp}
        />
      </div>

      {/* Visão geral + atalhos */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="border-border bg-surface/50 rounded-xl border p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-lg">Mensagens por dia</h2>
            <span className="text-muted-foreground text-xs">Últimos 7 dias</span>
          </div>
          <div className="mt-6">
            {data ? (
              <MessagesChart
                points={dailyCounts(
                  data.messages.map((message) => message.createdAt),
                  CHART_DAYS
                )}
              />
            ) : (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            )}
          </div>
        </section>

        <section className="border-border bg-surface/50 rounded-xl border p-6">
          <h2 className="font-heading text-lg">Atalhos rápidos</h2>
          <ul className="mt-4 space-y-1">
            <Shortcut
              href="/admin/editor"
              icon={SquarePen}
              title="Editar textos e fotos do site"
              description="Clique no que quer mudar, direto na página"
            />
            <Shortcut
              href="/admin/mensagens"
              icon={Mail}
              title="Ler mensagens do formulário de contato"
              description="Veja todas as mensagens recebidas"
            />
            <Shortcut
              href="/admin/projetos"
              icon={FolderOpen}
              title="Cadastrar novo projeto"
              description="Adicione um novo projeto ao portfólio"
            />
            <Shortcut
              href="/admin/ajustes"
              icon={Settings}
              title="Ajustes do site"
              description="Contato, redes, SEO e textos avançados"
            />
            <Shortcut
              href="/"
              icon={Eye}
              title="Ver o site publicado"
              description="Abrir o site em uma nova aba"
              external
            />
          </ul>
        </section>
      </div>

      {/* Mensagens e projetos recentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border-border bg-surface/50 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">Mensagens recentes</h2>
            <Link
              href="/admin/mensagens"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Ver todas
            </Link>
          </div>

          {data && data.messages.length === 0 ? (
            <p className="text-muted-foreground mt-4 text-sm">
              Nenhuma mensagem ainda. As que chegarem pelo formulário aparecem aqui.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data?.messages.slice(0, 3).map((message) => (
                <li key={message._id}>
                  <Link
                    href="/admin/mensagens"
                    className="border-border hover:border-primary/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <span className="border-border text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full border text-xs">
                      {message.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{message.name}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {message.subject ? `${message.subject} · ` : ""}
                        {message.message}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {formatDate(message.createdAt)}
                      </span>
                      {!message.read ? (
                        <span className="bg-primary size-2 rounded-full" aria-label="Não lida" />
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-border bg-surface/50 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg">Projetos recentes</h2>
            <Link
              href="/admin/projetos"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Ver todos
            </Link>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data?.projects.map((project) => {
              const cover = safeImageUrl(project.coverImage);
              return (
                <li key={project._id}>
                  <Link href={`/admin/projetos/${project._id}`} className="group block">
                    <span className="bg-muted relative block aspect-[4/3] overflow-hidden rounded-lg">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </span>
                    <span className="mt-2 block truncate text-sm">{project.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <footer className="text-muted-foreground border-border border-t pt-4 text-xs">
        © {new Date().getFullYear()} Sami da Silva Studio. Todos os direitos reservados.
      </footer>
    </div>
  );
}

interface ShortcutProps {
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  external?: boolean;
}

function Shortcut({ href, icon: Icon, title, description, external }: ShortcutProps) {
  return (
    <li>
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        className="hover:bg-muted/60 group flex items-center gap-4 rounded-lg p-3 transition-colors"
      >
        <Icon className="text-primary size-5 shrink-0" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm">{title}</span>
          <span className="text-muted-foreground block text-xs">{description}</span>
        </span>
        <ChevronRight
          className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  );
}
