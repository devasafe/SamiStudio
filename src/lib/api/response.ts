import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./errors";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/** Resposta de sucesso no padrão do Docs/11. */
export function ok<T>(data: T, message = "OK", meta?: Meta, status = 200): NextResponse {
  return NextResponse.json({ success: true, message, data, ...(meta ? { meta } : {}) }, { status });
}

/** Resposta de erro no padrão do Docs/11. */
export function fail(message: string, statusCode = 400, error?: string): NextResponse {
  return NextResponse.json(
    { success: false, message, error: error ?? message, statusCode },
    { status: statusCode }
  );
}

type Handler = () => Promise<NextResponse>;

/**
 * Executa um handler com tratamento de erro padronizado (Docs/21):
 * ApiError → status próprio; ZodError → 422; demais → 500 sem vazar detalhes.
 */
export async function withErrorHandling(handler: Handler): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.message, error.statusCode);
    }
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => `${issue.path.join(".") || "corpo"}: ${issue.message}`)
        .join("; ");
      return fail("Dados inválidos.", 422, details);
    }
    console.error("[api]", error);
    return fail("Erro interno.", 500);
  }
}
