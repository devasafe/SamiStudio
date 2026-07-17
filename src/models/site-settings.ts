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
  /** Foto da Sami exibida na seção Sobre (upload via painel). */
  aboutPhoto?: string;
  /** Fotos da seção "Nossa essência" (página Sobre). */
  essencePhoto1?: string;
  essencePhoto2?: string;
  /** Foto ao lado do formulário (página Contato). */
  contactPhoto?: string;
  /** Horário de atendimento e complemento da localização (página Contato). */
  businessHours?: string;
  locationNote?: string;
  /** Assinatura e números da seção Sobre (editáveis no painel). */
  founderName?: string;
  founderRole?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  /** Faixa de números do fim da página Portfólio (editáveis no painel). */
  portfolioStat1Value?: string;
  portfolioStat1Label?: string;
  portfolioStat2Value?: string;
  portfolioStat2Label?: string;
  portfolioStat3Value?: string;
  portfolioStat3Label?: string;
  portfolioStat4Value?: string;
  portfolioStat4Label?: string;
  portfolioStat5Value?: string;
  portfolioStat5Label?: string;
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
    aboutPhoto: String,
    essencePhoto1: String,
    essencePhoto2: String,
    contactPhoto: String,
    businessHours: String,
    locationNote: String,
    founderName: String,
    founderRole: String,
    stat1Value: String,
    stat1Label: String,
    stat2Value: String,
    stat2Label: String,
    stat3Value: String,
    stat3Label: String,
    portfolioStat1Value: String,
    portfolioStat1Label: String,
    portfolioStat2Value: String,
    portfolioStat2Label: String,
    portfolioStat3Value: String,
    portfolioStat3Label: String,
    portfolioStat4Value: String,
    portfolioStat4Label: String,
    portfolioStat5Value: String,
    portfolioStat5Label: String,
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
