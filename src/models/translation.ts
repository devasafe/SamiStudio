import { Schema, model, models, type Model } from "mongoose";

export interface TranslationDoc {
  /** Locale (pt-BR, en, es). Um documento por idioma. */
  locale: string;
  /** Overrides do dicionário de UI, mesma estrutura dos JSONs de i18n. */
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const translationSchema = new Schema<TranslationDoc>(
  {
    locale: { type: String, required: true, unique: true },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Translation: Model<TranslationDoc> =
  models.Translation ?? model<TranslationDoc>("Translation", translationSchema);
