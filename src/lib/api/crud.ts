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
/** Sessão opcional: só para decidir se a lixeira pode ser mostrada. */
async function hasSession(request?: NextRequest): Promise<boolean> {
  if (!request) {
    return false;
  }
  try {
    await requireAuth(request);
    return true;
  } catch {
    return false;
  }
}

export function createCrud<T extends SoftDeletable>({
  entity,
  model,
  createSchema,
  updateSchema,
  sort,
}: CrudConfig<T>) {
  const active = { deletedAt: null } as QueryFilter<T>;

  /**
   * Lista os registros ativos. Com `?deleted=true` **e** sessão, lista a
   * lixeira — o site público nunca pode enxergar o que foi removido, então o
   * parâmetro sozinho não basta.
   */
  async function list(request?: NextRequest): Promise<NextResponse> {
    return withErrorHandling(async () => {
      await connectDb();
      const wantsTrash = request?.nextUrl.searchParams.get("deleted") === "true";
      const authorized = wantsTrash && (await hasSession(request));
      const filter = authorized ? ({ deletedAt: { $ne: null } } as QueryFilter<T>) : active;
      const docs = await model.find(filter).sort(sort ?? { order: 1, createdAt: -1 });
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

  /** Tira da lixeira. Precisa achar um registro removido — daí não reusar update. */
  async function restore(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      const session = await requireAuth(request);
      await connectDb();
      const doc = await model.findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } } as QueryFilter<T>,
        { deletedAt: null } as UpdateQuery<T>,
        { new: true }
      );
      if (!doc) {
        throw new ApiError(404, "Registro não encontrado na lixeira.");
      }
      await logAction(session, "update", entity, id);
      revalidatePath("/", "layout");
      return ok(doc, "Restaurado com sucesso.");
    });
  }

  /** Apaga de vez. Sem volta: as telas só oferecem isto de dentro da lixeira. */
  async function destroy(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      const session = await requireAuth(request);
      await connectDb();
      const doc = await model.findByIdAndDelete(id);
      if (!doc) {
        throw new ApiError(404, "Registro não encontrado.");
      }
      await logAction(session, "delete", entity, id);
      revalidatePath("/", "layout");
      return ok(null, "Apagado definitivamente.");
    });
  }

  return { list, create, update, softDelete, restore, destroy };
}
