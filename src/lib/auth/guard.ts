import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./jwt";

/** Exige sessão válida (cookie httpOnly). Lança 401 caso contrário. */
export async function requireAuth(request: NextRequest): Promise<SessionPayload> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    throw new ApiError(401, "Não autenticado.");
  }
  return verifySession(token);
}

/** Exige papel ADMIN (Docs/10 — roles ADMIN/EDITOR). */
export async function requireAdmin(request: NextRequest): Promise<SessionPayload> {
  const session = await requireAuth(request);
  if (session.role !== "ADMIN") {
    throw new ApiError(403, "Acesso restrito a administradores.");
  }
  return session;
}
