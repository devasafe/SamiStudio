import Link from "next/link";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: number | null;
  /** Linha de apoio (ex.: "2 novas hoje"); some quando não há o que dizer. */
  hint?: string;
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

/** Cartão de número do dashboard: ícone, rótulo, contagem e uma linha de apoio. */
export function StatCard({ label, value, hint, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="border-border bg-surface/50 hover:border-primary/40 flex items-start gap-4 rounded-xl border p-5 transition-colors"
    >
      <span className="border-border text-primary flex size-11 shrink-0 items-center justify-center rounded-lg border">
        <Icon className="size-5" strokeWidth={1.5} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="text-muted-foreground block text-sm">{label}</span>
        {/* "—" enquanto carrega: melhor que um zero que parece dado real. */}
        <span className="font-heading mt-1 block text-3xl leading-none">{value ?? "—"}</span>
        {hint ? <span className="text-primary mt-2 block text-xs">{hint}</span> : null}
      </span>
    </Link>
  );
}
