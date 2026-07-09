import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container central do grid (Docs/08): largura máxima de 1280px.
 */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-12", className)}>{children}</div>;
}
