import { Schema, model, models, type Model } from "mongoose";

export interface TestimonialDoc {
  name: string;
  company?: string;
  role?: string;
  photo?: string;
  text: string;
  rating?: number;
  order: number;
  featured: boolean;
  translations?: Record<string, { text?: string; role?: string }>;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<TestimonialDoc>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String },
    role: { type: String },
    photo: { type: String },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    translations: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Testimonial: Model<TestimonialDoc> =
  models.Testimonial ?? model<TestimonialDoc>("Testimonial", testimonialSchema);
