import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
import { testimonialCreateSchema, testimonialUpdateSchema } from "@/lib/validation";
import { Testimonial } from "@/models/testimonial";

const crud = createCrud({
  entity: "Testimonial",
  model: Testimonial,
  createSchema: testimonialCreateSchema,
  updateSchema: testimonialUpdateSchema,
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
