import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { logAction } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { connectDb } from "@/lib/db";
import { projectUpdateSchema } from "@/lib/validation";
import { Project } from "@/models/project";

interface RouteContext {
  params: Promise<{ idOrSlug: string }>;
}

/** GET público por slug (Docs/11: GET /projects/:slug). */
export async function GET(_request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { idOrSlug } = await context.params;
    await connectDb();
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
    const data = projectUpdateSchema.parse(await request.json());
    const project = await Project.findOneAndUpdate({ _id: idOrSlug, deletedAt: null }, data, {
      new: true,
    });
    if (!project) {
      throw new ApiError(404, "Projeto não encontrado.");
    }
    await logAction(session, "update", "Project", idOrSlug);
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(project, "Projeto atualizado.");
  });
}

/** DELETE por id — soft delete (Docs/10). */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { idOrSlug } = await context.params;
    if (!isValidObjectId(idOrSlug)) {
      throw new ApiError(400, "Id inválido.");
    }
    const session = await requireAuth(request);
    await connectDb();
    const project = await Project.findOneAndUpdate(
      { _id: idOrSlug, deletedAt: null },
      { deletedAt: new Date(), status: "archived" },
      { new: true }
    );
    if (!project) {
      throw new ApiError(404, "Projeto não encontrado.");
    }
    await logAction(session, "delete", "Project", idOrSlug);
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(null, "Projeto removido.");
  });
}
