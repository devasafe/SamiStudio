import { SignJWT, jwtVerify } from "jose";
import { ApiError } from "@/lib/api/errors";

export interface SessionPayload {
  sub: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
}

export const SESSION_COOKIE = "sami_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(503, "Autenticação não configurada (JWT_SECRET ausente).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ name: payload.name, email: payload.email, role: payload.role })
    .setSubject(payload.sub)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "EDITOR")
    ) {
      throw new Error("payload inválido");
    }
    return { sub: payload.sub, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    throw new ApiError(401, "Sessão inválida ou expirada.");
  }
}
