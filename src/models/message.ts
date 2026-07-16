import { Schema, model, models, type Model } from "mongoose";

/** Mensagem enviada pelo formulário de contato do site (lida no painel). */
export interface MessageDoc {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  /** Marcada como lida pelo painel. */
  read: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Message: Model<MessageDoc> =
  models.Message ?? model<MessageDoc>("Message", messageSchema);
