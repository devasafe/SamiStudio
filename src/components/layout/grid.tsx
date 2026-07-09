import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Grid responsivo do Design System (Docs/08):
 * 4 colunas mobile, 8 tablet, 12 desktop, gutter de 32px.
 */
export function Grid({ children, className }: GridProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-8 md:grid-cols-8 lg:grid-cols-12", className)}>
      {children}
    </div>
  );
}
