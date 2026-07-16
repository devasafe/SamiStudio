import type { SVGProps } from "react";

/**
 * Glifo do Instagram. Ícone de marca não existe no Lucide (ver index.ts),
 * então vive aqui, desenhado no mesmo traço do conjunto (outline, 24×24).
 */
export function Instagram({ strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
