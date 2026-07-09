import type { NextRequest } from "next/server";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAuth(request);
    await connectDb();
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 24)));

    const [items, total] = await Promise.all([
      Media.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Media.countDocuments({ deletedAt: null }),
    ]);

    return ok(items, "OK", { page, limit, total, totalPages: Math.ceil(total / limit) });
  });
}
