import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { assertRateLimit } from "@/lib/auth/rate-limit";
import { connectDb } from "@/lib/db";
import { messageCreateSchema } from "@/lib/validation";
import { Message } from "@/models/message";

/**
 * Listagem das mensagens do formulário — SEMPRE autenticada: são dados
 * pessoais de quem escreveu (nome, e-mail, telefone), nunca públicos.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAuth(request);
    await connectDb();
    const docs = await Message.find({ deletedAt: null }).sort({ createdAt: -1 });
    return ok(docs);
  });
}

/** Envio público do formulário de contato. */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Limita o abuso do endpoint aberto: 5 envios por IP a cada 10 min.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    assertRateLimit(`message:${ip}`, 5, 600_000);

    const { website, ...data } = messageCreateSchema.parse(await request.json());
    // Honeypot: campo escondido no formulário, invisível para gente.
    if (website) {
      throw new ApiError(400, "Envio inválido.");
    }

    await connectDb();
    const doc = await Message.create(data);
    return ok({ id: String(doc._id) }, "Mensagem enviada com sucesso.", undefined, 201);
  });
}
