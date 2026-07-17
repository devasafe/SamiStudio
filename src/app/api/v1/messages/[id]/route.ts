import type { NextRequest } from "next/server";
import { logAction } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { connectDb } from "@/lib/db";
import { messageUpdateSchema } from "@/lib/validation";
import { Message } from "@/models/message";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Marca lida/não lida e arquiva/desarquiva.
 *
 * Escrito à mão em vez de usar o crud padrão porque desarquivar precisa achar
 * uma mensagem já arquivada, e o crud só enxerga o que tem `deletedAt: null`.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    const { id } = await context.params;
    await connectDb();

    const data = messageUpdateSchema.parse(await request.json());
    const update: Record<string, unknown> = {};
    if (data.read !== undefined) {
      update.read = data.read;
    }
    if (data.archived !== undefined) {
      update.deletedAt = data.archived ? new Date() : null;
    }
    if (Object.keys(update).length === 0) {
      throw new ApiError(422, "Nada para atualizar.");
    }

    const doc = await Message.findByIdAndUpdate(id, update, { new: true });
    if (!doc) {
      throw new ApiError(404, "Mensagem não encontrada.");
    }
    await logAction(session, "update", "Message", id);
    return ok(doc, data.archived === false ? "Mensagem restaurada." : "Mensagem atualizada.");
  });
}

/**
 * Arquiva (padrão) ou apaga de vez (`?permanent=true`).
 *
 * O apagar definitivo não tem volta: é oferecido só a partir da aba de
 * arquivadas, para ninguém destruir uma mensagem com um clique na lista
 * principal.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    const { id } = await context.params;
    await connectDb();

    const permanent = request.nextUrl.searchParams.get("permanent") === "true";
    if (permanent) {
      const doc = await Message.findByIdAndDelete(id);
      if (!doc) {
        throw new ApiError(404, "Mensagem não encontrada.");
      }
      await logAction(session, "delete", "Message", id);
      return ok(null, "Mensagem apagada definitivamente.");
    }

    const doc = await Message.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) {
      throw new ApiError(404, "Mensagem não encontrada.");
    }
    await logAction(session, "delete", "Message", id);
    return ok(null, "Mensagem arquivada.");
  });
}
