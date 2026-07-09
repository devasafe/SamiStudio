import { Schema, model, models, type Model } from "mongoose";

export interface MediaDoc {
  filename: string;
  url: string;
  publicId: string;
  type: "image" | "video" | "pdf" | "model" | "texture" | "hdri";
  width?: number;
  height?: number;
  size?: number;
  alt?: string;
  folder?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<MediaDoc>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video", "pdf", "model", "texture", "hdri"],
      required: true,
    },
    width: Number,
    height: Number,
    size: Number,
    alt: String,
    folder: String,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Media: Model<MediaDoc> = models.Media ?? model<MediaDoc>("Media", mediaSchema);
