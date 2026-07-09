import type { MetadataRoute } from "next";
import { localePath, locales } from "@/i18n/config";
import { connectDb } from "@/lib/db";
import { Project } from "@/models/project";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticPaths = ["/", "/sobre", "/servicos", "/portfolio", "/contato"];

/** Sitemap automático (Docs/13): rotas estáticas × idiomas + projetos publicados. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}${localePath(locale, path)}`,
        changeFrequency: "weekly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  try {
    await connectDb();
    const projects = await Project.find({ status: "published", deletedAt: null })
      .select("slug updatedAt")
      .lean();
    for (const project of projects) {
      for (const locale of locales) {
        entries.push({
          url: `${siteUrl}${localePath(locale, `/portfolio/${project.slug}`)}`,
          lastModified: project.updatedAt,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // Sem banco o sitemap sai apenas com as rotas estáticas.
  }

  return entries;
}
