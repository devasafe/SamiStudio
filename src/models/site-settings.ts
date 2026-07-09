import { Schema, model, models, type Model } from "mongoose";

export interface SiteSettingsDoc {
  siteName?: string;
  logo?: string;
  favicon?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  youtube?: string;
  behance?: string;
  seo?: { title?: string; description?: string; keywords?: string[]; ogImage?: string };
  analytics?: { gaMeasurementId?: string };
  heroProject?: string;
  defaultLanguage?: string;
  availableLanguages?: string[];
  updatedAt: Date;
  createdAt: Date;
}

const siteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    siteName: String,
    logo: String,
    favicon: String,
    phone: String,
    email: String,
    address: String,
    whatsapp: String,
    instagram: String,
    linkedin: String,
    facebook: String,
    youtube: String,
    behance: String,
    seo: { title: String, description: String, keywords: [String], ogImage: String },
    analytics: { gaMeasurementId: String },
    heroProject: String,
    defaultLanguage: { type: String, default: "pt-BR" },
    availableLanguages: { type: [String], default: ["pt-BR", "en", "es"] },
  },
  { timestamps: true }
);

export const SiteSettings: Model<SiteSettingsDoc> =
  models.SiteSettings ?? model<SiteSettingsDoc>("SiteSettings", siteSettingsSchema);
