import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { connectDb } from "@/lib/db";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validation";
import { Category } from "@/models/category";

const crud = createCrud({
  entity: "Category",
  model: Category,
  createSchema: categoryCreateSchema,
  updateSchema: categoryUpdateSchema,
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Um registro pelo id — é o que a tela de edição do painel carrega.
 *
 * Aberto como a listagem (`GET /categories`), que já devolve todos:
 * exigir sessão aqui não protegeria nada que não esteja público ali.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    await connectDb();
    const doc = await Category.findOne({ _id: id, deletedAt: null }).lean();
    if (!doc) {
      throw new ApiError(404, "Categoria não encontrada.");
    }
    return ok(doc);
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return crud.update(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return crud.softDelete(request, id);
}
