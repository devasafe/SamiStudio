import { Schema, model, models, type Model, Types } from "mongoose";

export interface LogDoc {
  user: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: Date;
}

const logSchema = new Schema<LogDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Log: Model<LogDoc> = models.Log ?? model<LogDoc>("Log", logSchema);
