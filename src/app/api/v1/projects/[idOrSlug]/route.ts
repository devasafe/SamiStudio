import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { logAction } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";
import { connectDb } from "@/lib/db";
import { projectUpdateSchema } from "@/lib/validation";
import { Project } from "@/models/project";

interface RouteContext {
  params: Promise<{ idOrSlug: string }>;
}

/** Sessão opcional: público vê só publicados; admin vê qualquer status. */
async function optionalSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

/**
 * GET do projeto. Público: por slug, apenas publicado, com categoria populada.
 * Admin (autenticado): por id OU slug, qualquer status, `categoryId` como string
 * (sem popular) para alimentar o formulário de edição.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { idOrSlug } = await context.params;
    await connectDb();

    if (await optionalSession(request)) {
      const filter = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
      const project = await Project.findOne(filter).lean();
      if (!project) {
        throw new ApiError(404, "Projeto não encontrado.");
      }
      return ok(project);
    }

    const project = await Project.findOne({
      slug: idOrSlug,
      status: "published",
      deletedAt: null,
    }).populate("categoryId");
    if (!project) {
      throw new ApiError(404, "Projeto não encontrado.");
    }
    return ok(project);
  });
}

/** PATCH por id (Docs/11: PATCH /projects/:id). */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { idOrSlug } = await context.params;
    if (!isValidObjectId(idOrSlug)) {
      throw new ApiError(400, "Id inválido.");
    }
    const session = await requireAuth(request);
    await connectDb();
    const { deleted, ...data } = projectUpdateSchema.parse(await request.json());

    // Restaurar precisa achar um projeto já excluído — por isso o filtro só
    // exige deletedAt: null quando não é uma restauração.
    const filter = deleted === false ? { _id: idOrSlug } : { _id: idOrSlug, deletedAt: null };
    const update = deleted === false ? { ...data, deletedAt: null } : data;

    const project = await Project.findOneAndUpdate(filter, update, { new: true });
    if (!project) {
      throw new ApiError(404, "Projeto não encontrado.");
    }
    await logAction(session, "update", "Project", idOrSlug);
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(project, "Projeto atualizado.");
  });
}

/**
 * Manda para a lixeira (padrão) ou apaga de vez (`?permanent=true`).
 *
 * A exclusão não mexe mais no `status`: ele é a decisão editorial (rascunho,
 * publicado, arquivado) e antes era sobrescrito por "archived" ao excluir —
 * um projeto publicado, excluído por engano, voltaria despublicado da lixeira
 * sem ninguém entender por quê.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { idOrSlug } = await context.params;
    if (!isValidObjectId(idOrSlug)) {
      throw new ApiError(400, "Id inválido.");
    }
    const session = await requireAuth(request);
    await connectDb();

    if (request.nextUrl.searchParams.get("permanent") === "true") {
      const project = await Project.findByIdAndDelete(idOrSlug);
      if (!project) {
        throw new ApiError(404, "Projeto não encontrado.");
      }
      await logAction(session, "delete", "Project", idOrSlug);
      revalidatePath("/", "layout");
      return ok(null, "Projeto apagado definitivamente.");
    }

    const project = await Project.findOneAndUpdate(
      { _id: idOrSlug, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!project) {
      throw new ApiError(404, "Projeto não encontrado.");
    }
    await logAction(session, "delete", "Project", idOrSlug);
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(null, "Projeto movido para a lixeira.");
  });
}
