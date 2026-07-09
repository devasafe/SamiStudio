import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return crud.update(request, id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return crud.softDelete(request, id);
}
