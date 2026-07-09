import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "@/lib/api/errors";

let configured = false;

/** Cliente Cloudinary configurado sob demanda (Docs/11 — Upload). */
export function getCloudinary(): typeof cloudinary {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new ApiError(503, "Upload não configurado (credenciais Cloudinary ausentes).");
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}
