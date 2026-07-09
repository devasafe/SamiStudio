import { Schema, model, models, type Model } from "mongoose";

export interface ServiceDoc {
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  coverImage?: string;
  gallery: string[];
  order: number;
  seo?: { title?: string; description?: string };
  translations?: Record<string, { title?: string; description?: string }>;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<ServiceDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    icon: { type: String },
    coverImage: { type: String },
    gallery: [String],
    order: { type: Number, default: 0 },
    seo: { title: String, description: String },
    translations: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Service: Model<ServiceDoc> =
  models.Service ?? model<ServiceDoc>("Service", serviceSchema);
