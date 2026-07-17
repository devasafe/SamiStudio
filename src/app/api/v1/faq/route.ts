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

export async function GET(request: NextRequest) {
  return crud.list(request);
}

export async function POST(request: NextRequest) {
  return crud.create(request);
}
