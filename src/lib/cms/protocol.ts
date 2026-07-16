/**
 * Protocolo entre o painel (/admin/editor) e o site dentro do iframe.
 * A conferência de confiança é função pura para poder ser testada sem DOM.
 */
export type CmsMessage =
  /** Painel → site: pode ativar a edição. */
  | { type: "cms:enable" }
  /** Site → painel: overlay montado. */
  | { type: "cms:ready" }
  /** Site → painel: a pessoa clicou num elemento editável. */
  | { type: "cms:select"; ref: string; value: string; count: number }
  /** Painel → site: aplica o novo valor na hora (otimista). */
  | { type: "cms:patch"; ref: string; value: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCmsMessage(data: unknown): data is CmsMessage {
  if (!isRecord(data) || typeof data.type !== "string") {
    return false;
  }
  switch (data.type) {
    case "cms:enable":
    case "cms:ready":
      return true;
    case "cms:patch":
      return typeof data.ref === "string" && typeof data.value === "string";
    case "cms:select":
      return (
        typeof data.ref === "string" &&
        typeof data.value === "string" &&
        typeof data.count === "number"
      );
    default:
      return false;
  }
}

export interface TrustedInput {
  origin: string;
  source: unknown;
  data: unknown;
}

/**
 * Só aceita mensagem da mesma origem, vinda da janela esperada e dentro do
 * protocolo. A proteção real dos dados é a sessão exigida pela API — isto
 * evita que outra página embutida converse com o editor.
 */
export function isTrustedEditMessage(
  event: TrustedInput,
  expectedOrigin: string,
  expectedSource: unknown
): boolean {
  return (
    event.origin === expectedOrigin && event.source === expectedSource && isCmsMessage(event.data)
  );
}
