import { Schema, model, models, type Model, Types } from "mongoose";

export interface GalleryItem {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  order?: number;
}

/** Um par de fotos da transformação, no comparador de arrastar. */
export interface BeforeAfterItem {
  before: string;
  after: string;
  /** Legenda opcional do par (ex.: "Fachada"). */
  label?: string;
  order?: number;
}

export interface ProjectSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

/** Etapa da obra — diferente de `status`, que é a publicação no site. */
export type ProjectStage = "concept" | "inProgress" | "done";

export interface ProjectDoc {
  slug: string;
  title: string;
  description?: string;
  client?: string;
  city?: string;
  country?: string;
  categoryId?: Types.ObjectId;
  year?: number;
  /** Área construída em m². */
  area?: number;
  stage?: ProjectStage;
  coverImage?: string;
  gallery: GalleryItem[];
  video?: { url?: string; thumbnail?: string; provider?: string };
  /** Liga a aba "Antes e Depois" no site e revela os pares no painel. */
  checkpoint?: boolean;
  beforeAfter?: BeforeAfterItem[];
  featured: boolean;
  status: "draft" | "published" | "archived";
  seo?: ProjectSeo;
  /** Traduções por locale (en, es) dos campos textuais. */
  translations?: Record<string, { title?: string; description?: string }>;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDoc>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    client: { type: String },
    city: { type: String },
    country: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    year: { type: Number },
    area: { type: Number },
    stage: { type: String, enum: ["concept", "inProgress", "done"] },
    coverImage: { type: String },
    gallery: [
      {
        url: { type: String, required: true },
        alt: String,
        width: Number,
        height: Number,
        order: Number,
      },
    ],
    video: { url: String, thumbnail: String, provider: String },
    checkpoint: { type: Boolean, default: false },
    beforeAfter: [
      {
        before: { type: String, required: true },
        after: { type: String, required: true },
        label: { type: String },
        order: { type: Number, default: 0 },
        _id: false,
      },
    ],
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      canonical: String,
    },
    translations: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Índices do Docs/10 (slug já é unique).
projectSchema.index({ featured: 1 });
projectSchema.index({ categoryId: 1 });
projectSchema.index({ status: 1 });

export const Project: Model<ProjectDoc> =
  models.Project ?? model<ProjectDoc>("Project", projectSchema);
