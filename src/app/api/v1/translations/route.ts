import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { logAction } from "@/lib/api/audit";
import { ok, withErrorHandling } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/guard";
import { connectDb } from "@/lib/db";
import { translationUpdateSchema } from "@/lib/validation";
import { Translation } from "@/models/translation";

/** Overrides de tradução da UI por locale (Docs/10 — Translations). */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await connectDb();
    const locale = request.nextUrl.searchParams.get("locale");
    if (locale) {
      const translation = await Translation.findOne({ locale });
      return ok(translation);
    }
    const translations = await Translation.find();
    return ok(translations);
  });
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireAuth(request);
    await connectDb();
    const { locale, content } = translationUpdateSchema.parse(await request.json());
    const translation = await Translation.findOneAndUpdate(
      { locale },
      { content },
      { new: true, upsert: true }
    );
    await logAction(session, "update", "Translation", locale);
    // Conteúdo mudou: regenera as páginas do site.
    revalidatePath("/", "layout");
    return ok(translation, "Traduções atualizadas.");
  });
}
