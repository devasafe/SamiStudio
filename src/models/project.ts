import { Schema, model, models, type Model, Types } from "mongoose";

export interface GalleryItem {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  order?: number;
}

export interface ProjectSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

export interface ProjectDoc {
  slug: string;
  title: string;
  description?: string;
  client?: string;
  city?: string;
  country?: string;
  categoryId?: Types.ObjectId;
  year?: number;
  coverImage?: string;
  gallery: GalleryItem[];
  video?: { url?: string; thumbnail?: string; provider?: string };
  beforeImage?: string;
  afterImage?: string;
  checkpoint?: boolean;
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
    beforeImage: { type: String },
    afterImage: { type: String },
    checkpoint: { type: Boolean, default: false },
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
