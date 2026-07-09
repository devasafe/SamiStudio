import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Seção com ritmo editorial generoso (Manual da Marca, 2026-07-09):
 * 80px mobile, 120px tablet, 160px desktop.
 */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-30 lg:py-40", className)}>
      {children}
    </section>
  );
}
