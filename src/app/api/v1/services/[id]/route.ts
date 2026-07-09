import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return crud.update(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return crud.softDelete(request, id);
}
