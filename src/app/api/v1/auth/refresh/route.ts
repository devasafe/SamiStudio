import type { NextRequest } from "next/server";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/auth/jwt";

/** Renova a sessão a partir de um cookie ainda válido. */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    const token = await signSession(session);
    const response = ok(null, "Sessão renovada.");
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  });
}
