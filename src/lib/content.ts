import { cache } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { connectDb } from "@/lib/db";
import { safeImageUrl } from "@/lib/images";
import { toMasonryPhotos } from "@/lib/gallery";
import { placeholderProjects } from "@/lib/placeholder-projects";
import { Category } from "@/models/category";
import { Faq } from "@/models/faq";
import { Project, type ProjectDoc } from "@/models/project";
import { Service } from "@/models/service";
import { Testimonial } from "@/models/testimonial";
import type { PortfolioItem } from "@/types/project";

/**
 * Conteúdo do site vindo do CMS (Docs/10), com fallback para os
 * placeholders/dicionários enquanto o banco estiver vazio.
 * Mutações no admin revalidam as páginas (revalidatePath na API).
 */

function translated<
  T extends { translations?: Record<string, Record<string, string | undefined>> },
>(doc: T, locale: Locale, field: string, base: string | undefined): string | undefined {
  if (locale === "pt-BR") {
    return base;
  }
  return doc.translations?.[locale]?.[field] ?? base;
}

function toPortfolioItem(doc: ProjectDoc, locale: Locale, categoryName?: string): PortfolioItem {
  const title = translated(doc, locale, "title", doc.title) ?? doc.title;
  return {
    slug: doc.slug,
    title,
    description: translated(doc, locale, "description", doc.description),
    client: doc.client,
    city: doc.city,
    year: doc.year,
    coverImage: safeImageUrl(doc.coverImage),
    categoryLabel: categoryName,
    gallery: toMasonryPhotos(doc.gallery, title),
    // Só com o checkpoint ligado: as fotos podem ter ficado no banco de uma
    // marcação anterior, e não devem reaparecer sozinhas no site.
    beforeAfter: doc.checkpoint ? (doc.beforeAfter ?? []) : [],
  };
}

function placeholderItems(dictionary: Dictionary): PortfolioItem[] {
  return placeholderProjects.map((p) => ({
    slug: p.slug,
    title: `${dictionary.categories[p.category]} · ${p.city}`,
    city: p.city,
    year: p.year,
    coverClass: p.coverClass,
    categoryLabel: dictionary.categories[p.category],
  }));
}

export const getPublishedProjects = cache(
  async (locale: Locale, dictionary: Dictionary): Promise<PortfolioItem[]> => {
    try {
      await connectDb();
      const [projects, categories] = await Promise.all([
        Project.find({ status: "published", deletedAt: null }).sort({ createdAt: -1 }).lean(),
        Category.find({ deletedAt: null }).lean(),
      ]);
      if (projects.length > 0) {
        const categoryNames = new Map(categories.map((c) => [String(c._id), c.name]));
        return projects.map((doc) =>
          toPortfolioItem(doc, locale, categoryNames.get(String(doc.categoryId)))
        );
      }
    } catch {
      // fallback
    }
    return placeholderItems(dictionary);
  }
);

export const getProjectBySlug = cache(
  async (slug: string, locale: Locale, dictionary: Dictionary): Promise<PortfolioItem | null> => {
    try {
      await connectDb();
      const doc = await Project.findOne({ slug, status: "published", deletedAt: null })
        .populate<{ categoryId: { name: string } | null }>("categoryId")
        .lean();
      if (doc) {
        return toPortfolioItem(doc as unknown as ProjectDoc, locale, doc.categoryId?.name);
      }
    } catch {
      // fallback
    }
    return placeholderItems(dictionary).find((item) => item.slug === slug) ?? null;
  }
);

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
  /** Imagem de capa cadastrada no painel (Cloudinary). */
  coverImage?: string;
}

export const getServices = cache(
  async (locale: Locale, dictionary: Dictionary): Promise<ServiceItem[]> => {
    try {
      await connectDb();
      const services = await Service.find({ deletedAt: null }).sort({ order: 1 }).lean();
      if (services.length > 0) {
        return services.map((doc) => ({
          title: translated(doc, locale, "title", doc.title) ?? doc.title,
          description: translated(doc, locale, "description", doc.description) ?? "",
          icon: doc.icon,
          coverImage: safeImageUrl(doc.coverImage),
        }));
      }
    } catch {
      // fallback
    }
    return dictionary.sections.services.items;
  }
);

export interface TestimonialItem {
  name: string;
  role?: string;
  company?: string;
  text: string;
  rating?: number;
  photo?: string;
}

/**
 * Depoimentos cadastrados no painel. Sem nenhum, devolve lista vazia e a
 * seção não é exibida — depoimento de exemplo seria prova social inventada.
 */
export const getTestimonials = cache(async (locale: Locale): Promise<TestimonialItem[]> => {
  try {
    await connectDb();
    const docs = await Testimonial.find({ deletedAt: null })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return docs.map((doc) => ({
      name: doc.name,
      role: doc.role,
      company: doc.company,
      text: translated(doc, locale, "text", doc.text) ?? doc.text,
      rating: doc.rating,
      photo: safeImageUrl(doc.photo),
    }));
  } catch {
    return [];
  }
});

export interface FaqItem {
  question: string;
  answer: string;
}

export const getFaqs = cache(async (locale: Locale, dictionary: Dictionary): Promise<FaqItem[]> => {
  try {
    await connectDb();
    const faqs = await Faq.find({ deletedAt: null }).sort({ order: 1 }).lean();
    if (faqs.length > 0) {
      return faqs.map((doc) => ({
        question: translated(doc, locale, "question", doc.question) ?? doc.question,
        answer: translated(doc, locale, "answer", doc.answer) ?? doc.answer,
      }));
    }
  } catch {
    // fallback
  }
  return dictionary.sections.faq.items;
});
