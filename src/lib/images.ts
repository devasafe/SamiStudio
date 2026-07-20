/** Hosts permitidos no next/image (next.config.ts). */
const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com"];

const MIME_BY_EXTENSION: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

/**
 * Tipo MIME a partir da extensão da URL, para declarar no `<link rel="icon">`.
 *
 * Sem `type`, o navegador precisa baixar o arquivo para descobrir se sabe
 * exibi-lo; com ele, escolhe o ícone certo já na leitura do `<head>`.
 * Extensão desconhecida devolve undefined — melhor omitir o atributo do que
 * declarar um tipo errado, que faria o navegador descartar o ícone.
 */
export function imageMimeType(url: string): string | undefined {
  const extension = new URL(url).pathname.split(".").pop()?.toLowerCase();
  return extension ? MIME_BY_EXTENSION[extension] : undefined;
}

/**
 * Só deixa passar URLs de imagem dos hosts configurados.
 * Qualquer outra coisa (link de página, host desconhecido) vira undefined
 * e o site exibe o placeholder em vez de quebrar.
 */
export function safeImageUrl(url: string | undefined | null): string | undefined {
  if (!url) {
    return undefined;
  }
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(hostname)) {
      return url;
    }
  } catch {
    // URL inválida
  }
  return undefined;
}
