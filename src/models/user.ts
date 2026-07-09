import { Schema, model, models, type Model } from "mongoose";

export interface UserDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "EDITOR";
  avatar?: string;
  status: "active" | "inactive";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "EDITOR"], default: "EDITOR" },
    avatar: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", userSchema);
