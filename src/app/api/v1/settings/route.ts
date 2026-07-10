import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { logAction } from "@/lib/api/audit";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { connectDb } from "@/lib/db";
import { settingsUpdateSchema } from "@/lib/validation";
import { SiteSettings } from "@/models/site-settings";

/** Configurações globais (Docs/10 — documento único). */
export async function GET() {
  return withErrorHandling(async () => {
    await connectDb();
    const settings = await SiteSettings.findOne();
    return ok(settings);
  });
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    await connectDb();
    const data = settingsUpdateSchema.parse(await request.json());
    const settings = await SiteSettings.findOneAndUpdate({}, data, { new: true, upsert: true });
    await logAction(session, "update", "SiteSettings", String(settings._id));
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(settings, "Configurações atualizadas.");
  });
}
