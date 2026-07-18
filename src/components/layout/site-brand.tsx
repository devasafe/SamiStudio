import Image from "next/image";
import { safeImageUrl } from "@/lib/images";
import { splitSiteName } from "@/lib/site-name";
import { cn } from "@/lib/utils";

interface SiteBrandProps {
  /** Nome do site (já com fallback resolvido pelo consumidor). */
  name: string;
  /** URL da logo enviada no painel; sem ela, mostra só o nome. */
  logo?: string;
  /** Classe da última palavra do nome (o tom mais claro). */
  dimClassName: string;
  className?: string;
}

/**
 * Marca do site: a logo (quando enviada) ao lado do nome, com a última palavra
 * do nome num tom mais claro. Usada na navbar e no rodapé. Só monta o texto e a
 * imagem — quem consome envolve num link/parágrafo e define as cores.
 */
export function SiteBrand({ name, logo, dimClassName, className }: SiteBrandProps) {
  const { lead, last } = splitSiteName(name);
  const src = safeImageUrl(logo);

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {src ? (
        <Image src={src} alt="" width={28} height={28} className="size-7 shrink-0 object-contain" />
      ) : null}
      <span>
        {lead}
        {last ? <span className={dimClassName}> {last}</span> : null}
      </span>
    </span>
  );
}
