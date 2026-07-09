import type { NextRequest } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { logAction } from "@/lib/api/audit";
import { ApiError } from "@/lib/api/errors";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { getCloudinary } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Arquivo ausente (campo 'file').");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(415, "Formato não suportado. Use JPG, PNG, WebP ou AVIF.");
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new ApiError(413, "Arquivo maior que 10 MB.");
    }

    const folder = String(formData.get("folder") ?? "samistudio");
    const alt = formData.get("alt");

    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
      getCloudinary()
        .uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
          if (error || !result) {
            reject(new ApiError(502, "Falha no upload para o Cloudinary."));
            return;
          }
          resolve(result);
        })
        .end(buffer);
    });

    await connectDb();
    const media = await Media.create({
      filename: file.name,
      url: upload.secure_url,
      publicId: upload.public_id,
      type: "image",
      width: upload.width,
      height: upload.height,
      size: upload.bytes,
      alt: typeof alt === "string" ? alt : undefined,
      folder,
    });
    await logAction(session, "create", "Media", String(media._id));

    return ok(media, "Upload concluído.", undefined, 201);
  });
}
