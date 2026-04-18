import mongoose, { Schema, Document, Types } from "mongoose";
import { PROGRAM_CATEGORIES } from "../validators/program.validator";

export interface IWorkoutProgram extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IWorkoutProgram>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: {
      type: String,
      enum: PROGRAM_CATEGORIES,
      default: "general",
    },
  },
  { timestamps: true }
);

export const WorkoutProgram = mongoose.model<IWorkoutProgram>("WorkoutProgram", schema);
