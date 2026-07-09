import { cache } from "react";
import { connectDb } from "@/lib/db";
import { SiteSettings, type SiteSettingsDoc } from "@/models/site-settings";

/**
 * Configurações do site (CMS) com cache por request.
 * Sem banco configurado/acessível o site degrada para os fallbacks de env.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettingsDoc | null> => {
  try {
    await connectDb();
    return await SiteSettings.findOne().lean<SiteSettingsDoc>();
  } catch {
    return null;
  }
});
