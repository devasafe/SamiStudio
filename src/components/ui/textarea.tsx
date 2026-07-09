import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Specs do Design System (Docs/08): radius 12px, padding 16px, foco sem glow exagerado.
        "border-input placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-ring/40 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-32 w-full rounded-md border bg-transparent px-4 py-3 text-base transition-colors outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-1",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
