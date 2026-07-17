import { cn } from "@/lib/utils";

/**
 * Onde um grupo de campos aparece. `browser` é a aba do navegador (favicon e
 * título), que fica fora da página; `none` é o que só existe no Google.
 */
export type PageRegion = "browser" | "nav" | "hero" | "content" | "footer" | "none";

interface PageDiagramProps {
  region: PageRegion;
  className?: string;
}

/**
 * Miniatura esquemática de uma página, com a região do grupo acesa.
 *
 * É um desenho, não um retrato do site: uma captura de tela real passaria a
 * mentir no dia seguinte a qualquer mudança de layout, sem ninguém perceber.
 * Aqui só se afirma "isto fica no topo / no meio / no rodapé", que continua
 * verdade enquanto o site tiver essa anatomia.
 */
export function PageDiagram({ region, className }: PageDiagramProps) {
  const on = (target: PageRegion) => (region === target ? "fill-primary" : "fill-muted-foreground");
  const dim = (target: PageRegion) => (region === target ? 1 : 0.35);

  if (region === "browser") {
    // O favicon e o título não estão na página: vivem na aba do navegador, que
    // é o que este desenho mostra.
    return (
      <svg
        viewBox="0 0 48 36"
        className={cn("h-9 w-12", className)}
        aria-hidden
        role="presentation"
      >
        <rect x="0.5" y="0.5" width="47" height="35" rx="3" className="stroke-border" fill="none" />
        {/* Aba com favicon + título */}
        <path
          d="M4 10 L4 6 Q4 4 6 4 L24 4 Q26 4 26 6 L26 10 Z"
          className="fill-primary"
          opacity={0.18}
        />
        <path
          d="M4 10 L4 6 Q4 4 6 4 L24 4 Q26 4 26 6 L26 10"
          className="stroke-primary"
          fill="none"
        />
        <circle cx="8.5" cy="7" r="1.8" className="fill-primary" />
        <rect x="12" y="6" width="11" height="2" rx="1" className="fill-primary" opacity={0.7} />
        {/* Página, apagada: o campo não muda nada aqui dentro */}
        <line x1="4" y1="10" x2="44" y2="10" className="stroke-border" />
        <rect
          x="4"
          y="14"
          width="40"
          height="18"
          rx="1"
          className="fill-muted-foreground"
          opacity={0.18}
        />
      </svg>
    );
  }

  if (region === "none") {
    // SEO não tem lugar na página — o resultado aparece no Google, e a prévia
    // ao lado dos campos mostra isso melhor que um desenho.
    return (
      <svg
        viewBox="0 0 48 36"
        className={cn("h-9 w-12", className)}
        aria-hidden
        role="presentation"
      >
        <rect x="0.5" y="0.5" width="47" height="35" rx="3" className="stroke-border" fill="none" />
        <circle
          cx="16"
          cy="18"
          r="5"
          className="stroke-muted-foreground"
          fill="none"
          opacity={0.5}
        />
        <line
          x1="20"
          y1="22"
          x2="25"
          y2="27"
          className="stroke-muted-foreground"
          strokeWidth={1.5}
          opacity={0.5}
        />
        <rect x="29" y="14" width="14" height="2.5" rx="1" className="fill-primary" />
        <rect
          x="29"
          y="19"
          width="11"
          height="2"
          rx="1"
          className="fill-muted-foreground"
          opacity={0.35}
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 36" className={cn("h-9 w-12", className)} aria-hidden role="presentation">
      <rect x="0.5" y="0.5" width="47" height="35" rx="3" className="stroke-border" fill="none" />

      {/* Barra do topo */}
      <rect x="4" y="4" width="40" height="4" rx="1" className={on("nav")} opacity={dim("nav")} />

      {/* Bloco do hero */}
      <rect
        x="4"
        y="10"
        width="24"
        height="7"
        rx="1"
        className={on("hero")}
        opacity={dim("hero")}
      />

      {/* Miolo */}
      <rect
        x="4"
        y="19"
        width="18"
        height="8"
        rx="1"
        className={on("content")}
        opacity={dim("content")}
      />
      <rect
        x="24"
        y="19"
        width="20"
        height="8"
        rx="1"
        className={on("content")}
        opacity={dim("content")}
      />

      {/* Rodapé */}
      <rect
        x="4"
        y="29"
        width="40"
        height="3"
        rx="1"
        className={on("footer")}
        opacity={dim("footer")}
      />
    </svg>
  );
}
