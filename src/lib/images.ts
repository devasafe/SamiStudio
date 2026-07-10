/** Hosts permitidos no next/image (next.config.ts). */
const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com"];

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
