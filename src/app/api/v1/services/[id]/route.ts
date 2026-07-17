import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { connectDb } from "@/lib/db";
import { serviceCreateSchema, serviceUpdateSchema } from "@/lib/validation";
import { Service } from "@/models/service";

const crud = createCrud({
  entity: "Service",
  model: Service,
  createSchema: serviceCreateSchema,
  updateSchema: serviceUpdateSchema,
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Um serviço pelo id — é o que a tela de edição do painel carrega.
 *
 * Aberto como a listagem (`GET /services`), que já devolve todos os serviços:
 * exigir sessão aqui não protegeria nada que não esteja público ali.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    await connectDb();
    const service = await Service.findOne({ _id: id, deletedAt: null }).lean();
    if (!service) {
      throw new ApiError(404, "Serviço não encontrado.");
    }
    return ok(service);
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
