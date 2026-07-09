import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Seção com o ritmo vertical do Design System (Docs/08):
 * 64px mobile, 80px tablet, 120px desktop.
 */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-20 lg:py-30", className)}>
      {children}
    </section>
  );
}
