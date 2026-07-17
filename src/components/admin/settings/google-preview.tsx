/** Limites que o Google costuma cortar (aproximados, em caracteres). */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

interface GooglePreviewProps {
  title: string;
  description: string;
  /** Caminho da página no site (ex.: "/sobre"). */
  path: string;
  siteUrl: string;
}

/** Corta como o Google corta: no limite, com reticências. */
function clamp(text: string, limit: number): { text: string; cut: boolean } {
  if (text.length <= limit) {
    return { text, cut: false };
  }
  return { text: `${text.slice(0, limit).trimEnd()}…`, cut: true };
}

/**
 * Como a página aparece no resultado de busca, montado com o que está sendo
 * digitado. É a única forma honesta de mostrar o efeito destes campos: eles não
 * têm lugar nenhum na tela do site.
 */
export function GooglePreview({ title, description, path, siteUrl }: GooglePreviewProps) {
  const shownTitle = clamp(title, TITLE_LIMIT);
  const shownDescription = clamp(description, DESCRIPTION_LIMIT);
  const domain = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <p className="text-muted-foreground mb-3 text-xs">Como aparece no Google</p>

      {/* Cores do próprio Google: a prévia só serve se parecer com o resultado. */}
      <div className="rounded-md bg-white p-4">
        <p className="truncate text-xs text-[#202124]">
          {domain}
          <span className="text-[#5f6368]">
            {path === "/" ? "" : ` › ${path.replace(/^\//, "")}`}
          </span>
        </p>
        <p className="mt-1 truncate text-lg leading-snug text-[#1a0dab]">
          {shownTitle.text || "Sem título"}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">
          {shownDescription.text || "Sem descrição."}
        </p>
      </div>

      {shownTitle.cut || shownDescription.cut ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {shownTitle.cut ? `O título passa de ${TITLE_LIMIT} caracteres. ` : ""}
          {shownDescription.cut ? `A descrição passa de ${DESCRIPTION_LIMIT} caracteres. ` : ""}O
          Google corta o que excede — as reticências acima mostram onde.
        </p>
      ) : null}
    </div>
  );
}
