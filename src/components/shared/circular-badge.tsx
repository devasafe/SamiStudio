interface CircularBadgeProps {
  /** Texto que corre pela borda (repetido e em maiúsculas). */
  label: string;
  /** Id único do path — evita colisão quando há mais de um selo na página. */
  id: string;
  className?: string;
}

/**
 * Selo circular: o texto corre pela borda girando devagar e um "+" fica fixo no
 * centro. Puramente decorativo (aria-hidden).
 */
export function CircularBadge({ label, id, className }: CircularBadgeProps) {
  const ring = `${label} · ${label} · `.toUpperCase();

  return (
    <div className={className} aria-hidden>
      <div className="relative h-full w-full">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full animate-[spin_30s_linear_infinite] motion-reduce:animate-none"
        >
          <defs>
            <path id={id} d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" fill="none" />
          </defs>
          <text
            fill="#cf5a18"
            fontSize="11"
            letterSpacing="2.5"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <textPath href={`#${id}`}>{ring}</textPath>
          </text>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg text-[#cf5a18]">
          +
        </span>
      </div>
    </div>
  );
}
