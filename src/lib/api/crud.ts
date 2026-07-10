import { revalidatePath } from "next/cache";
import type { NextRequest, NextResponse } from "next/server";
import type { Model, QueryFilter, UpdateQuery } from "mongoose";
import type { ZodType } from "zod";
import { requireAuth } from "@/lib/auth/guard";
import { connectDb } from "@/lib/db";
import { ApiError } from "./errors";
import { logAction } from "./audit";
import { ok, withErrorHandling } from "./response";

interface SoftDeletable {
  deletedAt?: Date | null;
}

interface CrudConfig<T extends SoftDeletable> {
  entity: string;
  model: Model<T>;
  createSchema: ZodType;
  updateSchema: ZodType;
  sort?: Record<string, 1 | -1>;
}

/**
 * CRUD padrão (Docs/11): listagem pública, mutações autenticadas,
 * soft delete (Docs/10) e log administrativo (Docs/12).
 */
export function createCrud<T extends SoftDeletable>({
  entity,
  model,
  createSchema,
  updateSchema,
  sort,
}: CrudConfig<T>) {
  const active = { deletedAt: null } as QueryFilter<T>;

  async function list(): Promise<NextResponse> {
    return withErrorHandling(async () => {
      await connectDb();
      const docs = await model.find(active).sort(sort ?? { order: 1, createdAt: -1 });
      return ok(docs);
    });
  }

  async function create(request: NextRequest): Promise<NextResponse> {
    return withErrorHandling(async () => {
      const session = await requireAuth(request);
      await connectDb();
      const data = createSchema.parse(await request.json()) as Partial<T>;
      const doc = await model.create(data);
      await logAction(session, "create", entity, String(doc._id));
      // Conteúdo mudou: regenera as páginas do site.
      revalidatePath("/", "layout");
      return ok(doc, "Criado com sucesso.", undefined, 201);
    });
  }

  async function update(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      const session = await requireAuth(request);
      await connectDb();
      const data = updateSchema.parse(await request.json());
      const doc = await model.findOneAndUpdate(
        { _id: id, ...active } as QueryFilter<T>,
        data as UpdateQuery<T>,
        { new: true }
      );
      if (!doc) {
        throw new ApiError(404, "Registro não encontrado.");
      }
      await logAction(session, "update", entity, id);
      // Conteúdo mudou: regenera as páginas do site.
      revalidatePath("/", "layout");
      return ok(doc, "Atualizado com sucesso.");
    });
  }

  async function softDelete(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      const session = await requireAuth(request);
      await connectDb();
      const doc = await model.findOneAndUpdate(
        { _id: id, ...active } as QueryFilter<T>,
        { deletedAt: new Date() } as UpdateQuery<T>,
        { new: true }
      );
      if (!doc) {
        throw new ApiError(404, "Registro não encontrado.");
      }
      await logAction(session, "delete", entity, id);
      // Conteúdo mudou: regenera as páginas do site.
      revalidatePath("/", "layout");
      return ok(null, "Removido com sucesso.");
    });
  }

  return { list, create, update, softDelete };
}
