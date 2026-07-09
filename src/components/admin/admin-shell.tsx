"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/components/admin/api-client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projetos", label: "Projetos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/traducoes", label: "Traduções" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

/** Estrutura do painel (Docs/12): sidebar + área de conteúdo, foco em produtividade. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <div className="bg-surface flex min-h-svh">
      <aside className="border-border bg-background flex w-60 shrink-0 flex-col border-r">
        <div className="border-border border-b px-6 py-5">
          <Link href="/admin" className="font-heading text-small tracking-tight">
            Sami da Silva <span className="text-muted-foreground">Studio</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-border border-t p-3">
          <button
            type="button"
            onClick={logout}
            className="text-muted-foreground hover:bg-muted hover:text-foreground block w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
