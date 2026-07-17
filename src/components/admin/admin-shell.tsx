"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { api, AdminApiError } from "@/components/admin/api-client";
import {
  Briefcase,
  ChevronRight,
  CircleHelp,
  FolderOpen,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  SquarePen,
  Tags,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/editor", label: "Editar site", icon: SquarePen },
  { href: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { href: "/admin/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/servicos", label: "Serviços", icon: Briefcase },
  { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquare },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

interface Session {
  name: string;
  email: string;
}

/**
 * Estrutura do painel (Docs/12): sidebar + área de conteúdo.
 *
 * O tema dark quente da marca é aplicado aqui, na raiz: as telas usam os
 * tokens (bg-surface, border-border...), então herdam sozinhas.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await api<Session>("/auth/me");
        setSession(data);
      } catch (err) {
        // Sessão inválida já é tratada pelo api-client; aqui só evita quebrar.
        if (!(err instanceof AdminApiError)) {
          throw err;
        }
      }
    })();
  }, []);

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <div className="theme-dark-warm bg-background text-foreground flex min-h-svh">
      <aside className="border-border flex w-64 shrink-0 flex-col border-r">
        <div className="border-border border-b px-6 py-6">
          <Link href="/admin" className="font-heading text-lg tracking-tight">
            Sami da Silva Studio
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>

        {/* Perfil + sair */}
        <div className="border-border border-t p-3">
          <button
            type="button"
            onClick={logout}
            className="hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors"
          >
            <span className="border-primary/40 text-primary flex size-10 shrink-0 items-center justify-center rounded-full border">
              {(session?.name ?? "?").charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{session?.name ?? "Carregando..."}</span>
              <span className="text-muted-foreground block text-xs">Sair</span>
            </span>
            <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}

function NavLink({ href, label, icon: Icon, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Icon
        className={cn("size-4.5 shrink-0", active && "text-primary")}
        strokeWidth={1.5}
        aria-hidden
      />
      {label}
    </Link>
  );
}
