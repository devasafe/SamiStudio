import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { connectDb } from "@/lib/db";
import { faqCreateSchema, faqUpdateSchema } from "@/lib/validation";
import { Faq } from "@/models/faq";

const crud = createCrud({
  entity: "Faq",
  model: Faq,
  createSchema: faqCreateSchema,
  updateSchema: faqUpdateSchema,
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Uma pergunta pelo id — é o que a tela de edição do painel carrega.
 *
 * Aberto como a listagem (`GET /faq`), que já devolve todas: exigir sessão
 * aqui não protegeria nada que não esteja público ali.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    await connectDb();
    const doc = await Faq.findOne({ _id: id, deletedAt: null }).lean();
    if (!doc) {
      throw new ApiError(404, "Pergunta não encontrada.");
    }
    return ok(doc);
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  // Corpo só com `deleted: false` = tirar da lixeira; o resto é edição normal.
  if (request.nextUrl.searchParams.get("restore") === "true") {
    return crud.restore(request, id);
  }
  return crud.update(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  // Sem ?permanent, vai para a lixeira e dá para voltar.
  if (request.nextUrl.searchParams.get("permanent") === "true") {
    return crud.destroy(request, id);
  }
  return crud.softDelete(request, id);
}
