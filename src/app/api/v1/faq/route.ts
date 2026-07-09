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

export async function GET() {
  return crud.list();
}

export async function POST(request: NextRequest) {
  return crud.create(request);
}
