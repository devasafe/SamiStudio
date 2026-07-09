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

export async function GET() {
  return crud.list();
}

export async function POST(request: NextRequest) {
  return crud.create(request);
}
