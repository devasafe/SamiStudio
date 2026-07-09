import { Log } from "@/models/log";
import type { SessionPayload } from "@/lib/auth/jwt";

/**
 * Registra ação administrativa (Docs/12 — Logs).
 * Falha de log não derruba a operação principal.
 */
export async function logAction(
  session: SessionPayload,
  action: "create" | "update" | "delete",
  entity: string,
  entityId?: string
): Promise<void> {
  try {
    await Log.create({ user: session.sub, action, entity, entityId });
  } catch (error) {
    console.error("[audit] falha ao registrar log:", error);
  }
}
