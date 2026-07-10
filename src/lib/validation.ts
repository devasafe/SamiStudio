import { z } from "zod";

/** Schemas de validação da API (Docs/11 — Zod). */

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido (use letras minúsculas, números e hífens).");

const translations = z.record(z.string(), z.record(z.string(), z.string().optional())).optional();

/** Imagens devem vir do upload do painel (Cloudinary), nunca de link externo. */
const uploadedImage = z
  .string()
  .url()
  .refine((url) => url.startsWith("https://res.cloudinary.com/"), {
    message: "Use o botão de upload — links externos não são aceitos.",
  });

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(80),
  slug,
  icon: z.string().max(80).optional(),
  order: z.number().int().min(0).optional(),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

const seoSchema = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(180).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional(),
    canonical: z.string().optional(),
  })
  .optional();

export const projectCreateSchema = z.object({
  slug,
  title: z.string().min(1).max(160),
  description: z.string().max(5000).optional(),
  client: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  categoryId: z.string().length(24).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  coverImage: uploadedImage.optional(),
  gallery: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        order: z.number().optional(),
      })
    )
    .optional(),
  video: z
    .object({
      url: z.string().url().optional(),
      thumbnail: z.string().url().optional(),
      provider: z.string().optional(),
    })
    .optional(),
  beforeImage: z.string().url().optional(),
  afterImage: z.string().url().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  seo: seoSchema,
  translations,
});
export const projectUpdateSchema = projectCreateSchema.partial();

export const serviceCreateSchema = z.object({
  title: z.string().min(1).max(120),
  slug,
  description: z.string().max(5000).optional(),
  icon: z.string().max(80).optional(),
  coverImage: uploadedImage.optional(),
  gallery: z.array(z.string().url()).optional(),
  order: z.number().int().min(0).optional(),
  seo: seoSchema,
  translations,
});
export const serviceUpdateSchema = serviceCreateSchema.partial();

export const faqCreateSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(3000),
  category: z.string().max(80).optional(),
  order: z.number().int().min(0).optional(),
  translations,
});
export const faqUpdateSchema = faqCreateSchema.partial();

export const testimonialCreateSchema = z.object({
  name: z.string().min(1).max(120),
  company: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  photo: z.string().url().optional(),
  text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  translations,
});
export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export const settingsUpdateSchema = z.object({
  siteName: z.string().max(120).optional(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional(),
  address: z.string().max(300).optional(),
  whatsapp: z.string().max(30).optional(),
  instagram: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  facebook: z.string().url().optional(),
  youtube: z.string().url().optional(),
  behance: z.string().url().optional(),
  aboutPhoto: uploadedImage.optional(),
  seo: seoSchema,
  analytics: z.object({ gaMeasurementId: z.string().max(40).optional() }).optional(),
  heroProject: z.string().max(120).optional(),
  defaultLanguage: z.enum(["pt-BR", "en", "es"]).optional(),
  availableLanguages: z.array(z.enum(["pt-BR", "en", "es"])).optional(),
});

export const translationUpdateSchema = z.object({
  locale: z.enum(["pt-BR", "en", "es"]),
  content: z.record(z.string(), z.unknown()),
});
