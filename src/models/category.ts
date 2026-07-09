import { Schema, model, models, type Model } from "mongoose";

export interface CategoryDoc {
  name: string;
  slug: string;
  icon?: string;
  order: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Category: Model<CategoryDoc> =
  models.Category ?? model<CategoryDoc>("Category", categorySchema);
