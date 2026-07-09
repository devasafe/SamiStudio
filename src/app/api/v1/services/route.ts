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

export async function GET() {
  return crud.list();
}

export async function POST(request: NextRequest) {
  return crud.create(request);
}
