import { Schema, model, models, type Model } from "mongoose";

export interface FaqDoc {
  question: string;
  answer: string;
  category?: string;
  order: number;
  translations?: Record<string, { question?: string; answer?: string }>;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<FaqDoc>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String },
    order: { type: Number, default: 0 },
    translations: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Faq: Model<FaqDoc> = models.Faq ?? model<FaqDoc>("Faq", faqSchema);
