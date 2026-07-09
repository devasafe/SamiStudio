import type { NextRequest } from "next/server";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    return ok({ name: session.name, email: session.email, role: session.role });
  });
}
