import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
import { messageCreateSchema, messageUpdateSchema } from "@/lib/validation";
import { Message } from "@/models/message";

// Marcar lida e arquivar; o envio em si vive na rota pública (../route.ts).
const crud = createCrud({
  entity: "Message",
  model: Message,
  createSchema: messageCreateSchema,
  updateSchema: messageUpdateSchema,
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
