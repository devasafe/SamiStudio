import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { logAction } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { getCloudinary } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      throw new ApiError(400, "Id inválido.");
    }
    const session = await requireAuth(request);
    await connectDb();

    const media = await Media.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!media) {
      throw new ApiError(404, "Mídia não encontrada.");
    }

    // Remove do Cloudinary; o registro permanece como soft delete (Docs/10).
    await getCloudinary().uploader.destroy(media.publicId);
    await logAction(session, "delete", "Media", id);

    return ok(null, "Mídia removida.");
  });
}
