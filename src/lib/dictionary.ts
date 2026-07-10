import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { connectDb } from "@/lib/db";
import { Translation } from "@/models/translation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Merge profundo: overrides do CMS por cima do dicionário base. */
function deepMerge<T>(base: T, override: Record<string, unknown>): T {
  if (!isRecord(base) && !Array.isArray(base)) {
    return base;
  }
  const result: Record<string, unknown> | unknown[] = Array.isArray(base)
    ? [...(base as unknown[])]
    : { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    const current = (result as Record<string, unknown>)[key];
    if (isRecord(value) && (isRecord(current) || Array.isArray(current))) {
      (result as Record<string, unknown>)[key] = deepMerge(current, value);
    } else if (value !== undefined && value !== null && value !== "") {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result as T;
}

/**
 * Dicionário do site com overrides salvos no painel (Docs/12 — Traduções).
 * Sem banco, devolve o dicionário base.
 */
export const getMergedDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  const base = await getDictionary(locale);
  try {
    await connectDb();
    const override = await Translation.findOne({ locale }).lean();
    if (override && isRecord(override.content)) {
      return deepMerge(base, override.content);
    }
  } catch {
    // segue com o dicionário base
  }
  return base;
});
