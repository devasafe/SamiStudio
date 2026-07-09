import type { NextRequest } from "next/server";
import { createCrud } from "@/lib/api/crud";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validation";
import { Category } from "@/models/category";

const crud = createCrud({
  entity: "Category",
  model: Category,
  createSchema: categoryCreateSchema,
  updateSchema: categoryUpdateSchema,
});

export async function GET() {
  return crud.list();
}

export async function POST(request: NextRequest) {
  return crud.create(request);
}
